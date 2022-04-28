class UI {
  draw() {
    if (Game.player.dead) {
      this.drawMenu();
    } else {
      this.drawInfo();
      this.drawFoodChain(Game.score, _levels - 1);
      Game.score == 100 && this.drawVictory();
    }
  }
  // INFO
  drawInfo() {
    strokeWeight(2);
    stroke("white");
    fill("white");
    textSize(40);
    textAlign(CENTER);
    text("OBJECTIVE: SURVIVE AND THRIVE", windowWidth / 2, 100);
  }

  // DRAW VICTORY
  drawVictory() {
    strokeWeight(2);
    stroke("white");
    fill("white");
    textAlign(CENTER);
    textStyle(BOLD);
    strokeWeight(5);
    textSize(100);
    text("YOU WON!", windowWidth / 2, windowHeight / 2);

    textStyle(NORMAL);
    noStroke();
    textSize(40);
    text("YOU ARE THE APEX PREDATOR", windowWidth / 2, windowHeight / 2 + 70);
  }

  // DRAW MENU
  drawMenu() {
    stroke("white");
    fill("white");
    textAlign(CENTER);
    textStyle(BOLD);
    strokeWeight(5);
    textSize(100);
    text("PICO SYSTEM", windowWidth / 2, windowHeight / 2);
    if (Math.floor(frameCount / 50) % 2 != 0) {
      textStyle(NORMAL);
      noStroke();
      textSize(40);
      text("CLICK ANYWHERE TO START", windowWidth / 2, windowHeight / 2 + 70);
    }
  }

  // TOP UI
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
