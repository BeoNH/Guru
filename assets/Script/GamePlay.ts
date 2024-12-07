import { _decorator, Component, Node, Vec3, ParticleSystem2D, Input, input, EventTouch, Camera, Collider2D, PhysicsSystem2D } from 'cc';
import { Square } from './Square';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('GamePlay')
export class GamePlay extends Component {
    public static Instance: GamePlay;

    @property({ type: Node, tooltip: "Map chứa các ô" })
    tileMapLevel: Node = null;

    @property({ type: Node, tooltip: "Vị trí các ô để hợp nhất" })
    matchingPosition: Node = null;

    // @property({ type: Vec3, tooltip: "Danh sách các vị trí để xếp ô" })
    // slotMatchingArea: Node

    private tileMatchingList: Node[] = []; // Danh sách các ô trong khu vực xếp
    private slotTiles: Node[] = []; // Số lượng các ô được bấm
    private slotPositions: Vec3[] = []; // Số lượng các ô khung chọn
    private numberOfTiles: number; // Số lượng ô còn lại trên màn hình.

    // Khởi tạo vị trí các ô và đếm tổng số lượng ô trong cảnh
    onLoad() {
        GamePlay.Instance = this;

        this.initPositions();
        // this.numberOfTiles = GameManager.numberOfTiles;
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
        console.log(">>>tileMatchingList: ", this.tileMatchingList);
        console.log(">>>slotPositions: ", this.slotPositions);
    }

    fakeUpdate() {
        // this.schedule(() => { this.fillTile(); }, 1)
        this.handleTileClick();
    }

    // Khởi tạo danh sách vị trí các ô trong `tileMatchingList`
    private initPositions() {
        this.slotPositions = this.matchingPosition.children.map(tile => tile.worldPosition.clone());
    }

    // Hàm thêm node vào `slotTiles`
    public addTileToSlot(tile: Node) {
        if (this.slotTiles.some(t => t === tile)) return;

        this.slotTiles.push(tile);
    }

    //Xử lý sự kiện nhấp chuột vào ô, kiểm tra và di chuyển ô
    private handleTileClick() {
        if (this.slotTiles.length > 0) {
            const tileNode = this.slotTiles.shift();
            const validPos = this.getValidPosition(tileNode);
            if (validPos !== -1) {
                if (validPos < this.tileMatchingList.length) {
                    this.rearrangeMatchingArrayFrom(validPos);
                }
                this.moveTileToMatchingArea(tileNode, this.slotPositions[validPos]);
                this.numberOfTiles--;
                this.tileMatchingList.splice(validPos, 0, tileNode);
                this.checkMatch(tileNode);
                // this.fillTile();
                return;
            }
        }
        this.checkWinCondition();
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

    // Di chuyển các ô trong danh sách để xếp theo đúng loại
    private rearrangeMatchingArrayFrom(index: number) {
        if (index === 0) return;
        for (let i = this.tileMatchingList.length - 1; i >= index; i--) {
            this.moveTileToMatchingArea(this.tileMatchingList[i], this.slotPositions[i + 1]);
        }
    }

    // Di chuyển ô vào vị trí cụ thể trong khu vực xếp
    private moveTileToMatchingArea(tile: Node, dest: Vec3) {
        tile.getComponent(Square).moveTileToWPos(dest);
    }

    // Kiểm tra nếu có ba ô giống nhau liên tiếp, hợp nhất chúng nếu có
    private checkMatch(tile: Node) {
        let count = 0;

        for (let i = 0; i < this.tileMatchingList.length; i++) {
            if (this.tileMatchingList[i].name === tile.name) {
                count++;
                if (count === 3) {
                    this.playMatchingAnimation(i - 2, i);
                    this.tileMatchingList.splice(i - 2, 3);
                    // this.fillTile();
                    break;
                }
            }
        }
    }

    // Phát hiệu ứng khi ba ô hợp nhất và xóa chúng
    private playMatchingAnimation(startIndex: number, endIndex: number) {
        for (let i = startIndex; i <= endIndex; i++) {
            const tile = this.tileMatchingList[i];
            this.scheduleOnce(() => {
                tile.getComponent(Square).scaleDestroy();
            }, GameManager.timeMove);
        }
    }

    // Lấp đầy khu vực xếp khi ô hợp nhất bị xóa
    private fillTile() {
        console.log(">>>>>fill")
        this.tileMatchingList.forEach((tile, index) => {
            tile.setWorldPosition(this.slotPositions[index]);
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


