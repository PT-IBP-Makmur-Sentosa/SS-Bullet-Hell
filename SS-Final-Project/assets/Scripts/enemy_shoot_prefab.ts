const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyShooter extends cc.Component {
  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  private enemyShootInterval: number = 1.5;
  private enemyHP: number = 9; // HP property for the enemy

  onLoad() {
    this.scheduleShoot();
  }

  scheduleShoot(): void {
    this.schedule(() => {
      this.shoot();
    }, this.enemyShootInterval);
  }

  shoot(): void {
    const bullet = cc.instantiate(this.bulletPrefab);
    bullet.setPosition(this.node.position);

    const bulletSpeed = 500;
    const bulletEndPosition = cc.v2(-1000, bullet.position.y);
    const bulletEndPosition2 = cc.v3(-1000, bullet.position.y);

    const distance = bullet.position.sub(bulletEndPosition2).mag();
    const duration = distance / bulletSpeed;
    const moveAction = cc.moveTo(duration, bulletEndPosition);
    const removeAction = cc.removeSelf(true);

    bullet.runAction(cc.sequence(moveAction, removeAction));

    this.node.parent.addChild(bullet);
  }

  onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
    const otherGroup = otherCollider.node.group;
    if (otherGroup === 'B_player') {
      // Decrease enemy HP when collided with the player
      var attack = 0;
      attack = otherCollider.getComponent("Bullet").attack;
      this.enemyHP -= attack;
      if (this.enemyHP > 0 || this.enemyHP < 3) {console.log(this.enemyHP);}
      if (this.enemyHP <= 0) {
        // Destroy the enemy when HP reaches 0 or below
        this.node.destroy();
        console.log('Enemy destroyed');
        var stageManager = cc.find("StageManager").getComponent("StageManager");
        stageManager.score += 100;
      }
    }
  }
}
