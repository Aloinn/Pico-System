class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Fruit {
  active: boolean;
  size: number;
  position: p5.Vector;
  spawn() {
    this.active = true;
    this.size = 10;
    this.position = createVector(random(windowWidth), random(windowHeight));
  }

  constructor(x: number, y: number) {
    Game.fruits.push(this);
    this.active = true;
    this.size = 10;
    this.position = createVector(x, y);
  }

  draw() {
    if (!this.active) return;

    forEachQuad((q) => {
      push();
      translate(q.x + this.position.x, q.y + this.position.y);
      if (!levels[2]()) {
        setEdibleBorder();
      } else {
        noStroke();
      }
      fill(COLORS.AQUA);
      circle(0, 0, this.size);
      pop();
    });
  }

  update() {
    if (!this.active) return;
    this.size = Math.min((this.size += 0.5), 30);
    const closeBoids = Game.boids.filter(
      (boid) => p5.Vector.sub(boid.position, this.position).mag() < this.size
    );
    if (closeBoids.length != 0) {
      this.disable();
    }
  }
  disable() {
    Game.fruitsPool.push(this);
    this.active = false;
  }
}
