class Player extends Pico {
  dead = true;
  constructor(x: number, y: number) {
    super(x, y);
    this.maxSpeed = this.maxSpeed * 1.15;
    this.size = 10;
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
    this.size = getSize();
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
        Game.score += 2;
      }
      // this.size+=1;
    }
    // CHECK IF EAT BOID
    const _closestPassive = closestBoid(this.position, BoidType.PASSIVE);
    levels[1]() &&
      boidInRange(this, _closestPassive, () => {
        _closestPassive.disable();
        if (!levels[3]()) {
          Game.score += 3;
        }
      });

    const _closestHostile = closestBoid(this.position, BoidType.HOSTILE);

    boidInRange(this, _closestHostile, () => {
      if (levels[3]()) {
        // EAT
        _closestHostile.disable();
        if (Game.score != 100) {
          Game.score += 3;
        }
        Game.hostiles -= 1;
      } else {
        Game.player.dead = true;
      }
    });
  }
}

const getSize = () => {
  if (levels[3]()) {
    return 23;
  }
  if (levels[2]()) {
    return 15;
  }
  if (levels[1]()) {
    return 12;
  }
  if (levels[0]()) {
    return 5;
  }
};
