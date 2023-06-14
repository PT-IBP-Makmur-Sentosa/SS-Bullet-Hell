// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";



const {ccclass, property} = cc._decorator;
declare const firebase: any;

@ccclass
export default class StageManager extends cc.Component {

    @property(cc.Label)
    stageLabel: cc.Label = null;
    @property
    stageName: string = "Stage 1";
    @property(cc.Label)
    healthLabel: cc.Label = null;
    @property
    health: number = 3;
    @property(cc.Label)
    scoreLabel: cc.Label = null;
    @property
    score: number = 0;
    @property(cc.Node)
    loading = null;
    @property(cc.Node)
    player = null;
    @property(cc.Node)
    player1 = null;
    @property(cc.Node)
    enemy = null;
    @property(cc.Node)
    gameover = null;

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;


    public bulletPool = new cc.NodePool("Bullet");
    // LIFE-CYCLE CALLBACKS:
    giveItem() {
        this.player.getComponent("Player").getItem()
        this.player1.getComponent("Player").getItem()
    }

    gameOver() {
        this.gameover.active = true
        this.enemy.active = false
        this.scheduleOnce(function () {
            cc.director.loadScene("Lobby")
        } , 2)
        this.saveScoreToFirebase(this.score.toString())
    }

    onLoad () {
        const initialBulletCount = 100;
        for (let i = 0; i < initialBulletCount; i++) {
          const bullet = cc.instantiate(this.bulletPrefab);
          this.bulletPool.put(bullet);
        }
        this.scheduleOnce(function () {
            this.loading.active = false;
            this.enemy.active = true;
        }, 2)
    }

    start () {
        this.stageLabel.string = this.stageName;
        this.healthLabel.string = "HP X " + this.player.getComponent("Player").lives.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
    }

    update (dt) {
        this.healthLabel.string = "HP X " + this.player.getComponent("Player").lives.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
    }

    saveScoreToFirebase(score: number) {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref("users/" + user?.uid);
        userRef.once("value", (snapshot) => {
          const userData = snapshot.val();
          var updatedScore = userData.score;
          if( updatedScore < score) { updatedScore = score;}
          const updatedCoins = userData.coins + score * 0.1;
    
          userRef.update({ score: updatedScore, coins: updatedCoins })
            .then(() => {
              console.log("Score saved to Firebase");
            })
            .catch((error) => {
              console.error("Error saving score to Firebase:", error);
            });
        
}
