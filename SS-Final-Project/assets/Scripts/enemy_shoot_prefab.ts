const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyShooter extends cc.Component {
  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  private enemyShootInterval: number = 1.5;
  private enemyHP: number = 4; // HP property for the enemy

  private stageManager:any = null;
  onLoad() {
    this.scheduleShoot();
    const manager = cc.find("StageManager");
    this.stageManager = manager.getComponent("StageManager");
  }

  scheduleShoot(): void {
    this.schedule(() => {
      this.shoot();
    }, this.enemyShootInterval);
  }
 
  shoot(): void {
    var bullet = null
    if(this.stageManager.bulletPool.size() > 0){
      //console.log(this.stageManager.bulletPool.size())
      bullet = this.stageManager.bulletPool.get();
    }
    else{
      //console.log("new")
      bullet = cc.instantiate(this.bulletPrefab);
    }
    bullet.setPosition(this.node.position);
    const moveAction = cc.moveBy(0.8, -1000, 0);
    const removeAction = cc.callFunc(() => {
      //this.node.parent.removeChild(this.bullet);
      this.stageManager.bulletPool.put(bullet);
      // bullet.destroy()
    });

    bullet.runAction(cc.sequence(moveAction, removeAction));

    this.node.parent.addChild(bullet);
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
      }, 0.05)
      //if (this.enemyHP > 0 || this.enemyHP < 29) {console.log(this.enemyHP);}
      if (this.enemyHP <= 0) {
        this.scheduleOnce(function () {
          this.enemyHP = 4
        }, 0.1)
        // Destroy the enemy when HP reaches 0 or below
        var spawner = cc.find("New Node")
        spawner.getComponent("enemy_1").pooling(this.node, this.enemyHP, 4)
        //this.node.destroy();
        //console.log('Enemy destroyed');
        this.stageManager.score += 100;
        var rand = Math.random()
        if(rand < 0.1){
          console.log("powerup")
          this.stageManager.giveItem()
        }
      }
    }
  }
}
