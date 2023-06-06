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

    @property(cc.Button)
    backButton: cc.Button = null;

    @property(cc.Label)
    coinsQuantity: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    async onLoad () {
        cc.director.on('shipPurchased', this.updateCoinsQuantity, this);
        this.updateCoinsQuantity();
    }

    updateCoinsQuantity() {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                this.coinsQuantity.string = "Coins: " + userData.coins;
            } else {
                console.log("User not found");
            }
        });
    }

    
    start () {
        this.backButton.node.on('click', this.onBackClick, this);
    }

    onBackClick(){
        cc.director.loadScene('Lobby');
    }

    // update (dt) {}
}
