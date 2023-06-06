

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class topcontent extends cc.Component {

    @property(cc.Node)
    Canvas: cc.Node = null;

    @property(cc.Node)
    MainCamera: cc.Node = null;

    @property(cc.Prefab)
    PauseBoard: cc.Prefab = null;

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
    private count: number = 0;

    
    Toggle_init(){
        let checkEventHandler = new cc.Component.EventHandler();
        checkEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        checkEventHandler.component = "topcontent";
        checkEventHandler.handler = "Pause";
        checkEventHandler.customEventData = "foobar";
        cc.find("Canvas/Main Camera/level1/UI/Pausebtn").getComponent(cc.Button).clickEvents.push(checkEventHandler);
        // this.toggle.checkEvents.push(checkEventHandler);
    }

    resume_init(){
        let conti = new cc.Component.EventHandler();
        conti.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        conti.component = "topcontent";
        conti.handler = "Resume";
        conti.customEventData = "foobar";
        cc.find("Canvas/pause/Continue").getComponent(cc.Button).clickEvents.push(conti);

        let quit = new cc.Component.EventHandler();
        quit.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        quit.component = "topcontent";
        quit.handler = "Quit";
        quit.customEventData = "foobar";
        cc.find("Canvas/pause/Quit").getComponent(cc.Button).clickEvents.push(quit);

    }

    Resume(event, customEventData){
        // Destroy pause board and resume the game!
        this.count = 0;
        cc.log("Resume");
        cc.find("Canvas/pause").destroy();
        cc.director.resume();
        // this.resumeBGM();
    }

    Quit(event, customEventData){
        // Quit game
        this.count = 0;
        cc.find("Canvas/pause").destroy();
        cc.director.loadScene("setting");
    }

    Pause(event, customEventData) {
        // 这里的 toggle 是事件发出的 Toggle 组件
        // 这里的 customEventData 参数就等于之前设置的 "foobar"
            // Pause.
            // Turn off button listener.
            // this.OFFPause();
        this.count++;
        if(this.count==1){
            // // Draw UI Life :
            // var pause = cc.instantiate(this.PauseBoard);
            // this.Canvas.addChild(pause);
            // pause.setPosition(this.MainCamera.x, this.MainCamera.y);
            
            // Init resume btns.
            this.resume_init();

            cc.log("Pause");
            // this.stopBGM();
            cc.director.pause();
        }else{
            cc.log("Cannot press Pause since Now pausing.");
        }
}

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.stageLabel.string = this.stageName;
        this.healthLabel.string = "HP X " + this.health.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
        this.Toggle_init();

    }

    update (dt) {
        this.healthLabel.string = "HP X " + this.health.toString()
        this.scoreLabel.string = "Score: " + this.score.toString()
    }
}

