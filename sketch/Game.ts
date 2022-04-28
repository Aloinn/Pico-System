class Game {
  static main: Game;
  static debug = false;
  static UI: UI;
  static boids: Boid[] = [];
  static boidsPool: Boid[] = [];
  static fruits: Fruit[] = [];
  static fruitsPool: Fruit[] = [];
  static player: Player;
  static score = 0;
  static hostiles: number;
  init() {
    // PLAYER BOID
    Game.player = new Player(windowWidth / 2 - 100, windowHeight / 2);
    Game.score = 0;
    Game.hostiles = 0;
    Game.UI = new UI();

    // NPC BOID
    [...Array(10)].map(
      (_, i) => new Boid(windowWidth / 2, windowHeight / 2, BoidType.PASSIVE)
    );
    [...Array(20)].map(
      () => new Fruit(random(windowWidth), random(windowHeight))
    );
  }

  loop() {
    Game.player.applyMouseSteer(2);
    Game.player.update();
    Game.player.wrapAround();

    // APPLY TO BOIDS
    forAllBoids((boid) => {
      // BASE BOID STEERS

      if (boid.type == BoidType.PASSIVE) {
        boid.acceleration.add(boid.baseSteer());
        applyFruitSteerToBoid(boid);
        applyAvoidPlayerSteer(boid, 3);
      }

      if (boid.type == BoidType.HOSTILE) {
        boid.acceleration.add(boid.baseSteer([6, 2, 2]));
        !levels[3]() && applyTowardPlayerSteer(boid, 5);
        levels[3]() && applyAvoidPlayerSteer(boid, 6);
        applyTowardBoidSteer(boid, 3);
        boid.speedMult = 0.95;
      }

      // UPDATE ALL BOIDS
      boid.update();
      boid.wrapAround();
    });

    // APPLY TO FRUITS
    forAllFruits((fruit) => {
      fruit.update();
    });

    // RANDOM SPAWN
    spawnFruitRandomly();
    spawnBoidRandomly();
  }

  draw() {
    push();
    noFill();

    // ZOOM SCALING AND FOLLOW PLAYER
    const S = 1.9 - Game.score / 100;
    const TX = width / S / 2 - Game.player.position.x;
    const TY = height / S / 2 - Game.player.position.y;
    scale(S);
    translate(TX, TY);

    // DRAW ALL BOIDS
    forAllBoids((boid) => boid.draw());
    forAllFruits((fruit) => fruit.draw());
    Game.player.draw();
    pop();

    // DRAW UI
    push();
    Game.score = min(Game.score, 100);
    Game.UI.draw();
    pop();
  }
}

const _levels = 4;
const levels = [...Array(_levels)].map(
  (x, i) => () => Game.score >= (i * 100) / _levels
);
