
class Point {
  x: number;
  y: number;
  constructor(x:number,y:number){this.x=x;this.y=y;}
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
   
   forEachQuad(q=>{
    push();
   translate(q.x+this.position.x, q.y+this.position.y);
   // noStroke();
   fill("#00b894");
   circle(0, 0, this.size);
   pop();
  })
 }

 update() {
   if (!this.active) return;
   this.size = Math.min((this.size += 0.5), 30);
   const closeBoids = Game.boids.filter(
     (boid) => p5.Vector.sub(boid.position, this.position).mag() < this.size
   );
   if (closeBoids.length != 0) {
     // const boid = closeBoids[0];
     // boid.lastAte = millis() / 1000;
     // boid.size = Math.min(boid.size + 1, 10);
     // // console.log(closeBoids[0].lastAte)
     // // console.log("YUM")

     // DIES LOL
     this.disable();

   }
 }
 disable() {
  Game.fruitsPool.push(this);
  this.active = false;
 }
}
