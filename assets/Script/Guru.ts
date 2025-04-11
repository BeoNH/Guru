import { _decorator, Camera, Component, find, Node, ResolutionPolicy, view } from 'cc';
import { DEBUG } from 'cc/env';
const { ccclass, property } = _decorator;


if (!DEBUG) {
    console.log = function () { };
}

@ccclass('Guru')
export class Guru extends Component {
    @property({ type: Node, tooltip: "scene gamePlay" })
    private scenePlay: Node = null;
    @property({ type: Node, tooltip: "scene menu" })
    private sceneMenu: Node = null;

    protected onLoad(): void {
        this.sceneMenu.active = true;
        this.scenePlay.active = false;

        view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_HEIGHT | ResolutionPolicy.FIXED_WIDTH);
        find(`Canvas`).getComponentInChildren(Camera).orthoHeight = 535;
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


