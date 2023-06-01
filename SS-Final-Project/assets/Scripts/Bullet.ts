const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
  private anim = null;

  private bulletManager = null;

  public isTriggered = false; // I add this to make the bullet kill one enemy at a time.

  // when created, the bullet need to be placed at correct position and play animation.
  public init(node: cc.Node) {
    this.anim = this.getComponent(cc.Animation);

    this.setInitPos(node);

    this.anim.play("bullet");
  }

  // this function is called when the bullet manager calls "get" API.
  reuse(bulletManager) {
    this.bulletManager = bulletManager;

    this.isTriggered = false;
  }

  //this function sets the bullet's initial position when it is reused.
  private setInitPos(node: cc.Node) {
    this.node.parent = node.parent; // don't mount under the player, otherwise it will change direction when player move

    if (node.scaleX > 0) {
      this.node.position = cc.v2(62, 8);

      this.node.scaleX = 1;
    } else {
      this.node.position = cc.v2(-62, 8);

      this.node.scaleX = -1;
    }

    this.node.position = this.node.position.addSelf(node.position);
  }

  //make the bullet move from current position
  private bulletMove() {
    let moveDir = null;

    // move bullet to 500 far from current position in 0.8s
    if (this.node.scaleX > 0) moveDir = cc.moveBy(0.8, 300, 0);
    else moveDir = cc.moveBy(0.8, -300, 0);

    let finished = cc.callFunc(() => {
      this.bulletManager.put(this.node);
    });

    // after playing animation, the bullet move 0.8s and destroy itself(put back to the bullet manager)
    this.scheduleOnce(() => {
      this.node.runAction(cc.sequence(moveDir, finished));
    });
  }

  //detect collision with enemies
  onBeginContact(contact, selfCollider, otherCollider) {
    this.node.stopAllActions();

    this.unscheduleAllCallbacks();

    this.scheduleOnce(() => {
      this.anim.stop();

      this.bulletManager.put(this.node);
    }, 0.1); // for better animation effect, I delay 0.1s when bullet hits the enemy
  }
}
