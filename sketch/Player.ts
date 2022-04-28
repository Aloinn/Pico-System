class Player extends Pico {
  constructor(x: number, y: number) {
    super(x, y);
    this.maxSpeed = this.maxSpeed * 1.15;
    this.size = 15;
    this.color = "#CEFFC8";
  }

  applyMouseSteer(weight = 1) {
    this.acceleration.add(
      p5.Vector.mult(
        this.seek(
          p5.Vector.add(
            createVector(mouseX - width / 2, mouseY - height / 2),
            Game.player.position
          )
        ),
        weight
      )
    );
  }

  draw() {
    noStroke();
    super.draw();
  }
  update() {
    super.update();
    levels.map((fn) => (fn() ? 1 : 0)).reduce((pi, ci) => pi + ci, 0);
    // CHECK IF EAT FRUIT
    const _closestFruit = closestFruit(this.position); // TODO FIX WHEN NO FRUITS LEFT
    if (
      _closestFruit &&
      p5.Vector.sub(_closestFruit.position, this.position).mag() <
        _closestFruit.size
    ) {
      _closestFruit.disable();
      if (!levels[2]()) {
        Game.score += 8;
      }
      // this.size+=1;
    }
    // CHECK IF EAT BOID
    const _closestBoid = closestBoid(this.position, BoidType.PASSIVE);
    if (
      _closestBoid &&
      p5.Vector.sub(_closestBoid.position, this.position).mag() <
        this.size + _closestBoid.size
    ) {
      _closestBoid.disable();
      if (levels[1]() && !levels[3]()) {
        Game.score += 4;
      }
    }

    const _closestHostileBoid = closestBoid(this.position, BoidType.HOSTILE);

    if (
      _closestHostileBoid &&
      p5.Vector.sub(_closestHostileBoid.position, this.position).mag() <
        this.size + _closestHostileBoid.size
    ) {
      if (levels[3]()) {
        _closestHostileBoid.disable();
        Game.score += 4;
        Game.hostiles -= 1;
      } else {
      }
    }
  }
}
