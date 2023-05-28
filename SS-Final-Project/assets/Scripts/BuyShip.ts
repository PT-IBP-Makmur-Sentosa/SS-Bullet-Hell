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

    @property
    buyShipIndex: number = 0;

    @property
    price: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    async onLoad () {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if(userData.shipUnLocked[this.buyShipIndex]){
                this.node.getComponent(cc.Button).interactable = false;
            }
          } else {
            console.log("User not found");
          }
        });

    }
    start () {
        this.node.getComponent(cc.Button).node.on('click', this.buyShip, this);
    }

    buyShip(){
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if(userData.coins >= this.price){
                userData.coins -= this.price;
                userData.shipUnLocked[this.buyShipIndex] = true;
                userRef.set(userData);
                this.node.getComponent(cc.Button).interactable = false;
            }else{
                console.log("Not enough coins");
            }
          } else {
            console.log("User not found");
          }
        });
    }

    // update (dt) {}
}
