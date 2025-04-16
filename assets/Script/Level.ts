import { _decorator, CCInteger, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
import { Square } from './Square';

const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    @property({ type: CCInteger, range: [1, 20, 1], slide: true, tooltip: "Số lượng loại được load" })
    tileCountConfig: number = 5;

    private imageFruits: SpriteFrame[] = []; // Danh sách các ảnh hoa quả
    private fruitIndex: number = 0;
    private tileList: Node[][] = []; // Mảng 2 chiều chứa các ô
    private readonly GROUP_SIZE: number = 3; // Nhóm số lượng tile mỗi lần gán ảnh
    private readonly TILES_PER_GROUP: number = 15; // Số lượng tile mỗi lần gắn ảnh

    public numberOfTiles: number = 0;

    /**
     * Khởi tạo level - hàm chính để bắt đầu game
     * Load ảnh hoa quả, thiết lập và phân phối các ô
     * @returns Promise<void>
     */
    public async initLevel(): Promise<void> {
        try {
            const assets = await this.loadFruits();
            this.setupFruits(assets);
            await this.setupTiles();
        } catch (error) {
            console.error('Lỗi khi khởi tạo level:', error);
            throw error;
        }
    }

    /**
     * Load các ảnh hoa quả từ thư mục resources
     * @returns Promise<SpriteFrame[]> - Danh sách các sprite frame của hoa quả
     */
    private loadFruits(): Promise<SpriteFrame[]> {
        return new Promise((resolve, reject) => {
            resources.loadDir('Fruits', SpriteFrame, (err, assets) => {
                if (err) reject(err);
                else resolve(assets);
            });
        });
    }

    /**
     * Thiết lập danh sách hoa quả sẽ sử dụng trong level
     * @param assets - Danh sách các sprite frame đã load
     */
    private setupFruits(assets: SpriteFrame[]): void {
        const shuffledAssets = this.shuffleArray([...assets]);
        const maxTypes = Math.min(this.tileCountConfig, assets.length);
        this.imageFruits = shuffledAssets.slice(0, maxTypes);
    }

    /**
     * Thiết lập và phân phối các ô trong level
     * Kiểm tra số lượng ô có đủ để tạo thành các nhóm hay không
     */
    private async setupTiles(): Promise<void> {
        this.numberOfTiles = this.getTilesCount();
        
        if (this.numberOfTiles % this.GROUP_SIZE !== 0) {
            console.warn('Số lượng ô không đủ.', this.numberOfTiles);
            return;
        }

        while (this.tileList.length > 0) {
            const tileGroup = this.tileList.shift();
            if (tileGroup) {
                this.assignImagesToNodes(tileGroup);
            }
        }
    }

    /**
     * Đếm số lượng ô (Tiles) trong scene và tổ chức thành mảng 2 chiều
     * @returns number - Tổng số ô trong level
     */
    private getTilesCount(): number {
        let count = 0;
        this.tileList = [];

        //Đệ quy
        const collectTiles = (node: Node): void => {
            for (const child of node.children) {
                if (child.getComponent(Square)) {
                    const row = Math.floor(count / this.TILES_PER_GROUP);
                    if (!this.tileList[row]) {
                        this.tileList[row] = [];
                    }
                    this.tileList[row].push(child);
                    count++;
                }
                collectTiles(child);
            }
        };

        collectTiles(this.node);
        return count;
    }

    /**
     * Phân phối ảnh cho các nhóm ô
     * @param tiles - Danh sách các ô cần gán ảnh
     */
    private assignImagesToNodes(tiles: Node[]): void {
        console.log(">>>>1", tiles.length);
        while (tiles.length >= this.GROUP_SIZE) {
            const fruit = this.imageFruits[this.fruitIndex];
            this.fruitIndex = (this.fruitIndex + 1) % this.imageFruits.length;
            console.log(">>>>3",fruit.name, this.fruitIndex);
            if (!fruit) break;
            this.assignImageToGroup(fruit, tiles);
        }
        console.log(">>>>2", tiles.length);
    }

    /**
     * Gán ảnh cho một nhóm ô cụ thể
     * @param spriteFrame - Ảnh cần gán
     * @param tiles - Danh sách các ô trong nhóm
     */
    private assignImageToGroup(spriteFrame: SpriteFrame, tiles: Node[]): void {
        this.shuffleArray(tiles);

        for (let i = 0; i < this.GROUP_SIZE; i++) {
            const randomIndex = Math.floor(Math.random() * tiles.length);
            const tile = tiles.splice(randomIndex, 1)[0];
            
            const spriteNode = tile.getChildByName('TileImage');
            if (spriteNode) {
                const sprite = spriteNode.getComponent(Sprite);
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
            }
            
            tile.name = spriteFrame.name || 'Unnamed';
        }
    }

    /**
     * Xáo trộn mảng theo thuật toán Fisher-Yates
     * @param array - Mảng cần xáo trộn
     * @returns T[] - Mảng đã được xáo trộn
     */
    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}