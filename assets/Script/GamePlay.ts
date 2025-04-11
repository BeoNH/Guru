import { _decorator, Component, Node, Vec3, resources, Prefab, instantiate, v3, tween, Label } from 'cc';
import { Square } from './Square';
import { GameManager } from './GameManager';
import { NumberScrolling } from './NumberScrolling';
import { AudioController } from './AudioController';
import { Level } from './Level';
const { ccclass, property } = _decorator;

@ccclass('GamePlay')
export class GamePlay extends Component {
    public static Instance: GamePlay;

    @property({ type: Node, tooltip: "Map chứa các ô" })
    tileMapLevel: Node = null;

    @property({ type: Node, tooltip: "Vị trí các ô để hợp nhất" })
    matchingPosition: Node = null;

    @property({ type: Node, tooltip: "Node chứa các ô hợp nhất" })
    matchingArr: Node = null;

    @property({ type: NumberScrolling, tooltip: "điểm" })
    private score_label: NumberScrolling = null;

    @property({ type: Node, tooltip: "Popup Gameover" })
    private popupGameover: Node = null;

    // @property({ type: Vec3, tooltip: "Danh sách các vị trí để xếp ô" })
    // slotMatchingArea: Node

    private listLevels: Prefab[] = []; // Danh sách các level trong game
    private level: Node = null; // Level hiện tại
    private tileMatchingList: Node[] = []; // Danh sách các ô trong khu vực xếp
    private slotTiles: Node[] = []; // Số lượng các ô được bấm
    private slotPositions: Vec3[] = []; // Số lượng các ô khung chọn
    private numberOfTiles: number; // Số lượng ô còn lại trên màn hình.
    private score: number = 0; // Điểm đạt đc mỗi phiên

    // Khởi tạo vị trí các ô và đếm tổng số lượng ô trong cảnh
    onLoad() {
        GamePlay.Instance = this;
    }

    // Kiểm tra các điều kiện thua/thắng mỗi khung hình
    update() {

    }

    protected onEnable(): void {
        this.initPositions();
        this.loadMapLevel()
            .then(() => {
                this.resetGame();
                this.score = 0;
                this.score_label.setValue(this.score);
            })
            .catch(err => {
                console.error("Không thể load danh sách level:\n", err);
            });
    }

    log() {
        console.log(">>>slotTiles: ", this.slotTiles);
        console.log(">>>tileMatchingList: ", this.tileMatchingList);
        console.log(">>>slotPositions: ", this.slotPositions);
        console.log(">>>numberOfTiles: ", this.numberOfTiles);
    }

    // Đặt lại mặc định sau mỗi phiêu chơi
    private async resetGame() {
        try {
            this.tileMatchingList = [];
            this.slotTiles = [];
            this.unscheduleAllCallbacks();        
            this.popupGameover.active = false;
            this.popupGameover.getChildByPath(`nextLevel`).active = false;
            this.popupGameover.getChildByPath(`gameOver`).active = false;
            this.matchingArr.removeAllChildren();

            // Load level mới
            await this.randomLevel();
        } catch (error) {
            console.error('Lỗi khi reset game:', error);
            // Có thể thêm xử lý fallback ở đây
            
        }
    }

    // Khởi tạo danh sách các cấp có sẵn trong resources
    private loadMapLevel(): Promise<void> {
        const folderPath = 'Prefab/level';

        return new Promise((resolve, reject) => {
            resources.loadDir(folderPath, Prefab, (err, listPrf) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.listLevels = listPrf;
                resolve();
            });
        });
    }

    // Hàm trả về ngẫu nhiên 1 level
    private async randomLevel() {
        if (!this.listLevels || this.listLevels.length === 0) {
            throw new Error('Danh sách level rỗng hoặc chưa được load.');
        }

        if (this.level) {
            this.level.destroy();
            this.level = null;
        }

        // Chọn và tạo level mới
        const randomIndex = Math.floor(Math.random() * this.listLevels.length);
        const levelNode = instantiate(this.listLevels[randomIndex]);
        this.level = levelNode;

        try {
            await this.level.getComponent(Level).initLevel();
            this.tileMapLevel.addChild(levelNode);
            this.numberOfTiles = this.level.getComponent(Level).numberOfTiles;
        } catch (error) {
            this.level.destroy();
            this.level = null;
            throw error;
        }
    }

    // Khởi tạo danh sách vị trí các ô trong `tileMatchingList`
    private initPositions() {
        this.slotPositions = this.matchingPosition.children.map(tile => tile.worldPosition.clone());
    }

    // Hàm thêm node vào `slotTiles`
    public addTileToSlot(tile: Node) {
        if (this.slotTiles.some(t => t === tile)) return;

        this.slotTiles.push(tile);
        this.handleTileClick();
    }

    //Xử lý sự kiện nhấp chuột vào ô, kiểm tra và di chuyển ô
    private handleTileClick() {
        AudioController.Instance.Pick();
        if (this.slotTiles.length > 0) {
            const tileNode = this.slotTiles.shift();
            if (this.matchArrayIsFull()) {
                console.log("over");
                this.gameOver(true);
                return;
            }
            const validPos = this.getValidPosition(tileNode);
            if (validPos !== -1) {
                if (validPos < this.tileMatchingList.length) {
                    this.rearrangeMatchingArrayFrom(validPos);
                }
                this.moveTileToMatchingArea(tileNode, this.slotPositions[validPos]);
                this.numberOfTiles--;
                this.tileMatchingList.splice(validPos, 0, tileNode);
                this.checkMatch(tileNode);
                return;
            }
        }

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
        this.matchingArr.addChild(tile);
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
                    this.checkWinCondition();
                    break;
                }
            }
        }

        if (this.matchArrayIsFull()) {
            console.log("over_2");
            this.gameOver(true);
            return;
        }
    }

    // Phát hiệu ứng khi ba ô hợp nhất và xóa chúng
    private playMatchingAnimation(startIndex: number, endIndex: number) {
        for (let i = startIndex; i <= endIndex; i++) {
            const tile = this.tileMatchingList[i];
            if(tile){
                this.scheduleOnce(() => {
                    tile.getComponent(Square).scaleDestroy();
                    this.fillTile();
                }, GameManager.timeMove);
            }
        }

        this.scheduleOnce(()=>{
            AudioController.Instance.Eat();
            this.score += GameManager.scorePlus;
            this.score_label.to(this.score);
        }, GameManager.timeMove)
    }

    // Lấp đầy khu vực xếp khi ô hợp nhất bị xóa
    private fillTile() {
        this.tileMatchingList.forEach((tile, index) => {
            this.moveTileToMatchingArea(tile, this.slotPositions[index]);
        });
    }

    // Kiểm tra nếu khu vực xếp đã đầy
    private matchArrayIsFull(): boolean {
        return this.tileMatchingList.length >= this.slotPositions.length;
    }


    // Kiểm tra điều kiện thắng: nếu hết ô và không còn ô nào trong khu vực xếp
    private checkWinCondition() {
        if (this.numberOfTiles === 0 && this.tileMatchingList.length === 0) {
            console.log("Level Completed.");
            this.gameOver(false);
        }
    }

    gameOver(isOver: boolean){
        this.popupGameover.active = true;
        let gameOver = this.popupGameover.getChildByPath(`gameOver`);
        let nextLevel = this.popupGameover.getChildByPath(`nextLevel`);
        gameOver.active = isOver;
        nextLevel.active = !isOver;
        this.showPopup(isOver ? gameOver : nextLevel);

        if (!isOver) {
            this.startCountdown();
        }
    }

    // Chạy hiệu ứng hiện popup
    private showPopup(node){
        node.scale = v3(0.01,0.01,0.01)
        tween(node)
        .to(0.3, {scale: v3(1,1,1)}, { easing: 'backOut' })
        .call(() => {
            tween(node)
                .to(0.08, { scale: v3(0.83,0.83,1) })
                .to(0.08, { scale: v3(1,1,1) })
                .to(0.08, { scale: v3(0.93,0.93,1) })
                .to(0.08, { scale: v3(1,1,1)})
                .start();
        })
        .start()
    }

    private startCountdown() {
        let cd = GameManager.countdownTime;
        this.updateCountdownLabel(cd);
        
        this.schedule(() => {
            cd--;
            this.updateCountdownLabel(cd);
            
            if (cd <= 0) {
                this.resetGame();
            }
        }, 1, GameManager.countdownTime - 1);
    }

    private updateCountdownLabel(cd: number) {
        let countdownLabel = this.popupGameover.getChildByPath(`nextLevel/numCountDown`);
        if (countdownLabel) {
            countdownLabel.getComponent(Label).string = cd.toString();
        }
    }
}


