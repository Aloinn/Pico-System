const forAllBoids = (fn: (b: Boid) => void) => {
  Game.boids
    .filter((boid) => boid.active)
    .forEach((boid) => {
      fn(boid);
    });
};

// SCARED BOID BEHAVIOUR
const applyAvoidPlayerSteer = (
  boid: Boid,
  weight: number,
  maxDistance?: number
) => {
  if (!Game.player) return;
  if (playerInRange(boid, maxDistance || 400)) {
    const pushForce = p5.Vector.mult(
      boid.seek(Game.player.position),
      -1 * weight
    );
    Game.debug && drawVector(boid.position, pushForce, "red");
    boid.acceleration.add(pushForce);
  }
};

// HOSTILE BOID BEHAVIOUR
const applyTowardPlayerSteer = (
  boid: Boid,
  weight: number,
  maxDistance?: number
) => {
  if (!Game.player) return;
  if (playerInRange(boid, maxDistance || 400)) {
    const pushForce = p5.Vector.mult(
      boid.seek(Game.player.position),
      1 * weight
    );
    Game.debug && drawVector(boid.position, pushForce, "red");
    boid.acceleration.add(pushForce);
  }
};

const applyTowardBoidSteer = (boid: Boid, weight: number) => {
  const _closestBoid = closestBoid(boid.position, BoidType.PASSIVE);
  if (_closestBoid) {
    const pullForce = p5.Vector.mult(
      boid.seek(_closestBoid.position),
      1 * weight
    );
    Game.debug && drawVector(boid.position, pullForce, "blue");
    boid.acceleration.add(pullForce);
  }
};

// HUNGRY BOID BEHAVIOUR (steer towards food)
const applyFruitSteerToBoid = (boid: Boid, weight = 2) => {
  const full = millis() / 1000 - boid.lastAte > 5;
  const fruit = closestFruit(boid.position);
  if (fruit && !full) {
    // circle(fruit.position.x,fruit.position.y, 50)
    const attractionForce = p5.Vector.mult(boid.seek(fruit.position), weight);
    Game.debug && drawVector(boid.position, attractionForce, "white");
    boid.acceleration.add(attractionForce);
  }
};

const playerInRange = (
  boid: Boid,
  range = 200 // -1 = infinite range
) =>
  range == -1
    ? true
    : p5.Vector.sub(Game.player.position, boid.position).mag() < range;

//
const closestBoid = (position: p5.Vector, type: BoidType) => {
  const closeBoids = Game.boids.filter(
    (boid) =>
      boid.type == type &&
      boid.active &&
      p5.Vector.sub(position, boid.position).mag() < 300
  );
  if (closeBoids.length == 0) return;
  return closeBoids.reduce(
    (pBoid, cBoid) =>
      p5.Vector.sub(position, pBoid.position).mag() <
      p5.Vector.sub(position, cBoid.position).mag()
        ? pBoid
        : cBoid,
    closeBoids[0]
  );
};

// SPAWN FRUIT
const spawnBoidRandomly = () => {
  if (frameCount % 30 == 0) {
    if (Game.boidsPool.length != 0) {
      const boid = Game.boidsPool.pop();

      if (Game.hostiles < 5 && levels[1]()) {
        boid.spawn(BoidType.HOSTILE);
        Game.hostiles += 1;
      } else {
        boid.spawn(BoidType.PASSIVE);
      }
    }
  }
};

// BOID EAT BOID
const boidInRange = (boid: Pico, prey?: Pico | Boid, after?: () => void) => {
  if (
    prey &&
    p5.Vector.sub(prey.position, boid.position).mag() <
      (boid.size * 5) / 2 + (prey.size * 5) / 2
  ) {
    after?.();
  }
};
