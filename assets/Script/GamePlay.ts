import { _decorator, Component, Node, Vec3, ParticleSystem2D, Input, input, EventTouch, Camera, Collider2D, PhysicsSystem2D } from 'cc';
import { Square } from './Square';
const { ccclass, property } = _decorator;

@ccclass('GamePlay')
export class GamePlay extends Component {

    @property({ type: Node, tooltip: "Map chứa các ô" })
    tileMapLevel: Node = null;

    @property({ type: Node, tooltip: "Danh sách các ô trong khu vực xếp" })
    tileMatchingList: Node[] = [];
    
    @property({ type: Vec3, tooltip: "Danh sách các vị trí để xếp ô" })
    slotPositions: Vec3[] = [];

    private numberOfTiles: number; // Số lượng ô còn lại trên màn hình.

    // Khởi tạo vị trí các ô và đếm tổng số lượng ô trong cảnh
    onLoad() {
        this.initPositions();
        this.numberOfTiles = this.getTilesCount();
    }

    // Kiểm tra các điều kiện thua/thắng mỗi khung hình
    update() {
        if (this.matchArrayIsFull()) {
            console.log("Level lost.");
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

    // Kiểm tra nếu khu vực xếp đã đầy
    private matchArrayIsFull(): boolean {
        return this.tileMatchingList.length >= 7;
    }

    // Kiểm tra nếu ô bị che khuất bởi ô khác
    private isTileOverlapped(tile: Node): boolean {
        const collider = tile.getComponent(Collider2D);
        if (!collider) return false;

        const otherColliders = PhysicsSystem2D.instance.testAABB(collider.worldAABB);
        return otherColliders.some(other => other !== collider);
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

    // Khởi tạo các vị trí cố định trong khu vực xếp cho các ô
    private initPositions() {
        this.slotPositions = [
            new Vec3(-1.5, -2.5, 0),
            new Vec3(-1, -2.5, 0),
            new Vec3(-0.5, -2.5, 0),
            new Vec3(0, -2.5, 0),
            new Vec3(0.5, -2.5, 0),
            new Vec3(1, -2.5, 0),
            new Vec3(1.5, -2.5, 0)
        ];
    }

    // Kiểm tra điều kiện thắng: nếu hết ô và không còn ô nào trong khu vực xếp
    private checkWinCondition() {
        if (this.numberOfTiles === 0 && this.tileMatchingList.length === 0) {
            console.log("Level Completed.");
        }
    }

    // Di chuyển ô vào vị trí cụ thể trong khu vực xếp
    private moveTileToMatchingArea(tile: Node, dest: Vec3) {
        tile.setPosition(dest);
    }

    // Di chuyển các ô trong danh sách để lấp đầy chỗ trống sau hợp nhất
    private rearrangeMatchingArrayFrom(index: number) {
        if (index === 0) return;
        for (let i = this.tileMatchingList.length - 1; i >= index; i--) {
            this.moveTileToMatchingArea(this.tileMatchingList[i], this.slotPositions[i + 1]);
        }
    }

    // Lấy số lượng ô trong cảnh để khởi tạo `numberOfTiles`
    private getTilesCount(): number {
        return this.node.children.filter(child => child.getComponent(Square)).length;
    }
}


