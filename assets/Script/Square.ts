import { _decorator, Collider2D, Component, ERaycast2DType, EventTouch, Node, PhysicsSystem2D, UITransform, Vec2 } from 'cc';
import { GamePlay } from './GamePlay';
const { ccclass, property } = _decorator;

@ccclass('Square')
export class Square extends Component {

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.onNodeClicked, this);
    }
    protected start(): void {
        if(this.isTileOverlapped()){
            this.node.getChildByPath(`DarkenMask`).active = true;
        }
    }

    // Sự kiện bấm vào node
    onNodeClicked(event: EventTouch) {
        if (this.node.getChildByPath(`DarkenMask`).active) return;
        GamePlay.Instance.addTileToSlot(this.node);
    }

    // Kiểm tra nếu ô bị che khuất bởi ô khác
    private isTileOverlapped(): boolean {
        const collider = this.node.getComponent(Collider2D);
        if (!collider) return false;

        const aabb = collider.worldAABB;
        const otherColliders = PhysicsSystem2D.instance.testAABB(aabb);

        return otherColliders.some(other => other !== collider && other.node.parent !== this.node.parent);
    }
}
