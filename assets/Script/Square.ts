import { _decorator, Collider2D, Component, ERaycast2DType, EventTouch, Node, PhysicsSystem2D, tween, UITransform, v3, Vec2, Vec3 } from 'cc';
import { GamePlay } from './GamePlay';
const { ccclass, property } = _decorator;

@ccclass('Square')
export class Square extends Component {

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.onNodeClicked, this);
    }
    protected start(): void {
        this.isTileOverlapped()
    }

    // Sự kiện bấm vào node
    onNodeClicked(event: EventTouch) {
        if (this.node.getChildByPath(`DarkenMask`).active) return;
        GamePlay.Instance.addTileToSlot(this.node);
    }

    // Kiểm tra nếu ô bị che khuất bởi ô khác
    private isTileOverlapped() {
        const collider = this.node.getComponent(Collider2D);
        if (!collider) return false;

        const aabb = collider.worldAABB;
        const otherColliders = PhysicsSystem2D.instance.testAABB(aabb);

        const isOverLap = otherColliders.some(other => other !== collider && other.node.parent !== this.node.parent && other.node.parent.name > this.node.parent.name);

        if (isOverLap) {
            this.node.getChildByPath(`DarkenMask`).active = true;
        }
    }

    // Di chuyển node đến vị trí chỉ định
    moveTileToWPos(wpos: Vec3) {
        tween(this.node)
            .to(0.3, { worldPosition: wpos })
            .start();
    }
}
