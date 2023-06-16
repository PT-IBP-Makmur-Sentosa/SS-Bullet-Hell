// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import Player from "./Player";
const {ccclass, property} = cc._decorator;

@ccclass
export default class level_1 extends cc.Component {



    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    touch_coin: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    victory: cc.AudioClip = null;

    @property(cc.Node)
    Canvas: cc.Node = null;

    @property(cc.Node)
    MainCamera: cc.Node = null;

    @property(cc.Prefab)
    PauseBoard: cc.Prefab = null;

    // @property(Player)
    // mario: Player;
    private count: number = 0;
    
    // private Win: boolean = false;    

    // // remain_lives: number = 0;
    // levelText: cc.Label;
    // timeText: cc.Label;

    // gameLevel = 1;
    // remainTime = 300; // 300 second
    // gameover: boolean = false;
    
    // initProperties(){
    //     this.levelText = cc.find("Canvas/Main Camera/level1/TopContent/Level_one/level").getComponent(cc.Label);
    //     this.timeText = cc.find("Canvas/Main Camera/level1/TopContent/Time/time").getComponent(cc.Label);
    // }


    // updateUI(dt){
    //     this.levelText.string = this.gameLevel.toString();

    //     if(!this.Win){

    //         this.remainTime -= dt;
    //         if(this.remainTime < 0){
    //             this.remainTime = 0;
    //         }
    //     }
    //     // this.timeText.string = this.remainTime.toString();
    //     this.timeText.string = this.remainTime.toFixed(0).toString().replace(".", ":");
    // }

    // private count : number = 0;

    playBGM(){
        // ===================== TODO =====================
        // 1. Play music. The audio clip to play is this.bgm
        cc.audioEngine.playMusic(this.bgm, true)
        // ================================================

    }

    // stopBGM(){
    //     // ===================== TODO =====================
    //     // 1. Stop music. 
    //     // cc.audioEngine.pauseMusic();
    //     // ================================================
    // }
    resumeBGM(){
        cc.audioEngine.resumeMusic();
    }

    // playEffect(){
    //     // ===================== TODO =====================
    //     // 1. Play sound effect. The audio clip to play is 
    //     cc.log("Click.");
    //     cc.audioEngine.playEffect(this.touch_coin, false);
    //     // ================================================
    // }

    Toggle_init(){
        let checkEventHandler = new cc.Component.EventHandler();
        checkEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        checkEventHandler.component = "level_1";
        checkEventHandler.handler = "Pause";
        checkEventHandler.customEventData = "foobar";
        cc.find("Canvas/Main Camera/level1/UI/Pausebtn").getComponent(cc.Button).clickEvents.push(checkEventHandler);
        // this.toggle.checkEvents.push(checkEventHandler);
    }
 


    resume_init(){
        let conti = new cc.Component.EventHandler();
        conti.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        conti.component = "level_1";
        conti.handler = "Resume";
        conti.customEventData = "foobar";
        cc.find("Canvas/pause/Continue").getComponent(cc.Button).clickEvents.push(conti);

        let quit = new cc.Component.EventHandler();
        quit.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        quit.component = "level_1";
        quit.handler = "Quit";
        quit.customEventData = "foobar";
        cc.find("Canvas/pause/Quit").getComponent(cc.Button).clickEvents.push(quit);

    }

    Resume(event, customEventData){
        // Destroy pause board and resume the game!
        this.count = 0;
        // cc.log("Resume");
        cc.find("Canvas/pause").destroy();
        cc.director.resume();
        this.resumeBGM();
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
                // Draw UI Life :
                var pause = cc.instantiate(this.PauseBoard);
                this.Canvas.addChild(pause);
                pause.setPosition(this.MainCamera.x, this.MainCamera.y);
                
                // Init resume btns.
                this.resume_init();

                // console.log("pause"); 
                // this.stopBGM();
                cc.director.pause();
            }else{
                // cc.log("Cannot press Pause since Now pausing.");
            }
    }

    // win(){
    //     cc.log("win");
    //     this.stopBGM();
    //     // stop timer.
    //     this.Win = true;


    //     cc.audioEngine.playMusic(this.victory, false);
    //     var user = firebase.auth().currentUser;


    //     // num_of_times ++;
    //     firebase.database().ref('Users/'+user.displayName+'/num_of_times').once('value',(snapshot)=>{
    //          // get current time, then increment it by one.
    //             firebase.database().ref('Users/'+user.displayName).update({
    //                 num_of_times: snapshot.val()+ 1
    //             }).then(()=>{
    //                 // Log score data.

    //                 firebase.database().ref('Users/'+user.displayName+'/num_of_times').once('value',(snapshot)=>{
    //                     // get current times.
    //                     firebase.database().ref('Users/'+user.displayName+'/'+snapshot.val()).set({
    //                         scores : Number(cc.find("Canvas/mario").getComponent("Player").score),
    //                         time: Number(300- Number(this.remainTime.toFixed(0)))
    //                     })
    //                 })

    //             })





    //     })



    //     // Check if need to update 'Best_score'
    //     firebase.database().ref('Users/'+user.displayName+'/Best_score').once('value',(snapshot)=>{
    //         // get current times.
    //         if(cc.find("Canvas/mario").getComponent("Player").score.toString() > snapshot.val()){
    //             // Update Best_score.
    //             firebase.database().ref('Users/'+user.displayName+'/').update({
    //                 Best_score: cc.find("Canvas/mario").getComponent("Player").score.toString()
    //             })
    //         }
    //     })

    //     // Update user lives.
    //     firebase.database().ref('Users/'+user.displayName+'/').update({
    //         Lives: cc.find("Canvas/mario").getComponent("Player").lives
    //     })


    //     setTimeout(()=>{
    //         cc.director.loadScene("1to2");
    //         return;
    //     }, 5000);
    // }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    //     this.initProperties();
    //     this.gameover = false;        
    // }

    IncreaseVolume(event, customEventData) {
        // console.log("increaseVolume_init called");  // Added for debugging

        let currentVolume = cc.audioEngine.getMusicVolume();
        if(currentVolume < 1) {
            cc.audioEngine.setMusicVolume(currentVolume + 2);
        }
    }

    increaseVolume_init() {
        let volumeUp = new cc.Component.EventHandler();
        volumeUp.target = this.node;
        volumeUp.component = "level_1";
        volumeUp.handler = "IncreaseVolume";
        
        volumeUp.customEventData = "foobar";
        cc.find("Canvas/pause/PlusButton").getComponent(cc.Button).clickEvents.push(volumeUp);
    }

   

    start () {
        this.playBGM();
        this.Toggle_init();
        this.increaseVolume_init();

    }

    // update (dt) {
    //     if(!this.gameover){
    //         this.updateUI(dt);
    //         if(this.remainTime == 0){
    //             this.gameover = true;
    //             this.onGameover();
    //         }
    //     }
    // }
    // onGameover(){
    //     cc.director.loadScene("Gameover");
    // }

}
