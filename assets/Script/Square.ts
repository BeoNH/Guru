import { _decorator, Component, EventTouch, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Square')
export class Square extends Component {

    onLoad(){
        this.node.on(Node.EventType.TOUCH_END, this.onNodeClicked, this);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    onNodeClicked(event: EventTouch){
        console.log(">>>>>fuk",this.node.name);
    }
}
