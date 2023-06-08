const { ccclass, property } = cc._decorator;

function randomRangeInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

@ccclass
export default class EnemyShooter extends cc.Component {
  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  private enemyHP: number = 8; // HP property for the enemy

  private enemyShootInterval: number = 1.5;
  private minBulletCount: number = 2; // Minimum number of bullets to shoot
  private maxBulletCount: number = 4; // Maximum number of bullets to shoot

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

      bullet.angle = -angleDegrees; // Reverse the angle for proper rotation

      this.node.parent.addChild(bullet);
    }
  }

  first = false;
  onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
    const otherGroup = otherCollider.node.group;
    if (otherGroup === 'B_player' && !this.first) {
      this.first = true
      // Decrease enemy HP when collided with the player
      var attack = 0;
      attack = otherCollider.getComponent("Bullet").attack;
      this.enemyHP -= attack;
      this.scheduleOnce(function () {
        this.first = false
      }, 0.1)
      //if (this.enemyHP > 0 || this.enemyHP < 29) {console.log(this.enemyHP);}
      if (this.enemyHP <= 0) {
        this.scheduleOnce(function () {
          this.enemyHP = 8
        }, 0.1)
        // Destroy the enemy when HP reaches 0 or below
        var spawner = cc.find("New Node")
        spawner.getComponent("enemy_1").pooling(this.node, this.enemyHP, 8)
        //this.node.destroy();
        //console.log('Enemy destroyed');
        var stageManager = cc.find("StageManager").getComponent("StageManager");
        stageManager.score += 500;
      }
    }
  }
}
