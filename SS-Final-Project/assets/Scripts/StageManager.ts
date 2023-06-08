// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

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
    enemy = null;
    @property(cc.Node)
    gameover = null;


    // LIFE-CYCLE CALLBACKS:
    gameOver() {
        this.gameover.active = true
        this.enemy.active = false
        this.scheduleOnce(function () {
            cc.director.loadScene("Lobby")
        } , 2)
    }

    onLoad () {
        this.scheduleOnce(function () {
            this.loading.active = false;
            this.enemy.active = true;
        }, 2)
    }

    start () {
        this.stageLabel.string = this.stageName;
        this.healthLabel.string = "HP X " + this.health.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
    }

    update (dt) {
        this.healthLabel.string = "HP X " + this.health.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
    }
}
