const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyBullet extends cc.Component {
  onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider): void {
    const otherGroup = otherCollider.node.group;
    if (otherGroup === 'boundary') {
      // Destroy the bullet when collided with the boundary
      this.node.destroy();
      // console.log('destroy bullet enemy group');
    }
  }
}
