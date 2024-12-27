import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    public static readonly timeMove: number = 0.3;

    public static readonly scorePlus: number = 100;

    public static numberOfTiles: number = 0;
}
