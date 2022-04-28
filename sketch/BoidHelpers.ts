const forAllBoids = (fn: (b: Boid) => void) => {
  Game.boids
    .filter((boid) => boid.active)
    .forEach((boid) => {
      fn(boid);
    });
};

// SCARED BOID BEHAVIOUR
const applyAvoidPlayerSteer = (boid: Boid, weight: number) => {
  if (!Game.player) return;
  if (playerInRange(boid, 250)) {
    const pushForce = p5.Vector.mult(
      boid.seek(Game.player.position),
      -1 * weight
    );
    Game.debug && drawVector(boid.position, pushForce, "red");
    boid.acceleration.add(pushForce);
  }
};

// HOSTILE BOID BEHAVIOUR
const applyTowardPlayerSteer = (boid: Boid, weight: number) => {
  if (!Game.player) return;
  if (playerInRange(boid, 400)) {
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

const playerInRange = (boid: Boid, range = 200) =>
  p5.Vector.sub(Game.player.position, boid.position).mag() < range;

//
const closestBoid = (position: p5.Vector, type: BoidType) => {
  const closeBoids = Game.boids.filter(
    (boid) =>
      boid.type == type &&
      boid.active &&
      p5.Vector.sub(position, boid.position).mag() < 300
  );
  if (closeBoids.length == 0) return;
  const _closestBoid = closeBoids.reduce(
    (pBoid, cBoid) =>
      p5.Vector.sub(position, pBoid.position).mag() <
      p5.Vector.sub(position, cBoid.position).mag()
        ? pBoid
        : cBoid,
    closeBoids[0]
  );
  return _closestBoid;
};

// SPAWN FRUIT
const spawnBoidRandomly = () => {
  if (frameCount % 30 == 0) {
    if (Game.boidsPool.length != 0) {
      const boid = Game.boidsPool.pop();

      boid.spawn(Game.hostiles < 5 ? BoidType.HOSTILE : BoidType.PASSIVE);
      Game.hostiles += Game.hostiles < 5 ? 1 : 0;
    }
  }
};
