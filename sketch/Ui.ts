class UI {
  draw() {
    this.drawFoodChain(Game.score, _levels - 1);
    strokeWeight(1);
    text(Game.score, 20, 20);
  }

  drawFoodChain(fillAmount: number, classes: number) {
    const _x = 0; //width / classes;
    const Y = 40;
    const _xoff = 0; //_x / 2;

    pop();
    const COLOR = "#4EE094";
    const WHITE = "#FFFFFF";

    const OFF = 30;

    // OUTLINE
    strokeWeight(20);
    fill(WHITE);
    stroke(WHITE);
    line(OFF, Y, width - OFF, Y);
    noStroke();

    for (let i = 0; i < classes; i += 1) {
      circle(((i + 1) / (classes + 1)) * width, Y, 40);
    }

    const BAR = width - OFF * 2;
    // MAIN
    fill(COLOR);
    for (let i = 0; i < classes; i += 1) {
      levels[i + 1]() && circle(((i + 1) / (classes + 1)) * width, Y, 30);
    }

    strokeWeight(10);
    stroke(COLOR);
    line(OFF, Y, (BAR * Game.score) / 100 + OFF, Y);
    push();
  }
}
