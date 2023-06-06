// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
declare const firebase: any;
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

    @property(cc.Button)
    stage1Btn: cc.Button = null;

    @property(cc.Button)
    stage2Btn: cc.Button = null;
    
    @property(cc.Button)
    stage3Btn: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:

    
    private currentShipIndex: number = 0;
    private availableShip: Array<boolean> = [true, false, false, false, false];
    async onLoad () {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            this.currentShipIndex = userData.selectedShipIndex;
            this.availableShip = userData.shipUnLocked;
            const stagesUnlocked = userData.stage;
            if(stagesUnlocked[0]){
                this.stage1Btn.node.opacity = 255;
                this.stage1Btn.interactable = true;
            }
            else if (!stagesUnlocked[0]){
                this.stage1Btn.node.opacity = 150;
                this.stage1Btn.interactable = false;
            }

            if(stagesUnlocked[1]){
                this.stage2Btn.node.opacity = 255;
                this.stage2Btn.interactable = true;
            }
            else if (!stagesUnlocked[1]){
                this.stage2Btn.node.opacity = 150;
                this.stage2Btn.interactable = false;
            }

            if(stagesUnlocked[2]){
                this.stage3Btn.node.opacity = 255;
                this.stage3Btn.interactable = true;
            }
            else if (!stagesUnlocked[2]){
                this.stage3Btn.node.opacity = 150;
                this.stage3Btn.interactable = false;
            }            
          } else {
            console.log("User not found");
          }
        });

    }
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
        this.renderShipSprite.node.color = this.availableShip[this.currentShipIndex] ? cc.Color.WHITE : cc.Color.BLACK;
        // this.renderShipSprite.node.opacity = this.availableShip[this.currentShipIndex] ? 255 : 150; // Set initial opacity to 0
        // console.log("available or not");
        // console.log(this.availableShip[this.currentShipIndex]);
        // console.log(this.renderShipSprite.node.opacity);
        // Apply the animations
        this.renderShipSprite.node.stopAllActions();
        this.renderShipSprite.node.opacity = 0; // Set initial opacity to 0
        this.renderShipSprite.node.runAction(cc.sequence(fadeOut, cc.delayTime(0.1), fadeIn));
    }

    openShop(){
        cc.director.loadScene("Shop");
    }
}
