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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.videoPlayer.node.on('ready-to-play', this.playVideo, this);
        this.videoPlayer.node.on("completed", this.onVideoCompleted, this);
    }
    playVideo() {
        this.videoPlayer.play();
        cc.audioEngine.playMusic(this.bgm, true);
    }
    onVideoCompleted() {
        // Load the new scene here
        cc.director.loadScene("Main Menu");
      }
    // start () {}

    // update (dt) {}
}
