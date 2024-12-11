import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Square } from './Square';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    @property({ type: Number, range: [0, 6, 1], slide: true })
    tileCountConfig: number = 0;

    @property({ type: [SpriteFrame], tooltip: "Danh sách các ảnh hoa quả" })
    imageFruirt: SpriteFrame[] = [];

    private tileList: Node[] = [];
    private readonly groupSize: number = 3; // Nhóm số lượng tile mỗi lần gán ảnh

    protected onLoad(): void {
        GameManager.numberOfTiles = this.getTilesCount();

        if (GameManager.numberOfTiles % this.groupSize === 0) {
            this.assignImagesToNodes();
        } else {
            console.warn('Số lượng ô không đủ.', GameManager.numberOfTiles);
        }
    }

    // Đếm số lượng ô (Tiles) trong scene
    private getTilesCount(): number {
        let count = 0;

        // Đệ quy
        const collectTiles = (node: Node) => {
            node.children.forEach(child => {
                if (child.getComponent(Square)) {
                    this.tileList.push(child);
                    count++;
                }
                collectTiles(child);
            });
        };

        collectTiles(this.node);
        return count;
    }

    // Gán ảnh ngẫu nhiên cho từng nhóm ô
    private assignImagesToNodes(): void {
        while (this.tileList.length >= this.groupSize) {
            const randomFruit = this.getRandomArr(this.imageFruirt);
            if (!randomFruit) break;

            this.assignImageToGroup(randomFruit);
        }
    }

    // Gán ảnh cho một nhóm tile
    private assignImageToGroup(spriteFrame: SpriteFrame): void {
        for (let i = 0; i < this.groupSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.tileList.length);
            const tile = this.tileList.splice(randomIndex, 1)[0];

            const spriteNode = tile.getChildByName('TileImage');
            spriteNode.getComponent(Sprite).spriteFrame = spriteFrame;

            tile.name = spriteFrame.name || 'Unnamed';
        }
    }

    // Lấy phần tử ngẫu nhiên từ mảng
    private getRandomArr(array: SpriteFrame[]): SpriteFrame | undefined {
        if (array.length === 0) return undefined;
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}