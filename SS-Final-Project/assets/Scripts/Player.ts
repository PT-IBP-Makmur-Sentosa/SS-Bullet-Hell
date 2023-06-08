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
    return new PlayerClass(3, 3, "extra attack damage(+1 ATK)");
  }
  public static plane1(): PlayerClass {
    return new PlayerClass(4, 2, "invincible");
  }
  public static plane2(): PlayerClass {
    return new PlayerClass(2, 6, "extra attack speed(-0.05 interval)");
  }
  public static plane3(): PlayerClass {
    return new PlayerClass(5, 3, "extra HP(+1 HP)");
  }
  public static plane4(): PlayerClass {
    return new PlayerClass(4, 4, "double attack(2x ATK)");
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

  private lives: number = 10000;
  private attack: number = 0;
  private skill: string = "";
  private bulletanim: string = "";

  @property(cc.Prefab)
  bulletPrefab: cc.Prefab = null;

  private bulletPool = null; // this is a bullet manager, and it control the bullet resource
  private wDown: boolean = false;
  private aDown: boolean = false;
  private sDown: boolean = false;
  private dDown: boolean = false;
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

  async onLoad() {
    this.anim = this.getComponent(cc.Animation);
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getCollisionManager().enabled = true;

//     cc.director.getPhysicsManager().debugDrawFlags =
// cc.PhysicsManager.DrawBits.e_jointBit |
// cc.PhysicsManager.DrawBits.e_shapeBit;

    this.bulletPool = new cc.NodePool("Bullet");
    let maxBulletNum = 20;
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
        this.getComponent(cc.Sprite).spriteFrame = this.shipSprites[this.currentShipIndex];
        this.getComponent(cc.PhysicsPolygonCollider).points = this.shipCollider[this.currentShipIndex].points;
        this.getComponent(cc.PhysicsPolygonCollider).apply()
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
  }

  onKeyDown(event): void {
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
    }
  }

  onKeyUp(event): void {
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
      this.once = false
      //unschedule the bullet
      this.unschedule(this.createBullet);
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
      this.node.y += this.playerSpeed * 2 / 3 * dt;
    } else if (this.sDown) {
      this.node.y -= this.playerSpeed * 2 / 3 * dt;
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
      this.resetPosition();
      this.isReborn = true;
      this.lives--;
      var stageManager = cc.find("StageManager").getComponent("StageManager");
      stageManager.health = this.lives;
      //cc.log("lives: " + this.lives);
      this.anim.play("hit");
      this.getComponent(cc.PhysicsPolygonCollider).enabled = false;
      this.scheduleOnce(() => {
        this.isReborn = false;
        this.isDead = false;

        this.anim.stop("hit");
        this.getComponent(cc.PhysicsPolygonCollider).enabled = true;
      }, this.rebornTime);
    } else if (!this.lives) {
      cc.find("StageManager").getComponent("StageManager").gameOver()
      this.node.active = false
    }
  }

  resetPosition(): void {
    this.node.setPosition(this.rebornPos);
  }

  playerAnimation(): void {
    if (this.spaceDown && !this.once) {
      this.once = true
      this.createBullet()
      this.schedule(this.createBullet, 0.3);
      // this.animateState = this.anim.play("shoot");
      // cc.log(this.attack);
    }
  }

  onBeginContact(contact, selfCollider, otherCollider): void {
      if (
        (otherCollider.node.group == "enemy" ||
          otherCollider.node.group == "B_enemy") &&
        !this.isReborn
      ) {
        this.isDead = true;
      // console.log("mati")
      //enable isdead
    }

  }

  private createBullet() {
    let bullet = null;

    if (this.bulletPool.size() > 0){
      bullet = this.bulletPool.get(this.bulletPool);
      //this.node.addChild(bullet);
    }

    if (bullet != null) {
      bullet.getComponent("Bullet").init(this.node, this.bulletanim, this.attack);
      //this.node.addChild(bullet);
    }
  }
}
