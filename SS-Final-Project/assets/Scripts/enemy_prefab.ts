// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
  // ...existing properties and methods...

  onCollisionEnter(other: cc.Collider, self: cc.Collider): void {
    console.log('collision1');
    if (other.node.group === 'player') {
      // Collision with player node
      // Handle the collision logic here
      console.log('collision');
    }
  }
}

