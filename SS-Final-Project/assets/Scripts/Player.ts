// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

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
  public static plane2(): PlayerClass {
    return new PlayerClass(4, 2, "invincible");
  }
  public static plane3(): PlayerClass {
    return new PlayerClass(2, 6, "extra attack speed(-0.05 interval)");
  }
  public static plane4(): PlayerClass {
    return new PlayerClass(5, 3, "extra HP(+1 HP)");
  }
  public static plane5(): PlayerClass {
    return new PlayerClass(4, 4, "double attack(2x ATK)");
  }
}
@ccclass
export default class Player extends cc.Component {
  @property()
  rebornPos: cc.Vec2 = cc.v2(0, 0);

  @property()
  lives: number = 3;

  @property(cc.Prefab)
  bulletPrefab: cc.Prefab = null;

  private bulletPool = null; // this is a bullet manager, and it control the bullet resource
  private wDown: boolean = false;
  private aDown: boolean = false;
  private sDown: boolean = false;
  private dDown: boolean = false;
  private playerSpeed: number = 150;
  private isDead: boolean = false;
  private isReborn: boolean = false;
  private rebornTime: number = 2;
  private spaceDown: boolean = false;
  private anim = null; //this will use to get animation component
  private animateState = null; //this will use to record animationState

  onLoad(): void {
    this.anim = this.getComponent(cc.Animation);
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getCollisionManager().enabled = true;
    this.bulletPool = new cc.NodePool("Bullet");

    let maxBulletNum = 20;

    for (let i: number = 0; i < maxBulletNum; i++) {
      let bullet = cc.instantiate(this.bulletPrefab);

      this.bulletPool.put(bullet);
    }
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
    if (event.keyCode == cc.macro.KEY.space) {
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
      this.node.y += this.playerSpeed * dt;
    } else if (this.sDown) {
      this.node.y -= this.playerSpeed * dt;
    }

    // set the boundary of the player
    if (this.node.x < -cc.winSize.width / 2 + this.node.width / 2) {
      this.node.x = -cc.winSize.width / 2 + this.node.width / 2;
    } else if (this.node.x > cc.winSize.width / 2 - this.node.width / 2) {
      this.node.x = cc.winSize.width / 2 - this.node.width / 2;
    }
    if (this.node.y < -cc.winSize.height / 2 + this.node.height / 2) {
      this.node.y = -cc.winSize.height / 2 + this.node.height / 2;
    } else if (this.node.y > cc.winSize.height / 2 - this.node.height / 2) {
      this.node.y = cc.winSize.height / 2 - this.node.height / 2;
    }
  }

  playerReborn(dt): void {
    if (this.isDead && !this.isReborn && this.lives > 0) {
      this.resetPosition();
      this.isReborn = true;
      this.lives--;
      cc.log("lives: " + this.lives);
      this.anim.play("hit");
      this.scheduleOnce(() => {
        this.isReborn = false;
        this.isDead = false;

        this.anim.stop("hit");
      }, this.rebornTime);
    } else if (!this.lives) {
      this.node.destroy();
    }
  }

  resetPosition(): void {
    this.node.setPosition(this.rebornPos);
  }

  playerAnimation(): void {
    if (this.spaceDown) {
      this.schedule(this.createBullet, 0.3);
      this.animateState = this.anim.play("shoot");
    }
  }

  onBeginContact(contact, selfCollider, otherCollider): void {
    if (otherCollider.node.group == "enemy" && !this.isReborn) {
      this.isDead = true;
    }
  }

  private createBullet() {
    let bullet = null;

    if (this.bulletPool.size() > 0)
      bullet = this.bulletPool.get(this.bulletPool);

    if (bullet != null) bullet.getComponent("Bullet").init(this.node);
  }
}
