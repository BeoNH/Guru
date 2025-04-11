import { _decorator, CCInteger, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
import { Square } from './Square';

const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    @property({ type: CCInteger, range: [1, 20, 1], slide: true, tooltip: "Số lượng loại được load" })
    tileCountConfig: number = 5;

    private imageFruirt: SpriteFrame[] = []; // Danh sách các ảnh hoa quả
    private tileList: Node[][] = []; // Mảng 2 chiều chứa các ô
    private readonly groupSize: number = 3; // Nhóm số lượng tile mỗi lần gán ảnh
    private readonly numberOfTilesGroup: number = 9; // Số lượng tile mỗi lần gắn ảnh

    public numberOfTiles: number = 0;

    // Load ảnh hoa quả, đếm số lượng ô và gắn ảnh
    public initLevel(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.loadDir('Fruits', SpriteFrame, (err, assets) => {
                if (err) {
                    reject(err);
                    return;
                }

                const newAssets = this.shuffleArray([...assets]);
                const maxTypes = Math.min(this.tileCountConfig, assets.length);
                this.imageFruirt = newAssets.slice(0, maxTypes);


                this.numberOfTiles = this.getTilesCount();
                if (this.numberOfTiles % this.groupSize === 0) {
                    while (this.tileList.length > 0) {
                        let array = this.tileList.splice(0, 1)[0];
                        this.assignImagesToNodes(array);
                    }
                } else {
                    console.warn('Số lượng ô không đủ.', this.numberOfTiles);
                }
                resolve();
            });
        });
    }


    // Đếm số lượng ô (Tiles) trong scene
    private getTilesCount(): number {
        let count = 0;
        this.tileList = [];

        // Đệ quy
        const collectTiles = (node: Node) => {
            node.children.forEach(child => {
                if (child.getComponent(Square)) {
                    const row = Math.floor(count / this.numberOfTilesGroup);
                    if (!this.tileList[row]) {
                        this.tileList[row] = [];
                    }
                    this.tileList[row].push(child);
                    count++;
                }
                collectTiles(child);
            });
        };

        collectTiles(this.node);
        return count;
    }

    // Gán ảnh ngẫu nhiên cho từng nhóm ô
    private assignImagesToNodes(array: Node[]): void {
        let currentFruitIndex = 0;

        while (array.length >= this.groupSize) {
            const fruit = this.imageFruirt[currentFruitIndex];
            currentFruitIndex = (currentFruitIndex + 1) % this.imageFruirt.length;
            if (!fruit) break;

            this.assignImageToGroup(fruit, array);
        }
    }

    // Gán ảnh cho một nhóm tile
    private assignImageToGroup(spriteFrame: SpriteFrame, array: Node[]): void {
        array = this.shuffleArray(array);

        console.log(">>>>1", array.length);
        for (let i = 0; i < this.groupSize; i++) {
            const randomIndex = Math.floor(Math.random() * array.length);
            const tile = array.splice(randomIndex, 1)[0];

            const spriteNode = tile.getChildByName('TileImage');
            spriteNode.getComponent(Sprite).spriteFrame = spriteFrame;

            tile.name = spriteFrame.name || 'Unnamed';
        }
        console.log(">>>>2", array.length);
    }

    // Xáo trộn mảng
    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}