function setup() {
  createCanvas(windowWidth, windowHeight);
  Game.main = new Game();
  Game.main.init();
}

function draw() {
  background(200);
  Game.main.loop();
  Game.main.draw();
}

// DEBUG PURPOSES :)
const drawVector = (pos: p5.Vector, vector: p5.Vector, color: string) => {
  push();
  const sep = p5.Vector.mult(vector, 200);
  stroke(color);
  line(pos.x, pos.y, pos.x + sep.x, pos.y + sep.y);
  pop();
};
