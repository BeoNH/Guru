import { _decorator, Component, Label, Node } from 'cc';
import { PopupRank } from './PopupRank';
import { PopupHistory } from './PopupHistory';
const { ccclass, property } = _decorator;

@ccclass('UIControler')
export class UIControler extends Component {
    public static instance: UIControler = null;

    // @property({ type: Node, tooltip: "Luật chơi" })
    // private popupInfo: Node = null;
    @property({ type: Node, tooltip: "Bảng xếp hạng" })
    private popupRank: Node = null;
    @property({ type: Node, tooltip: "Lịch sử" })
    private popupHistory: Node = null;

    protected onLoad(): void {
        UIControler.instance = this;
        this.onClose();
    }

    onOpen(e: any, str: string, num?: number) {
        this.onClose();

        switch (str) {
            // case `info`:
            //     this.popupInfo.active = true;
            //     break;
            case `rank`:
                this.popupRank.active = true;
                this.popupRank.getComponent(PopupRank).initRankingList();
                break;
            case `history`:
                this.popupHistory.active = true;
                this.popupHistory.getComponent(PopupHistory).initHistoryList();
                break;
        }
    }

    onClose() {
        // this.popupInfo.active = false;
        this.popupRank.active = false;
        this.popupHistory.active = false;
    }
}


