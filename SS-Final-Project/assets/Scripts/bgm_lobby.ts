const { ccclass, property } = cc._decorator;

@ccclass
export default class StageManager extends cc.Component {
  @property(cc.AudioClip)
  backgroundMusic: cc.AudioClip = null;

//   public audioSource: cc.AudioSource = null;

  onLoad() {
    cc.audioEngine.playMusic(this.backgroundMusic, true);
  }


  // You can add additional methods or modify existing methods as needed.
}
