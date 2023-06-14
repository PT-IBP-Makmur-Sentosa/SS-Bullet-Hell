const { ccclass, property } = cc._decorator;

@ccclass
export default class NewScene extends cc.Component {
  private stageManager: StageManager = null;

  onLoad() {
    // Assuming the "AudioManager" node is named "AudioManager" in the new scene
    const audioManagerNode = cc.find("AudioManager");
    this.stageManager = audioManagerNode.getComponent(StageManager);

    this.stageManager.pauseBackgroundMusic();
  }

}
