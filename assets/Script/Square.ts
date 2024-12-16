import { _decorator, Collider2D, Component, ERaycast2DType, EventTouch, Node, PhysicsSystem2D, tween, UITransform, v3, Vec2, Vec3 } from 'cc';
import { GamePlay } from './GamePlay';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Square')
export class Square extends Component {

    private isMove: boolean = false;
    private checkOverlap;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.onNodeClicked, this);
    }

    protected start(): void {
        this.isTileOverlapped()
        this.checkOverlap = () => {
            this.isTileOverlapped();
        };

        this.schedule(this.checkOverlap, 0.5);
    }

    protected onDestroy(): void {
        this.unschedule(this.checkOverlap);
        this.checkOverlap = null;
    }

    // Sự kiện bấm vào node
    onNodeClicked(event: EventTouch) {
        if (this.node.getChildByPath(`DarkenMask`).active) return;
        GamePlay.Instance.addTileToSlot(this.node);
    }

    // Kiểm tra nếu ô bị che khuất bởi ô khác
    private isTileOverlapped() {
        const collider = this.node.getComponent(Collider2D);
        if (!collider || this.isMove) return;

        const aabb = collider.worldAABB;
        const otherColliders = PhysicsSystem2D.instance.testAABB(aabb);

        const isOverLap = otherColliders.some(other =>
            other !== collider &&
            other.node.parent !== this.node.parent &&
            other.node.parent.name > this.node.parent.name
        );

        this.node.getChildByPath(`DarkenMask`).active = isOverLap;
    }

    // Di chuyển node đến vị trí chỉ định
    moveTileToWPos(wpos: Vec3) {
        this.isMove = true;
        tween(this.node)
            .call(() => { this.node.getComponent(Collider2D).enabled = false })
            .to(GameManager.timeMove, { worldPosition: wpos, scale: v3(0.65, 0.65) })
            .start();
    }

    scaleDestroy() {
        tween(this.node)
            .to(0.3, { scale: Vec3.ZERO })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }
}
