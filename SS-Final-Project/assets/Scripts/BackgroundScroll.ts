// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class BackgroundScroll extends cc.Component {

    @property(Number)
    speed = 0

    @property(Number)
    bgwidth = 0

    update (dt) {
        var x = this.node.x;
        x -= this.speed * dt;
        if (x <= -this.bgwidth) {
            x += this.bgwidth*2;
        }
        this.node.x = x;
    }
}
