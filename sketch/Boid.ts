///<reference path="Pico.ts" />
class Boid extends Pico {
  lastAte: number;
  constructor(x: number, y: number) {
    super(x, y);
    Game.boids.push(this);
  }

  separateSteer(steerWeight=1){
    const desiredDistance = 25.0;
    const friendsPosition: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      const d = p5.Vector.dist(self.position, boid.position);
      if (d > 0 && d < desiredDistance) {
        const diff = p5.Vector.sub(self.position, boid.position);
        diff.normalize();
        diff.div(d);
        friendsPosition.push(diff);
      }
    });
    const steer = friendsPosition.reduce(
      (p, c) => p5.Vector.add(p, c),
      createVector(0, 0)
    );

    steer.div(friendsPosition.length || 1);
    if (steer.mag() == 0) return steer;
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.velocity);
    steer.limit(this.maxForce);
    steer.mult(steerWeight)
    return steer;
  }

  cohesionSteer(cohesionWeight=1){
    const friendsRange = 50;
    const friendsPositions: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      const d = p5.Vector.dist(self.position, boid.position);
      return d > 0 && d < friendsRange && friendsPositions.push(boid.position);
    });

    const cohesionSteerSum = friendsPositions.reduce(
      (p, c) => p5.Vector.add(p, c),
      createVector(0, 0)
    );
    cohesionSteerSum.div(friendsPositions.length || 1);
    const cohesionSteer =
      cohesionSteerSum.mag() != 0
        ? this.seek(cohesionSteerSum)
        : createVector(0, 0);
    cohesionSteer.mult(cohesionWeight);
    return cohesionSteer;
  }

  alignSteer(alignWeight=1) {
    const friendsRange = 50;
    const friendsVelocities: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      const d = p5.Vector.dist(self.position, boid.position);
      return d > 0 && d < friendsRange && friendsVelocities.push(boid.velocity);
    });

    const alignSteer = friendsVelocities.reduce(
      (p, c) => p5.Vector.add(p, c),
      createVector(0, 0)
    );
    if (alignSteer.mag() != 0) {
      alignSteer.div(friendsVelocities.length || 1);
      alignSteer.normalize();
      alignSteer.mult(this.maxSpeed);
      alignSteer.sub(this.velocity);
      alignSteer.limit(this.maxForce);
    }
    alignSteer.mult( alignWeight);
    return alignSteer;
  }

  baseSteer() {
    const steer = createVector(0, 0);
    const separationForce = this.separateSteer(2);
    const alignForce = this.alignSteer(1);
    const cohesionForce = this.cohesionSteer(1);
    steer.add(separationForce);
    steer.add(alignForce);
    steer.add(cohesionForce);
    drawVector(this.position, separationForce, "red");
    drawVector(this.position, alignForce, "blue");
    drawVector(this.position, cohesionForce, "green");
    return steer;
  }
}
