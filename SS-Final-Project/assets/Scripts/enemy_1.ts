const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
  @property({ type: cc.Prefab })
  private enemyPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  @property({ type: cc.Node })
  private playerNode: cc.Node = null;

  private enemyNode: cc.Node = null;
  private isAlive: boolean = false;
  private speed: number = 200;
  private shootInterval: number = 1.5;
  private respawnScheduler: number = null;
  private shootScheduler: number = null;
  private moveScheduler: number = null;
  private previousPlayerPosition: cc.Vec2 = null;

  onLoad() {
    this.isAlive = false;
    this.speed = 200; // Adjust the speed of the enemy's movement
    this.shootInterval = 1.5; // Adjust the time interval between shots
  }

  start() {
    this.init();
  }

  init(): void {
    this.setInitialPosition();
    this.spawn();
    this.showPlayer();
  }

  private setInitialPosition(): void {
    // Set the initial position of the enemy
    const posX = 0; // Adjust the X position according to your game's requirements
    const posY = 0; // Adjust the Y position according to your game's requirements

    this.node.setPosition(cc.v2(posX, posY));
  }

  private showPlayer(): void {
    if (this.playerNode && !this.playerNode.parent) {
      // Save the previous player position
      if (!this.previousPlayerPosition) {
        this.previousPlayerPosition = this.playerNode.position;
      }

      // Set the position of the player node
      const playerPosition = cc.v2(597.646, 36.343); // Adjust the player's position
      this.playerNode.setPosition(playerPosition);

      // Add the player node to the parent node or appropriate container
      this.node.parent.addChild(this.playerNode);
    } else {
      console.log("Player node not assigned or already added!");
      this.previousPlayerPosition = this.playerNode.position;
    }
  }

  spawn(): void {
    this.isAlive = true;
  
    // Instantiate the enemy prefab
    this.enemyNode = cc.instantiate(this.enemyPrefab);
    // this.node.addChild(this.enemyNode);
  
    this.scheduleOnce(() => {
        this.spawnMultiple(3); // Spawn 3 enemies
      }, 1);
    // this.scheduleShoot();
  }
  
  

  spawnMultiple(count: number): void {
    const spacing = 300; // Adjust the spacing between enemies
  
    for (let i = 0; i < count; i++) {
      const enemy = cc.instantiate(this.enemyPrefab);
      enemy.setPosition(cc.v2((i + 1) * spacing, 450));
      this.node.addChild(enemy);
      console.log("Spawned enemy at index", i);
      this.scheduleShoot();
    }
  }
  

  


  unscheduleRespawn(): void {
    // Stop the enemy respawn scheduler
    cc.director.getScheduler().unschedule(this.respawnScheduler, this);
  }

  scheduleShoot(): void {
    // Schedule bullet shooting with a delay equal to shootInterval
    this.shootScheduler = cc.director.getScheduler().schedule(
      () => {
        this.shootTowardsBottom();
        this.shootTowardsPlayer();
      },
      this,
      this.shootInterval,
      false
    );
  }

  unscheduleShoot(): void {
    cc.director.getScheduler().unschedule(this.shootScheduler, this);
  }

  shootTowardsBottom(): void {
    const bullet = cc.instantiate(this.bulletPrefab);
    bullet.setPosition(this.enemyNode.position);

    const bulletSpeed = 300;
    const bulletEndPosition = cc.v2(bullet.position.x, -100);

    const distance = bullet.position.sub(bulletEndPosition).mag();
    const duration = distance / bulletSpeed;

    const moveAction = cc.moveTo(duration, bulletEndPosition);
    const removeAction = cc.removeSelf(true);

    bullet.runAction(cc.sequence(moveAction, removeAction));

    this.node.parent.addChild(bullet);
    // Play a shooting sound effect if desired
    // ...
  }

  shootTowardsPlayer(): void {
    // Create an instance of the bullet prefab
    const bullet = cc.instantiate(this.bulletPrefab);
    bullet.setPosition(this.enemyNode.position);
    const bulletDirection = this.previousPlayerPosition
      ? this.previousPlayerPosition.sub(bullet.getPosition()).normalize()
      : cc.v2(0, -1);

    // Calculate the bullet's movement
    const bulletSpeed = 500;
    const bulletEndPosition = bullet.getPosition().add(bulletDirection.mul(1000));

    const distance = bullet.getPosition().sub(bulletEndPosition).mag();
    const duration = distance / bulletSpeed;

    const moveAction = cc.moveTo(duration, bulletEndPosition);
    const removeAction = cc.removeSelf(true);
    bullet.runAction(cc.sequence(moveAction, removeAction));
    this.node.parent.addChild(bullet);
  }
}
