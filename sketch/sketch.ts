let _wrapAroundMap = [
  new Point(-1, -1),
  new Point(0, -1),
  new Point(1, -1),
  new Point(-1, 0),
  new Point(0, 0),
  new Point(1, 0),
  new Point(-1, 1),
  new Point(0, 1),
  new Point(1, 1),
];
let wrapAroundMap: Point[];

const forEachQuad = (fn: (quad: Point) => void) => {
  wrapAroundMap.forEach((q) => fn(q));
};
function setup() {
  createCanvas(windowWidth, windowHeight);
  // WRAP AROUND
  let dim = new Point(width, height);
  wrapAroundMap = _wrapAroundMap.map((v) =>
    createVector(dim.x * v.x, dim.y * v.y)
  );

  Game.main = new Game();
  Game.main.init();
}

function draw() {
  background(200);
  noFill();

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
