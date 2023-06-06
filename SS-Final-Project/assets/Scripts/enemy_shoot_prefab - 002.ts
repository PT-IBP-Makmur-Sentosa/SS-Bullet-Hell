const { ccclass, property } = cc._decorator;

function randomRangeInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

@ccclass
export default class EnemyShooter extends cc.Component {
  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  private enemyHP: number = 5; // HP property for the enemy

  private enemyShootInterval: number = 1.5;
  private minBulletCount: number = 3; // Minimum number of bullets to shoot
  private maxBulletCount: number = 5; // Maximum number of bullets to shoot

  onLoad() {
    this.scheduleShoot();
  }

  scheduleShoot(): void {
    this.schedule(() => {
      this.shoot();
    }, this.enemyShootInterval);
  }

  shoot(): void {
    const bulletCount = randomRangeInt(this.minBulletCount, this.maxBulletCount);

    for (let i = 0; i < bulletCount; i++) {
      const bullet = cc.instantiate(this.bulletPrefab);
      bullet.setPosition(this.node.position);

      const bulletSpeed = 1000;

      // Generate a random direction for the bullet
      const angle = Math.random() * Math.PI * 2;
      const bulletDirection = cc.v2(Math.cos(angle), Math.sin(angle));

      // Calculate the end position of the bullet based on its direction and speed
      const bulletEndPosition = bulletDirection.mul(bulletSpeed);
      const bulletEndPosition2 = cc.v3(-1000, bullet.position.y);

      const distance = bullet.position.sub(bulletEndPosition2).mag();
      const duration = (distance + 500) / 500;
      const moveAction = cc.moveTo(duration, bulletEndPosition);
      const removeAction = cc.removeSelf(true);

      bullet.runAction(cc.sequence(moveAction, removeAction));

      const angleRadians = Math.atan2(bulletDirection.y, bulletDirection.x);
      const angleDegrees = cc.misc.radiansToDegrees(angleRadians);

      bullet.rotation = -angleDegrees; // Reverse the angle for proper rotation

      this.node.parent.addChild(bullet);
    }
  }

  onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
    const otherGroup = otherCollider.node.group;
    if (otherGroup === 'B_player') {
      // Decrease enemy HP when collided with the player
      var attack = 0;
      attack = otherCollider.getComponent("Bullet").attack;
      this.enemyHP -= attack;
      if (this.enemyHP > 0 || this.enemyHP < 29) {console.log(this.enemyHP);}
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
