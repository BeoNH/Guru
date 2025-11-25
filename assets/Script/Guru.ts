import { _decorator, Camera, Component, find, Node, ResolutionPolicy, view } from 'cc';
import { DEBUG } from 'cc/env';
import { APIManager } from './APIManager';
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

        this.loginBatta();
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

    // Đăng nhập Batta lấy thông tin
    private loginBatta() {
        const url = `/login`;
        const data = {
            "token": APIManager.urlParam(`token`),
        };
        APIManager.requestData(url, data, res => {
            console.log("Login_info: ", res)
            if (!res) {
                return;
            }
            APIManager.userDATA = res;
        });
    }

    // // Cập nhật thông tin số lượt
    // private remainTurn(callback?: (remainTurn: number) => void): void {
    //     const url = `/imageToWord/getTurn`;
    //     const data = {
    //         "username": APIManager.userDATA?.username,
    //     };
    //     APIManager.requestData(`POST`, url, data, res => {
    //         if (!res) {
    //             UIControler.instance.onMess(`Error: ${url} => ${res}`);
    //             return;
    //         }
    //         this.numTurn = res.remain_turn;
    //         if (callback) {
    //             callback(this.numTurn);
    //         }
    //     });
    // }
}


