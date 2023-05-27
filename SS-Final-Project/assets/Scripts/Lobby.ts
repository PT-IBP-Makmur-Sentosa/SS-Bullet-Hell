// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.SpriteFrame])
    shipSprites: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    renderShipSprite: cc.Sprite = null;

    @property(cc.Button)
    btnLeft: cc.Button = null;

    @property(cc.Button)
    btnRight: cc.Button = null;

    @property(cc.Button)
    shopBtn: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private currentShipIndex: number = 0;

    start () {
        this.btnLeft.node.on('click', this.leftShip, this);
        this.btnRight.node.on('click', this.rightShip, this);
        this.shopBtn.node.on('click', this.openShop, this);
        this.updateShipDisplay();
    }

    // update (dt) {}

    leftShip() {
        this.currentShipIndex--;
        if (this.currentShipIndex < 0) {
            this.currentShipIndex = this.shipSprites.length - 1;
        }
        this.updateShipDisplay();
    }

    rightShip() {
        this.currentShipIndex++;
        if (this.currentShipIndex >= this.shipSprites.length) {
            this.currentShipIndex = 0;
        }
        this.updateShipDisplay();
    }

    updateShipDisplay() {
        // Create a fade-out animation
        const fadeOut = cc.fadeOut(0.3);

        // Create a fade-in animation
        const fadeIn = cc.fadeIn(0.3);

        // Assign the new sprite frame
        this.renderShipSprite.spriteFrame = this.shipSprites[this.currentShipIndex];

        // Apply the animations
        this.renderShipSprite.node.stopAllActions();
        this.renderShipSprite.node.opacity = 0; // Set initial opacity to 0
        this.renderShipSprite.node.runAction(cc.sequence(fadeOut, cc.delayTime(0.1), fadeIn));
    }

    openShop(){
        cc.director.loadScene("Shop");
    }
}
