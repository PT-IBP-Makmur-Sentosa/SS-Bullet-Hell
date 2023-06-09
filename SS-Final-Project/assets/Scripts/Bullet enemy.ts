const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyBullet extends cc.Component {

  private stageManager:any  = null;
  protected onLoad(): void {
      const manager = cc.find("StageManager");
      this.stageManager = manager.getComponent("StageManager");
    }
  onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
    const otherGroup = otherCollider.node.group;
    if (otherGroup === 'boundary') {
      // Destroy the bullet when collided with the boundary
      //console.log("bounded")
      this.stageManager.bulletPool.put(this.node);
      // this.node.destroy();
      // console.log('destroy bullet enemy group');
    }
    else if(otherGroup === 'player'){
      this.stageManager.bulletPool.put(this.node);
      // this.node.destroy();
    }
  }
}
