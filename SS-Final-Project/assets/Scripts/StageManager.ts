


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
    @property(cc.Node)
    gameoverScore = null;

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    @property(cc.Node)
    Canvas: cc.Node = null;

    @property(cc.Node)
    MainCamera: cc.Node = null;

    @property(cc.Node)
    PauseBoard: cc.Node = null;

    @property(cc.AudioClip)
    backgroundMusic: cc.AudioClip = null;
    @property(cc.AudioClip)
    lobbyMusic: cc.AudioClip = null;
    @property(cc.AudioClip)
    gameover_music: cc.AudioClip = null;

    private audioSource: cc.AudioSource = null;

    private count: number = 0;


    public bulletPool = new cc.NodePool("Bullet");
    // LIFE-CYCLE CALLBACKS:
    giveItem() {
        this.player.getComponent("Player").getItem()
        this.player1.getComponent("Player").getItem()
    }

    gameOver() {
        cc.audioEngine.playEffect(this.gameover_music, false);

        this.gameover.active = true
        this.enemy.active = false
        this.gameoverScore.getComponent(cc.Label).string = this.scoreLabel.string
        
        this.scheduleOnce(function () {
            
            cc.director.loadScene("Lobby")
        } , 3)
        this.saveScoreToFirebase(this.score)
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

    playBGM(){
        // ===================== TODO =====================
        // 1. Play music. The audio clip to play is this.bgm
        cc.audioEngine.playMusic(this.bgm, true)
        // ================================================

    }

    resumeBGM(){
        cc.audioEngine.resumeMusic();
    }

    Toggle_init(){
        let checkEventHandler = new cc.Component.EventHandler();
        checkEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        checkEventHandler.component = "StageManager";
        checkEventHandler.handler = "Pause";
        checkEventHandler.customEventData = "foobar";
        cc.find("Canvas/level1/UI/Pausebtn").getComponent(cc.Button).clickEvents.push(checkEventHandler);
        // this.toggle.checkEvents.push(checkEventHandler);
    }

    resume_init(){
        let conti = new cc.Component.EventHandler();
        conti.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        conti.component = "StageManager";
        conti.handler = "Resume";
        conti.customEventData = "foobar";
        cc.find("pause/Continue").getComponent(cc.Button).clickEvents.push(conti);

        let quit = new cc.Component.EventHandler();
        quit.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        quit.component = "StageManager";
        quit.handler = "Quit";
        quit.customEventData = "foobar";
        cc.find("pause/Quit").getComponent(cc.Button).clickEvents.push(quit);
    }

    Resume(event, customEventData){
        // Destroy pause board and resume the game!
        this.count = 0;
        cc.log("Resume");
        // cc.find("pause").destroy();
        this.enemy.active=true 
        this.PauseBoard.active=false
        cc.director.resume();
        this.resumeBGM();
    }

    Quit(event, customEventData){
        // Quit game
        this.count = 0;
        //cc.find("pause").destroy();
        this.Resume(event, customEventData)
        this.saveScoreToFirebase(this.score)
        cc.director.loadScene("Lobby");
    }

    Pause(event, customEventData) {
        // 这里的 toggle 是事件发出的 Toggle 组件
        // 这里的 customEventData 参数就等于之前设置的 "foobar"
            // Pause.
            // Turn off button listener.
            // this.OFFPause();
            this.enemy.active=false
        this.count++;
        cc.audioEngine.stopAllEffects()
        if(this.count==1){
            // Draw UI Life :
            // var pause = cc.instantiate(this.PauseBoard);
            // this.Canvas.addChild(pause);
            // pause.setPosition(this.MainCamera.x, this.MainCamera.y);
            this.PauseBoard.active=true
            // Init resume btns.
            this.resume_init();


            console.log("pause"); 
            // this.stopBGM();
            cc.director.pause();
        }else{
            cc.log("Cannot press Pause since Now pausing.");
        }
}

    IncreaseVolume(event, customEventData) {
        console.log("increaseVolume_init called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getMusicVolume();
        console.log(currentVolume)
        
        cc.audioEngine.setMusicVolume(currentVolume + 0.1);

        if(currentVolume > 1) {
            cc.audioEngine.setMusicVolume(1);

        }

        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref("users/" + user?.uid);
        userRef.update({ bgm: currentVolume })
            .then(() => {
              console.log("BGM saved to Firebase");
            })
            .catch((error) => {
              console.error("Error saving BGM to Firebase:", error);
            })
    }

    increaseVolume_init() {
        let volumeUp = new cc.Component.EventHandler();
        volumeUp.target = this.node;
        volumeUp.component = "StageManager";
        volumeUp.handler = "IncreaseVolume";
        
        volumeUp.customEventData = "foobar";
        cc.find("pause/PlusButtonMsc").getComponent(cc.Button).clickEvents.push(volumeUp);
    }

    decreaseVolume_init() {
        let volumeDown =new cc.Component.EventHandler();
        volumeDown.target = this.node;
        volumeDown.component = "StageManager";
        volumeDown.handler = "DecreaseVolume";
        
        volumeDown.customEventData = "foobar";
        cc.find("pause/MinusButtonMsc").getComponent(cc.Button).clickEvents.push(volumeDown);
    }

    DecreaseVolume(event, customEventData) {
        console.log("decreaseVolume called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getMusicVolume();
        console.log(currentVolume)
        
        cc.audioEngine.setMusicVolume(currentVolume - 0.1);

        if(currentVolume <0) {
            cc.audioEngine.setMusicVolume(0);
        }

        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref("users/" + user?.uid);
        userRef.update({ bgm: currentVolume })
            .then(() => {
              console.log("BGM saved to Firebase");
            })
            .catch((error) => {
              console.error("Error saving BGM to Firebase:", error);
            })
    }

    IncreaseFX(event, customEventData) {
        console.log("increaseFX_init called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getEffectsVolume();
        console.log(currentVolume)
        
        cc.audioEngine.setEffectsVolume(currentVolume + 0.1);

        if(currentVolume > 1) {
            cc.audioEngine.setEffectsVolume(1);
        }

        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref("users/" + user?.uid);
        userRef.update({ sfx: currentVolume })
            .then(() => {
              console.log("SFX saved to Firebase");
            })
            .catch((error) => {
              console.error("Error saving SFX to Firebase:", error);
            })
    }

    increaseFX_init() {
        let volumeUp = new cc.Component.EventHandler();
        volumeUp.target = this.node;
        volumeUp.component = "StageManager";
        volumeUp.handler = "IncreaseFX";
        
        volumeUp.customEventData = "foobar";
        cc.find("pause/PlusButton").getComponent(cc.Button).clickEvents.push(volumeUp);
    }

    decreaseFX_init() {
        let volumeDown =new cc.Component.EventHandler();
        volumeDown.target = this.node;
        volumeDown.component = "StageManager";
        volumeDown.handler = "DecreaseFX";
        
        volumeDown.customEventData = "foobar";
        cc.find("pause/MinusButton").getComponent(cc.Button).clickEvents.push(volumeDown);
    }

    DecreaseFX(event, customEventData) {
        console.log("decreaseVolume called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getEffectsVolume();
        console.log(currentVolume)
        
        cc.audioEngine.setEffectsVolume(currentVolume - 0.1);

        if(currentVolume <0) {
            cc.audioEngine.setEffectsVolume(0);
        }

        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref("users/" + user?.uid);
        userRef.update({ sfx: currentVolume })
            .then(() => {
              console.log("SFX saved to Firebase");
            })
            .catch((error) => {
              console.error("Error saving SFX to Firebase:", error);
            })
    }

    start () {
        this.playBGM();
        this.Toggle_init();
        this.increaseVolume_init();
        this.increaseFX_init();  
        this.decreaseVolume_init();
        this.decreaseFX_init();
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
        
    })
}
}

