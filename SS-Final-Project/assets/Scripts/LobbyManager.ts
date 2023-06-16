


const {ccclass, property} = cc._decorator;
declare const firebase: any;

@ccclass
export default class LobbyManager extends cc.Component {

    @property(cc.Node)
    Canvas: cc.Node = null;

    @property(cc.Node)
    MainCamera: cc.Node = null;

    @property(cc.Node)
    PauseBoard: cc.Node = null;

    @property(cc.Node)
    Loading: cc.Node = null;

    private count: number = 0;

    resumeBGM(){
        cc.audioEngine.resumeMusic();
    }

    toggleSettings(){
        this.PauseBoard.active = !this.PauseBoard.active
    }

    IncreaseVolume(event, customEventData) {
        // console.log("increaseVolume_init called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getMusicVolume();
        // console.log(currentVolume)
        
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
        volumeUp.component = "LobbyManager";
        volumeUp.handler = "IncreaseVolume";
        
        volumeUp.customEventData = "foobar";
        cc.find("Canvas/pause/PlusButtonMsc").getComponent(cc.Button).clickEvents.push(volumeUp);
    }

    decreaseVolume_init() {
        let volumeDown =new cc.Component.EventHandler();
        volumeDown.target = this.node;
        volumeDown.component = "LobbyManager";
        volumeDown.handler = "DecreaseVolume";
        
        volumeDown.customEventData = "foobar";
        cc.find("Canvas/pause/MinusButtonMsc").getComponent(cc.Button).clickEvents.push(volumeDown);
    }

    DecreaseVolume(event, customEventData) {
        // console.log("decreaseVolume called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getMusicVolume();
        // console.log(currentVolume)
        
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
        // console.log("increaseFX_init called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getEffectsVolume();
        // console.log(currentVolume)
        
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
        volumeUp.component = "LobbyManager";
        volumeUp.handler = "IncreaseFX";
        
        volumeUp.customEventData = "foobar";
        cc.find("Canvas/pause/PlusButton").getComponent(cc.Button).clickEvents.push(volumeUp);
    }

    decreaseFX_init() {
        let volumeDown =new cc.Component.EventHandler();
        volumeDown.target = this.node;
        volumeDown.component = "LobbyManager";
        volumeDown.handler = "DecreaseFX";
        
        volumeDown.customEventData = "foobar";
        cc.find("Canvas/pause/MinusButton").getComponent(cc.Button).clickEvents.push(volumeDown);
    }

    DecreaseFX(event, customEventData) {
        // console.log("decreaseVolume called");  // Added for debugging
    
        let currentVolume = cc.audioEngine.getEffectsVolume();
        // console.log(currentVolume)
        
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
        this.increaseVolume_init();
        this.increaseFX_init();  
        this.decreaseVolume_init();
        this.decreaseFX_init();
    }

    protected onLoad(): void {
      cc.audioEngine.stopAllEffects()
      this.scheduleOnce(function () {
        this.Loading.active = false;
    }, 2)
    }
}

