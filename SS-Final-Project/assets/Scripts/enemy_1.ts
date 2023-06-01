const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
  @property({ type: cc.Prefab })
  private enemyPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab })
  private bulletPrefab: cc.Prefab = null;

  @property({ type: cc.Node })
  private playerNode: cc.Node = null;

  private enemyPool: cc.NodePool = null;
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

    this.enemyPool = new cc.NodePool();
    const initialEnemyCount = 10;
    for (let i = 0; i < initialEnemyCount; i++) {
      const enemy = cc.instantiate(this.enemyPrefab);
      this.enemyPool.put(enemy);
    }
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
    let enemyCount = 1;
    let delay = 1;
    let totalSpawned = 0;
    const maxEnemies = 10;
  
    const spawnEnemy = () => {
      this.scheduleOnce(() => {
        if (totalSpawned < maxEnemies) {
          this.spawnMultiple(enemyCount); // Spawn 'enemyCount' enemies
          enemyCount++;
          totalSpawned++;
        }
        else {
          this.spawnMultiple(enemyCount);
        }
        delay = 2;
        spawnEnemy();
      }, delay);
    };
  
    // spawnEnemy();
  }
  

  spawnMultiple(count: number): void {
    const minSpacing = 50; // Minimum spacing between enemies
    const maxSpacing = 600; // Maximum spacing between enemies

    const minSpacingX = 700; // Minimum spacing between enemies
    const maxSpacingX = 850; // Maximum spacing between enemies

    for (let i = 0; i < count; i++) {
      const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
      const spacingX = Math.random() * (maxSpacingX - minSpacingX) + minSpacingX;

      let enemy: cc.Node = null;
      if (this.enemyPool.size() > 0) {
        enemy = this.enemyPool.get();
        enemy.setPosition(cc.v2(spacingX, spacing));
      } else {
        enemy = cc.instantiate(this.enemyPrefab);
        enemy.setPosition(cc.v2(spacingX, spacing));
      }

      this.node.addChild(enemy);
      this.moveEnemy(enemy);
    }
  }

  moveEnemy(enemy: cc.Node): void {
    // Move enemy horizontally to the left
    const moveAction = cc.moveBy(5, cc.v2(-1000, 0)); // Adjust the duration and distance
    const destroyAction = cc.callFunc(() => {
      if (enemy.position.x <= -5) {
        enemy.removeFromParent();
        this.enemyPool.put(enemy);
      }
    });

    const sequence = cc.sequence(moveAction, destroyAction);
    enemy.runAction(sequence);
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
        // this.shootTowardsPlayer();
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
