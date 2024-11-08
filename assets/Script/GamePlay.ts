import { _decorator, Component, Node, Vec3, ParticleSystem2D, Input, input, EventTouch, Camera, Collider2D, PhysicsSystem2D } from 'cc';
import { Square } from './Square';
const { ccclass, property } = _decorator;

@ccclass('GamePlay')
export class GamePlay extends Component {
    public static Instance: GamePlay;

    @property({ type: Node, tooltip: "Map chứa các ô" })
    tileMapLevel: Node = null;

    @property({ type: Node, tooltip: "Danh sách các ô trong khu vực xếp" })
    tileMatchingList: Node[] = [];

    // @property({ type: Vec3, tooltip: "Danh sách các vị trí để xếp ô" })
    // slotMatchingArea: Node

    private slotTiles: Node[] = []; // Số lượng các ô được bấm
    private slotPositions: Vec3[] = []; // Số lượng các ô khung chọn
    private numberOfTiles: number; // Số lượng ô còn lại trên màn hình.

    // Khởi tạo vị trí các ô và đếm tổng số lượng ô trong cảnh
    onLoad() {
        GamePlay.Instance = this;

        this.initPositions();
        this.numberOfTiles = this.getTilesCount();
    }

    // Kiểm tra các điều kiện thua/thắng mỗi khung hình
    update() {
        // if (this.matchArrayIsFull()) {
        //     console.log("Level lost.");
        // }
        // this.checkWinCondition();
    }

    log() {
        console.log(">>>slotTiles: ", this.slotTiles);
        console.log(">>>numberOfTiles: ", this.numberOfTiles);
    }

    // Khởi tạo danh sách vị trí các ô trong `tileMatchingList`
    private initPositions() {
        this.slotPositions = this.tileMatchingList.map(tile => tile.worldPosition.clone());
    }

    // Lấy số lượng ô trong cảnh để khởi tạo `numberOfTiles`
    private getTilesCount(): number {
        let count = 0;

        // Đệ quy tiếp tục duyệt qua các node
        const countChildNodes = (node: Node) => {
            node.children.forEach(child => {
                if (child.getComponent(Square)) {
                    count++;
                }

                countChildNodes(child);
            });
        };

        // Bắt đầu đếm từ `tileMapLevel`
        countChildNodes(this.tileMapLevel);

        return count;
    }

    // Hàm thêm node vào `slotTiles`
    public addTileToSlot(tile: Node) {
        if (this.slotTiles.some(t => t === tile)) return;

        this.slotTiles.push(tile);
    }

    //Xử lý sự kiện nhấp chuột vào ô, kiểm tra và di chuyển ô
    private handleTileClick() {
        if(this.slotTiles.length > 0){
            const tileNode = this.slotTiles.shift();
            if (!this.isTileOverlapped(tileNode)) {
                const validPos = this.getValidPosition(tileNode);
                if (validPos !== -1) {
                    if (validPos < this.tileMatchingList.length) {
                        this.rearrangeMatchingArrayFrom(validPos);
                    }
                    this.moveTileToMatchingArea(tileNode, this.slotPositions[validPos]);
                    this.numberOfTiles--;
                    this.tileMatchingList.splice(validPos, 0, tileNode);
                    this.checkMatch(tileNode);
                }
            }
        }
    }

    // Kiểm tra nếu ô bị che khuất bởi ô khác
    private isTileOverlapped(tile: Node): boolean {
        const collider = tile.getComponent(Collider2D);
        if (!collider) return false;

        const otherColliders = PhysicsSystem2D.instance.testAABB(collider.worldAABB);
        return otherColliders.some(other => other !== collider);
    }

    // Tìm vị trí hợp lệ để xếp ô vào khu vực xếp
    private getValidPosition(tile: Node): number {
        let count = 0, tilePos = 0;
        for (let i = 0; i < this.tileMatchingList.length; i++) {
            if (tile.name === this.tileMatchingList[i].name) {
                count++;
                tilePos = i;
            }
        }
        return count ? tilePos + 1 : this.tileMatchingList.length;
    }

    // Di chuyển các ô trong danh sách để lấp đầy chỗ trống sau hợp nhất
    private rearrangeMatchingArrayFrom(index: number) {
        if (index === 0) return;
        for (let i = this.tileMatchingList.length - 1; i >= index; i--) {
            this.moveTileToMatchingArea(this.tileMatchingList[i], this.slotPositions[i + 1]);
        }
    }

    // Di chuyển ô vào vị trí cụ thể trong khu vực xếp
    private moveTileToMatchingArea(tile: Node, dest: Vec3) {
        tile.setPosition(dest);
    }

    // Kiểm tra nếu có ba ô giống nhau liên tiếp, hợp nhất chúng nếu có
    private checkMatch(tile: Node) {
        const tileName = tile.name;
        let count = 0;

        for (let i = 0; i < this.tileMatchingList.length; i++) {
            if (this.tileMatchingList[i].name === tileName) {
                count++;
                if (count === 3) {
                    this.playMatchingAnimation(i - 2, i);
                    this.tileMatchingList.splice(i - 2, 3);
                    this.fillTile();
                    break;
                }
            }
        }
    }

    // Phát hiệu ứng khi ba ô hợp nhất và xóa chúng
    private playMatchingAnimation(startIndex: number, endIndex: number) {
        for (let i = startIndex; i <= endIndex; i++) {
            const tile = this.tileMatchingList[i];
            tile.setScale(Vec3.ZERO);
            tile.destroy();
        }
    }

    // Lấp đầy khu vực xếp khi ô hợp nhất bị xóa
    private fillTile() {
        this.tileMatchingList.forEach((tile, index) => {
            tile.setPosition(this.slotPositions[index]);
        });
    }

    // Kiểm tra nếu khu vực xếp đã đầy
    private matchArrayIsFull(): boolean {
        return this.tileMatchingList.length >= 7;
    }


    // Kiểm tra điều kiện thắng: nếu hết ô và không còn ô nào trong khu vực xếp
    private checkWinCondition() {
        if (this.numberOfTiles === 0 && this.tileMatchingList.length === 0) {
            console.log("Level Completed.");
        }
    }

}


