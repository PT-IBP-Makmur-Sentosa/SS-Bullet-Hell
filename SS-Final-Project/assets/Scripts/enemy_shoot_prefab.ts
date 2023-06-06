const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyShooter extends cc.Component {
  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  private enemyShootInterval: number = 1.5;

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
    if (otherGroup === 'B_player' ) {
      // Destroy the enemy when collided with a player or a player bullet
      this.node.destroy();
      console.log('enemy destroyed');
    }
  }
}

