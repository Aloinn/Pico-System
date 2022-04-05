const forAllBoids = (fn:(b:Boid)=>void) => {
 Game.boids.forEach((boid) => {
   fn(boid);
 });
};

const createPlayer = () => {
 const player = new Boid(windowWidth / 2, windowHeight / 2);
};

// SCARED BOID BEHAVIOUR
const applyAvoidPlayerSteer = (boid: Boid, weight: number) => {
 if (!Game.player) return;
 if (playerInRange(boid, 250)) {
   const pushForce = p5.Vector.mult(
     boid.seek(Game.player.position),
     -1 * weight
   );
   drawVector(boid.position, pushForce, "red");
   boid.acceleration.add(pushForce);
 }
};

// HUNGRY BOID BEHAVIOUR (steer towards food)
const applyFruitSteerToBoid = (boid: Boid) => {
 const full = millis() / 1000 - boid.lastAte > 5;
 const fruit = closestFruit(boid.position);
 if (fruit && !full) {
   // circle(fruit.position.x,fruit.position.y, 50)
   const attractionForce = p5.Vector.mult(boid.seek(fruit.position), 2);
   drawVector(boid.position, attractionForce, "white");
   boid.acceleration.add(attractionForce);
 }
};

const playerInRange = (boid: Boid, range = 200) =>
 p5.Vector.sub(Game.player.position, boid.position).mag() < range;
