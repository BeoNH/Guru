import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Guru')
export class Guru extends Component {
    @property({ type: Node, tooltip: "scene gamePlay" })
    private scenePlay: Node = null;
    @property({ type: Node, tooltip: "scene menu" })
    private sceneMenu: Node = null;

    protected onLoad(): void {
        this.sceneMenu.active = true;
        this.scenePlay.active = false;
    }

    openMenu() {
        this.sceneMenu.active = true;
        this.scenePlay.active = false;
    }

    openGame() {
        // AudioController.Instance.AudioClick();
        this.sceneMenu.active = false;
        this.scenePlay.active = true;
    }
}


