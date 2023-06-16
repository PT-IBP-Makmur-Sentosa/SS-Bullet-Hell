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

    private audioBGM: any = null
    playVideo() {
        this.videoPlayer.play();
        this.audioBGM = cc.audioEngine.playMusic(this.bgm, true);
    }
    onVideoCompleted() {
        // Load the new scene here
        cc.audioEngine.stopMusic()
        this.scheduleOnce(function () {
            cc.director.loadScene("Main Menu");
        }, 0.5)
      }
    
    start () {
        this.videoPlayer.node.on('ready-to-play', this.playVideo, this);
        this.videoPlayer.node.on("completed", this.onVideoCompleted, this);
    }

    // update (dt) {}
}
