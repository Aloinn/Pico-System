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
    [...Array(15)].forEach(
      (_, i) => new Boid(windowWidth / 2, windowHeight / 2, BoidType.PASSIVE)
    );

    [...Array(20)].forEach(
      () => new Fruit(random(windowWidth), random(windowHeight))
    );
  }

  gameRestart() {
    Game.score = 0;
    Game.hostiles = 0;
  }

  loop() {
    if (!Game.player.dead) {
      Game.player.applyMouseSteer(2);
      Game.player.update();
      Game.player.wrapAround();
    } else {
      Game.score = Math.max(Game.score - 1, 0);
      Game.player.position.add(createVector(1, 1));
      Game.player.wrapAround();
      if (mouseIsPressed === true) {
        // RESTART GAME
        Game.player.dead = false;
        forAllBoids((boid) => boid.convert(BoidType.PASSIVE));
        Game.score = 0;
        Game.hostiles = 0;
      }
    }

    // APPLY TO BOIDS
    forAllBoids((boid) => {
      // BASE BOID STEERS

      if (boid.type == BoidType.PASSIVE) {
        boid.acceleration.add(boid.baseSteer());
        applyFruitSteerToBoid(boid);
        applyAvoidPlayerSteer(boid, 3);
      }

      if (boid.type == BoidType.HOSTILE) {
        boid.acceleration.add(
          levels[3]() ? boid.baseSteer() : boid.baseSteer([7, 2, 2])
        );
        applyFruitSteerToBoid(boid, 2);
        if (!Game.player.dead) {
          if (!levels[3]()) {
            applyTowardPlayerSteer(boid, 3, -1);
            applyTowardPlayerSteer(boid, 5);
          } else {
            applyAvoidPlayerSteer(boid, 3, 500);
            // applyAvoidPlayerSteer(boid, 5);
          }
        }
        applyTowardBoidSteer(boid, 4);
        const _closestPrey = closestBoid(boid.position, BoidType.PASSIVE);
        boidInRange(boid, _closestPrey, () => {
          _closestPrey.disable();
        });
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
    if (!Game.player.dead) {
      Game.player.draw();
    }
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
