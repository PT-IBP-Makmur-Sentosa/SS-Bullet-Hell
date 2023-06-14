const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemySpawner extends cc.Component {
  @property({ type: cc.Prefab })
  private enemyPrefab: cc.Prefab = null;

  @property({ type: cc.Prefab })
  private enemyPrefab2: cc.Prefab = null;

  @property({ type: cc.Prefab })
  private enemyPrefab3: cc.Prefab = null;

  private enemyPool: cc.NodePool = null;
  private isAlive: boolean = false;
  private respawnScheduler: number = null;
  private previousPlayerPosition: cc.Vec3 = null;

  onLoad() {
    this.isAlive = false;

    this.enemyPool = new cc.NodePool();
    const initialEnemyCount = 100;
    var enemy = null;
    for (let i = 0; i < initialEnemyCount; i++) {
      var random = Math.random()
      if (random < 0.3) {
        enemy = cc.instantiate(this.enemyPrefab);
      } else if (random < 0.7) {
        enemy = cc.instantiate(this.enemyPrefab2);
      } else {
        enemy = cc.instantiate(this.enemyPrefab3);
      }
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
    const posX = 0; // Adjust the X position according to your game's requirements
    const posY = 0; // Adjust the Y position according to your game's requirements

    this.node.setPosition(cc.v2(posX, posY));
  }

  private showPlayer(): void {
    // Implement your player showing logic here
  }

  pooling(enemy: cc.Node, HP: number, baseHP: number) {
    this.enemyPool.put(enemy);
    // HP = baseHP
  }

  spawn(): void {
    this.isAlive = true;
    let enemyCount = 4;
    let delay = 1;
    let totalSpawned = 0;
    const maxEnemies = 10;

    const spawnEnemy = () => {
      this.scheduleOnce(() => {
        if (totalSpawned < maxEnemies) {
          this.spawnMultiple(enemyCount); // Spawn 'enemyCount' enemies
          enemyCount++;
          totalSpawned += enemyCount;
        } else {
          this.spawnMultiple(maxEnemies);
        }
        delay = 5;
        spawnEnemy();
      }, delay);
    };

    spawnEnemy();
  }

  spawnMultiple(count: number): void {
    const minSpacing = 50; // Minimum spacing between enemies
    const maxSpacing = 510; // Maximum spacing between enemies
  
    const minSpacingX = 600; // Minimum spacing between enemies
    const maxSpacingX = 900; // Maximum spacing between enemies
  
    for (let i = 0; i < count; i++) {
      const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
      const spacingX = Math.random() * (maxSpacingX - minSpacingX) + minSpacingX;
  
      let enemy: cc.Node = null;
      let random = Math.random();
  
      if (random < 0.3) {
        if (this.enemyPool.size() > 0) {
          enemy = this.enemyPool.get();
          enemy.setPosition(cc.v2(spacingX, spacing));
        } else {
          enemy = cc.instantiate(this.enemyPrefab);
          enemy.setPosition(cc.v2(spacingX, spacing));
        }
      } else if (random < 0.7) {
        if (this.enemyPool.size() > 0) {
          enemy = this.enemyPool.get();
          enemy.setPosition(cc.v2(spacingX, spacing));
        } else {
          enemy = cc.instantiate(this.enemyPrefab2);
          enemy.setPosition(cc.v2(spacingX, spacing));
        }
      } else {
        if (this.enemyPool.size() > 0) {
          enemy = this.enemyPool.get();
          enemy.setPosition(cc.v2(spacingX, spacing));
        } else {
          enemy = cc.instantiate(this.enemyPrefab3);
          enemy.setPosition(cc.v2(spacingX, spacing));
        }
      }
  
      this.node.addChild(enemy);
      this.moveEnemy(enemy);
    }
  }
  

  moveEnemy(enemy: cc.Node): void {
    const delayAction = cc.delayTime(1); // Adjust the delay duration

    var time = Math.random() * (4) + 2;
    const moveAction = cc.moveBy(time, cc.v2(-1000, 0)); // Adjust the duration and distance

    const destroyAction = cc.callFunc(() => {
      if (enemy.position.x <= -50) {
        enemy.removeFromParent();
        this.enemyPool.put(enemy);
      }
    });

    const sequence = cc.sequence(delayAction, moveAction, destroyAction);
    enemy.runAction(sequence);
  }
}
