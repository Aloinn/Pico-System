class Game {
 static main: Game;
 static debug = false;
 static UI: UI;
 static boids: Boid[] = [];
 static fruits: Fruit[] = [];
 static fruitsPool: Fruit[] = [];
 static player: Player;
 init() {
   // PLAYER BOID
   Game.player = new Player(windowWidth/2, windowHeight/2);
   Game.UI = new UI();

   // NPC BOID
   [...Array(10)].map(
     () => new Boid(windowWidth / 2, windowHeight / 2)
   );
   [...Array(20)].map(
     () => new Fruit(random(windowWidth), random(windowHeight))
   );
 }

 loop() {
   Game.player.applyMouseSteer(2);
   Game.player.update();
   Game.player.wrapAround();

   // APPLY TO BOIDS
   forAllBoids((boid) => {
     // BASE BOID STEERS
     boid.acceleration.add(boid.baseSteer());
     applyFruitSteerToBoid(boid);
     applyAvoidPlayerSteer(boid, 3);

     // UPDATE ALL BOIDS
     boid.update();
     boid.wrapAround();
   });

   // APPLY TO FRUITS
   forAllFruits((fruit) => {
     fruit.update();
   });

   // RANDOM SPAWN
   spawnFruitRandomly();
 }

 draw() {
   // APPLY TO BOIDS
   console.log(mouseX, mouseY)
  //  pop()
  //  noFill();
  //  translate(width/2-Game.player.position.x, height/2-Game.player.position.y)
  //  rect(0,0,width,height);
  //  push();
   pop();   
   noFill();
   translate(width/2-Game.player.position.x, height/2-Game.player.position.y)
   rect(0,0,width,height);
  //  const T = width
   
   forAllBoids((boid) => boid.draw());
   forAllFruits((fruit) => fruit.draw());
   Game.player.draw();
   Game.UI.draw();

   push();
 }
}
