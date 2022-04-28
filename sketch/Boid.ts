///<reference path="Pico.ts" />
enum BoidType {
  PASSIVE,
  HOSTILE,
}
class Boid extends Pico {
  active: boolean;
  lastAte: number;
  type: BoidType;
  constructor(x: number, y: number, type: BoidType) {
    super(x, y);
    Game.boids.push(this);
    this.spawn(type);
  }

  spawn(type: BoidType) {
    this.type = type;
    this.active = true;
    this.color = type == BoidType.HOSTILE ? COLORS.RED : COLORS.WHITE;
    this.size = type == BoidType.HOSTILE ? 20 : 8;
    this.speedMult = type == BoidType.HOSTILE ? 0.7 : 1;
    while (true) {
      const pos = createVector(random(windowWidth), random(windowHeight));
      if (pos.dist(Game.player.position) > 200) {
        this.position = createVector();
        break;
      }
    }
    // }
  }

  draw() {
    if (this.type == BoidType.PASSIVE) {
      if (levels[1]() && !levels[3]()) {
        setEdibleBorder();
      } else {
        noStroke();
      }
    }
    if (this.type == BoidType.HOSTILE) {
      if (levels[3]()) {
        setEdibleBorder();
      } else {
        noStroke();
      }
    }
    super.draw();
  }

  separateSteer(steerWeight = 1) {
    const desiredDistance = 25.0;
    const friendsPosition: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      if (boid.type != this.type) return;
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
    steer.mult(steerWeight);
    return steer;
  }

  cohesionSteer(cohesionWeight = 1) {
    const friendsRange = 50;
    const friendsPositions: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      if (boid.type != this.type) return;
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

  alignSteer(alignWeight = 1) {
    const friendsRange = 50;
    const friendsVelocities: p5.Vector[] = [];
    const self = this;
    forAllBoids((boid) => {
      if (boid.type != this.type) return;
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
    alignSteer.mult(alignWeight);
    return alignSteer;
  }

  baseSteer(weights = [2, 1, 1]) {
    const steer = createVector(0, 0);
    const separationForce = this.separateSteer(weights[0]);
    const alignForce = this.alignSteer(weights[1]);
    const cohesionForce = this.cohesionSteer(weights[2]);
    steer.add(separationForce);
    steer.add(alignForce);
    steer.add(cohesionForce);
    Game.debug && drawVector(this.position, separationForce, "red");
    Game.debug && drawVector(this.position, alignForce, "blue");
    Game.debug && drawVector(this.position, cohesionForce, "green");
    return steer;
  }

  disable() {
    Game.boidsPool.push(this);
    this.active = false;
  }
}
