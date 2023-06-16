// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
declare const firebase: any;
const { ccclass, property } = cc._decorator;

class PlayerClass {
  private attack: number;
  private lives: number;
  private skill: string;

  constructor(attack: number, lives: number, skill: string) {
    this.attack = attack;
    this.lives = lives;
    this.skill = skill;
  }

  public getAttack(): number {
    return this.attack;
  }

  public getLives(): number {
    return this.lives;
  }

  public getSkill(): string {
    return this.skill;
  }

  public static original(): PlayerClass {
    return new PlayerClass(3, 3, "Attack Buff");
  }
  public static plane1(): PlayerClass {
    return new PlayerClass(4, 2, "Invincible");
  }
  public static plane2(): PlayerClass {
    return new PlayerClass(2, 6, "Firerate Buff");
  }
  public static plane3(): PlayerClass {
    return new PlayerClass(5, 3, "Heal");
  }
  public static plane4(): PlayerClass {
    return new PlayerClass(4, 4, "Double Damage");
  }
}

@ccclass
export default class NewClass extends cc.Component {

  @property([cc.SpriteFrame])
  shipSprites: cc.SpriteFrame[] = [];

  @property(cc.Sprite)
  renderShipSprite: cc.Sprite = null;

  @property(cc.Button)
  btnLeft: cc.Button = null;

  @property(cc.Button)
  btnRight: cc.Button = null;

  @property(cc.Button)
  shopBtn: cc.Button = null;

  @property(cc.Button)
  stage1Btn: cc.Button = null;

  @property(cc.Button)
  stage2Btn: cc.Button = null;

  @property(cc.Button)
  stage3Btn: cc.Button = null;

  @property(cc.Sprite)
  loading: cc.Sprite = null;

  @property(cc.Label)
  attackLabel: cc.Label = null;

  @property(cc.Label)
  livesLabel: cc.Label = null;

  @property(cc.Label)
  skillLabel: cc.Label = null;

  @property(cc.Sprite)
  leaderboard: cc.Sprite = null;

  @property(cc.Button)
  leaderboardButton: cc.Button = null;

  @property(cc.Sprite)
  help: cc.Sprite = null;

  @property(cc.Button)
  helpButton: cc.Button = null;

  // LIFE-CYCLE CALLBACKS:
  private lives: number = 10000;
  private attack: number = 0;
  private skill: string = "";

  private currentShipIndex: number = 0;
  private availableShip: Array<boolean> = [true, false, false, false, false];
  async onLoad() {
    const user = firebase.auth().currentUser;
    const db = firebase.database();
    const userRef = db.ref('users/' + user?.uid);
    userRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        this.loading.node.active = false;
        const userData = snapshot.val();
        this.currentShipIndex = userData.selectedShipIndex;
        this.attackLabel.string = "Attack: " + this.attack.toString();
        this.livesLabel.string = "Lives: " + this.lives.toString();
        this.skillLabel.string = this.skill;
        this.availableShip = userData.shipUnLocked;
        const stagesUnlocked = userData.stage;
        this.updateShipDisplay();
        this.updateShipStats();
        cc.audioEngine.setMusicVolume(userData.bgm);
        cc.audioEngine.setEffectsVolume(userData.sfx);
        // if(stagesUnlocked[0]){
        //     this.stage1Btn.node.opacity = 255;
        //     this.stage1Btn.interactable = true;
        // }
        // else if (!stagesUnlocked[0]){
        //     this.stage1Btn.node.opacity = 150;
        //     this.stage1Btn.interactable = false;
        // }

        // if(stagesUnlocked[1]){
        //     this.stage2Btn.node.opacity = 255;
        //     this.stage2Btn.interactable = true;
        // }
        // else if (!stagesUnlocked[1]){
        //     this.stage2Btn.node.opacity = 150;
        //     this.stage2Btn.interactable = false;
        // }

        // if(stagesUnlocked[2]){
        //     this.stage3Btn.node.opacity = 255;
        //     this.stage3Btn.interactable = true;
        // }
        // else if (!stagesUnlocked[2]){
        //     this.stage3Btn.node.opacity = 150;
        //     this.stage3Btn.interactable = false;
        // }            
      } else {
        console.log("User not found");
      }
    });

  }
  start() {
    this.btnLeft.node.on('click', this.leftShip, this);
    this.btnRight.node.on('click', this.rightShip, this);
    this.shopBtn.node.on('click', this.openShop, this);
    this.leaderboardButton.node.on('click', this.openLeaderboard, this);
    this.helpButton.node.on('click', this.openHelp, this);
    this.updateShipDisplay();
    console.log(this.currentShipIndex)
  }

  update(dt) {
    this.attackLabel.string = "Attack: " + (this.attack == 999 ? "???" : this.attack.toString());
    this.livesLabel.string = "Lives: " + (this.lives == 999 ? "???" : this.lives.toString());
    this.skillLabel.string = this.skill;
  }

  leftShip() {
    this.currentShipIndex--;
    console.log(this.currentShipIndex)
    if (this.currentShipIndex < 0) {
      this.currentShipIndex = this.shipSprites.length - 1;
    }
    this.updateShipDisplay();
    this.updateShipStats();
  }

  rightShip() {
    this.currentShipIndex++;
    console.log(this.currentShipIndex)
    if (this.currentShipIndex >= this.shipSprites.length) {
      this.currentShipIndex = 0;
    }
    this.updateShipDisplay();
    this.updateShipStats();
  }

  updateShipDisplay() {
    // Create a fade-out animation
    const fadeOut = cc.fadeOut(0.3);

    // Create a fade-in animation
    const fadeIn = cc.fadeIn(0.3);

    // Assign the new sprite frame
    this.renderShipSprite.spriteFrame = this.shipSprites[this.currentShipIndex];
    this.renderShipSprite.node.color = this.availableShip[this.currentShipIndex] ? cc.Color.WHITE : cc.Color.BLACK;
    // this.renderShipSprite.node.opacity = this.availableShip[this.currentShipIndex] ? 255 : 150; // Set initial opacity to 0
    // console.log("available or not");
    // console.log(this.availableShip[this.currentShipIndex]);
    // console.log(this.renderShipSprite.node.opacity);
    // Apply the animations
    this.renderShipSprite.node.stopAllActions();
    this.renderShipSprite.node.opacity = 0; // Set initial opacity to 0
    this.renderShipSprite.node.runAction(cc.sequence(fadeOut, cc.delayTime(0.1), fadeIn));
  }

  updateShipStats() {
    if (this.availableShip[this.currentShipIndex]) {
      switch (this.currentShipIndex) {
        case 0:
          this.attack = PlayerClass.original().getAttack();
          this.lives = PlayerClass.original().getLives();
          this.skill = PlayerClass.original().getSkill();
          break;
        case 1:
          this.attack = PlayerClass.plane1().getAttack();
          this.lives = PlayerClass.plane1().getLives();
          this.skill = PlayerClass.plane1().getSkill();
          break;
        case 2:
          this.attack = PlayerClass.plane2().getAttack();
          this.lives = PlayerClass.plane2().getLives();
          this.skill = PlayerClass.plane2().getSkill();
          break;
        case 3:
          this.attack = PlayerClass.plane3().getAttack();
          this.lives = PlayerClass.plane3().getLives();
          this.skill = PlayerClass.plane3().getSkill();
          break;
        case 4:
          this.attack = PlayerClass.plane4().getAttack();
          this.lives = PlayerClass.plane4().getLives();
          this.skill = PlayerClass.plane4().getSkill();
          break;
      }
    }
    else {
      this.attack = 999;
      this.lives = 999;
      this.skill = "???";
    }

  }

  openShop() {
    cc.director.loadScene("Shop");
  }

  async openLeaderboard() {
    const db = firebase.database();
    const usersRef = db.ref('users');
    const topUsers = [];
    await usersRef.orderByChild('score').limitToLast(3).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key;
        const userData = childSnapshot.val();
        topUsers.push({ uid, ...userData });
      });
      topUsers.sort((a, b) => b.score - a.score);
      console.log(topUsers);
    });
    const firstName = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("first").getChildByName("name");
    const firstScore = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("first").getChildByName("score");
    firstName.getComponent(cc.Label).string = topUsers[0].name;
    firstScore.getComponent(cc.Label).string = topUsers[0].score;

    const secondName = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("second").getChildByName("name");
    const secondScore = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("second").getChildByName("score");
    secondName.getComponent(cc.Label).string = topUsers[1].name;
    secondScore.getComponent(cc.Label).string = topUsers[1].score;
    const thirdName = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("third").getChildByName("name");
    const thirdScore = this.leaderboard.node.getChildByName("Leaderboard Area").getChildByName("third").getChildByName("score");
    thirdName.getComponent(cc.Label).string = topUsers[2].name;
    thirdScore.getComponent(cc.Label).string = topUsers[2].score;

    this.leaderboard.node.active = this.leaderboard.node.active ? false : true;
  }

  openHelp() {
    this.help.node.active = this.help.node.active ? false : true;
  }
  public toStage(event, customEventData: string): void {
    if (customEventData == "1") {
      //update firebase
      if (this.availableShip[this.currentShipIndex]) {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.update({
          selectedShipIndex: this.currentShipIndex,
        })
      }
      cc.director.loadScene("Singleplayer")
    }
    else if (customEventData == "2") {
      //update firebase
      if (this.availableShip[this.currentShipIndex]) {
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        const userRef = db.ref('users/' + user?.uid);
        userRef.update({
          selectedShipIndex: this.currentShipIndex,
        })
      }
      cc.director.loadScene("Stage1")
    }
    // else if(customEventData == "3"){
    //     //update firebase
    //     if(this.availableShip[this.currentShipIndex]){
    //         const user = firebase.auth().currentUser;
    //         const db = firebase.database();
    //         const userRef = db.ref('users/' + user?.uid);
    //         userRef.update({
    //             selectedShipIndex: this.currentShipIndex,
    //         })
    //     }
    //     cc.director.loadScene("Stage3")
    // }
  }
}
