// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class OpVideoControls extends cc.Component {

    @property(cc.VideoPlayer)
    videoPlayer: cc.VideoPlayer = null;

    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    @property(cc.Node)
    overlay: cc.Node = null;

    private audioBGM: any = null
    playVideo() {
        this.overlay.active = false
        this.videoPlayer.stayOnBottom = false
        this.videoPlayer.play();
        cc.audioEngine.setMusicVolume(1.0)
        cc.audioEngine.playMusic(this.bgm, true);
    }
    onVideoCompleted() {
        // Load the new scene here
        cc.audioEngine.stopMusic()
        this.scheduleOnce(function () {
            cc.director.loadScene("Main Menu");
        }, 0.5)
      }
    
    onLoad () {
        //this.videoPlayer.node.on('ready-to-play', this.playVideo, this);
        this.videoPlayer.node.on("completed", this.onVideoCompleted, this);
    }

    // update (dt) {}
}
