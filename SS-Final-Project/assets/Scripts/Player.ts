// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
declare const firebase: any;

// make a player class to have 5 different types of player
// each player has different attack, lives, and skill
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
    return new PlayerClass(3, 3, "Attack Buff"); // +1 atk
  }
  public static plane1(): PlayerClass {
    return new PlayerClass(4, 2, "Invincible"); // Invulnerable
  }
  public static plane2(): PlayerClass {
    return new PlayerClass(2, 6, "Firerate Buff"); // -0.15
  }
  public static plane3(): PlayerClass {
    return new PlayerClass(5, 3, "Heal"); // +1 HP
  }
  public static plane4(): PlayerClass {
    return new PlayerClass(4, 4, "Double Damage"); // x2 atk
  }
}
@ccclass
export default class Player extends cc.Component {
  @property()
  rebornPos: cc.Vec2 = cc.v2(0, 0);
  @property([cc.SpriteFrame])
  shipSprites: cc.SpriteFrame[] = [];
  @property([cc.PolygonCollider])
  shipCollider = [];
  @property(cc.PhysicsPolygonCollider)
  mainCollider = null;
  @property(cc.Node)
  itemSprite = null;
  @property(cc.Node)
  cooldownOverlay = null;
  @property()
  playerNo = 0;
  @property(cc.AudioClip)
  shoot_music: cc.AudioClip = null;
  @property(cc.AudioClip)
  player_die: cc.AudioClip = null;

  @property(cc.AudioClip)
  skill_effect: cc.AudioClip = null;

  private cooldown: boolean = false;
  private lives: number = 10000;
  private attack: number = 0;
  private skill: string = "";
  private bulletanim: string = "";
  private firerate: number = 0.3;
  private duration: number = 10;
  private item: boolean = false;

  @property(cc.Prefab)
  bulletPrefab: cc.Prefab = null;

  private bulletPool = null; // this is a bullet manager, and it control the bullet resource
  private wDown: boolean = false;
  private aDown: boolean = false;
  private sDown: boolean = false;
  private dDown: boolean = false;
  private kDown: boolean = false;
  private iDown: boolean = false;

  @property
  playerSpeed: number = 150;
  private isDead: boolean = false;
  private isReborn: boolean = false;
  private once: boolean = false;
  private rebornTime: number = 2;
  private spaceDown: boolean = false;
  private anim = null; //this will use to get animation component
  private animateState = null; //this will use to record animationState
  private currentShipIndex: number = 0;
  private audioID: number;

  async onLoad() {
    this.anim = this.getComponent(cc.Animation);
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getCollisionManager().enabled = true;

    //     cc.director.getPhysicsManager().debugDrawFlags =
    // cc.PhysicsManager.DrawBits.e_jointBit |
    // cc.PhysicsManager.DrawBits.e_shapeBit;

    this.bulletPool = new cc.NodePool("Bullet");
    let maxBulletNum = 500;
    for (let i: number = 0; i < maxBulletNum; i++) {
      let bullet = cc.instantiate(this.bulletPrefab);
      this.bulletPool.put(bullet);
    }

    const user = firebase.auth().currentUser;
    const db = firebase.database();
    const userRef = db.ref("users/" + user?.uid);
    userRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        this.currentShipIndex = userData.selectedShipIndex;
        const stagesUnlocked = userData.stage;
        cc.log("stagesUnlocked: " + stagesUnlocked);
        this.getComponent(cc.Sprite).spriteFrame =
          this.shipSprites[this.currentShipIndex];
        this.getComponent(cc.PhysicsPolygonCollider).points =
          this.shipCollider[this.currentShipIndex].points;
        this.getComponent(cc.PhysicsPolygonCollider).apply();
        // set the player's lives and attack
        if (this.currentShipIndex == 0) {
          this.lives = PlayerClass.original().getLives();
          this.attack = PlayerClass.original().getAttack();
          this.skill = PlayerClass.original().getSkill();
          this.bulletanim = "bullet";
        } else if (this.currentShipIndex == 1) {
          this.lives = PlayerClass.plane1().getLives();
          this.attack = PlayerClass.plane1().getAttack();
          this.skill = PlayerClass.plane1().getSkill();
          this.bulletanim = "bullet1";
        } else if (this.currentShipIndex == 2) {
          this.lives = PlayerClass.plane2().getLives();
          this.attack = PlayerClass.plane2().getAttack();
          this.skill = PlayerClass.plane2().getSkill();
          this.bulletanim = "bullet2";
        } else if (this.currentShipIndex == 3) {
          this.lives = PlayerClass.plane3().getLives();
          this.attack = PlayerClass.plane3().getAttack();
          this.skill = PlayerClass.plane3().getSkill();
          this.bulletanim = "bullet3";
        } else if (this.currentShipIndex == 4) {
          this.lives = PlayerClass.plane4().getLives();
          this.attack = PlayerClass.plane4().getAttack();
          this.skill = PlayerClass.plane4().getSkill();
          this.bulletanim = "bullet4";
        }
      }
    });
  }
  start(): void {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
  }
  update(dt): void {
    this.playerMovement(dt);
    this.playerReborn(dt);
    this.playerAnimation();
    this.playerUtil();
    this.coolDown(dt);
  }

  onKeyDown(event): void {
    if (event.keyCode == cc.macro.KEY.k) {
      this.kDown = true;
    }
    if (event.keyCode == cc.macro.KEY.i) {
      this.iDown = true;
    }
    if (this.playerNo == 0) {
      if (event.keyCode == cc.macro.KEY.w) {
        this.wDown = true;
      }
      if (event.keyCode == cc.macro.KEY.a) {
        this.aDown = true;
      }
      if (event.keyCode == cc.macro.KEY.s) {
        this.sDown = true;
      }
      if (event.keyCode == cc.macro.KEY.d) {
        this.dDown = true;
      }
      if (event.keyCode == cc.macro.KEY.space && !this.once) {
        this.spaceDown = true;
        // cc.audioEngine.playEffect(this.shoot_music, false);
      }
    } else if (this.playerNo == 1) {
      if (event.keyCode == cc.macro.KEY.up) {
        this.wDown = true;
      }
      if (event.keyCode == cc.macro.KEY.left) {
        this.aDown = true;
      }
      if (event.keyCode == cc.macro.KEY.down) {
        this.sDown = true;
      }
      if (event.keyCode == cc.macro.KEY.right) {
        this.dDown = true;
      }
      if (event.keyCode == cc.macro.KEY.shift && !this.once) {
        this.spaceDown = true;
        // cc.audioEngine.playEffect(this.shoot_music, true);
      }
    }
  }

  onKeyUp(event): void {
    if (event.keyCode == cc.macro.KEY.k) {
      this.kDown = false;
    }
    if (event.keyCode == cc.macro.KEY.i) {
      this.iDown = false;
    }
    if (this.playerNo == 0) {
      if (event.keyCode == cc.macro.KEY.w) {
        this.wDown = false;
      }
      if (event.keyCode == cc.macro.KEY.a) {
        this.aDown = false;
      }
      if (event.keyCode == cc.macro.KEY.s) {
        this.sDown = false;
      }
      if (event.keyCode == cc.macro.KEY.d) {
        this.dDown = false;
      }
      if (event.keyCode == cc.macro.KEY.space) {
        this.spaceDown = false;
        this.once = false;
        //unschedule the bullet
        this.unschedule(this.createBullet);
        cc.audioEngine.stopEffect(this.audioID);
      }
    } else if (this.playerNo == 1) {
      if (event.keyCode == cc.macro.KEY.up) {
        this.wDown = false;
      }
      if (event.keyCode == cc.macro.KEY.left) {
        this.aDown = false;
      }
      if (event.keyCode == cc.macro.KEY.down) {
        this.sDown = false;
      }
      if (event.keyCode == cc.macro.KEY.right) {
        this.dDown = false;
      }
      if (event.keyCode == cc.macro.KEY.shift) {
        this.spaceDown = false;
        this.once = false;
        //unschedule the bullet
        this.unschedule(this.createBullet);
        cc.audioEngine.stopEffect(this.audioID);
      }
    }
  }

  getItem() {
    if (this.item == false) {
      this.item = true;
      this.itemSprite.active = true;
    }
  }

  timed = 0;
  coolDown(dt): void {
    if (this.cooldown == true) {
      this.timed += dt;
      this.cooldownOverlay.height = (this.timed / 15) * 50;
      //console.log(this.timed)
      if (this.timed >= 15) {
        this.timed = 15;
      }
    }
  }

  playerUtil(): void {
    if (!this.cooldown && this.kDown) {
      // play sound effect
      cc.audioEngine.playEffect(this.skill_effect, false);
      this.cooldown = true;
      this.scheduleOnce(function () {
        this.cooldown = false;
        this.cooldownOverlay.height = 0;
        this.timed = 0;
      }, 15);
      if (this.skill == "Attack Buff") {
        this.attack += 1;
        console.log(this.attack);
        this.scheduleOnce(function () {
          this.attack -= 1;
          console.log(this.attack);
        }, this.duration);
      } else if (this.skill == "Invincible") {
        console.log("invul");
        this.isReborn = true;
        this.anim.play("hit");
        this.mainCollider.enabled = false;
        this.scheduleOnce(() => {
          this.isReborn = false;
          this.anim.stop("hit");
          this.mainCollider.enabled = true;
        }, 5);
      } else if (this.skill == "Firerate Buff") {
        this.firerate -= 0.15;
        console.log(this.firerate);
        this.once = false;
        this.scheduleOnce(function () {
          this.firerate += 0.15;
          this.once = false;
          console.log(this.firerate);
        }, this.duration);
      } else if (this.skill == "Heal") {
        this.lives += 1;
      } else if (this.skill == "Double Damage") {
        this.attack *= 2;
        console.log(this.attack);
        this.scheduleOnce(function () {
          this.attack /= 2;
          console.log(this.attack);
        }, this.duration);
      }
    }

    if (this.iDown && this.item == true) {
      this.lives += 1;
      this.item = false;
      this.itemSprite.active = false;
      console.log(this.lives + " " + this.playerNo);
    }
  }

  playerMovement(dt): void {
    // the player move horizontally left
    if (this.aDown) {
      this.node.x -= this.playerSpeed * dt;
    } else if (this.dDown) {
      this.node.x += this.playerSpeed * dt;
    }

    // the player move vertically
    if (this.wDown) {
      this.node.y += ((this.playerSpeed * 2) / 3) * dt;
    } else if (this.sDown) {
      this.node.y -= ((this.playerSpeed * 2) / 3) * dt;
    }

    // set the boundary of the player
    if (this.node.x < -cc.winSize.width / 2 + this.node.width / 2) {
      this.node.x = -cc.winSize.width / 2 + this.node.width / 2;
    } else if (this.node.x > cc.winSize.width / 2 - this.node.width / 2) {
      this.node.x = cc.winSize.width / 2 - this.node.width / 2;
    }
    if (this.node.y < -580 / 2 + this.node.height / 2) {
      this.node.y = -580 / 2 + this.node.height / 2;
    } else if (this.node.y > 580 / 2 - this.node.height / 2) {
      this.node.y = 580 / 2 - this.node.height / 2;
    }
  }

  playerReborn(dt): void {
    if (this.isDead && !this.isReborn && this.lives > 0) {
      // this.resetPosition();
      this.isReborn = true;
      this.lives--;
      cc.audioEngine.playEffect(this.player_die, false);
      var stageManager = cc.find("StageManager").getComponent("StageManager");
      stageManager.health = this.lives;
      //cc.log("lives: " + this.lives);
      this.anim.play("hit");
      this.mainCollider.enabled = false;
      this.scheduleOnce(() => {
        this.isReborn = false;
        this.isDead = false;

        this.anim.stop("hit");
        this.mainCollider.enabled = true;
      }, this.rebornTime);
    } else if (!this.lives) {
      if (this.playerNo == 0)
        cc.find("StageManager").getComponent("StageManager").gameOver();
      this.node.active = false;
    }
  }

  // resetPosition(): void {
  //   this.node.setPosition(this.rebornPos);
  // }

  playerAnimation(): void {
    if (this.spaceDown && !this.once) {
      this.once = true;
      this.createBullet();
      this.schedule(this.createBullet, this.firerate);
      // this.animateState = this.anim.play("shoot");
      // cc.log(this.attack);
      this.audioID = cc.audioEngine.playEffect(this.shoot_music, true);
    }
    if (this.wDown || this.sDown) {
      this.anim.playAdditive("player_updown");
    }
    if (this.dDown) {
      this.anim.playAdditive("player_acc");
    }
  }

  onBeginContact(contact, selfCollider, otherCollider): void {
    if (
      (otherCollider.node.group == "enemy" ||
        otherCollider.node.group == "B_enemy") &&
      !this.isReborn
    ) {
      this.isDead = true;
      cc.audioEngine.stopEffect(this.audioID);
      // console.log("mati")
      //enable isdead
    }
  }

  private createBullet() {
    let bullet = null;

    if (this.bulletPool.size() > 0) {
      bullet = this.bulletPool.get(this.bulletPool);
      //this.node.addChild(bullet);
    }

    if (bullet != null) {
      bullet
        .getComponent("Bullet")
        .init(this.node, this.bulletanim, this.attack);
      //this.node.addChild(bullet);
    }
  }
}
