class Pico {
 acceleration: p5.Vector; velocity: p5.Vector; position: p5.Vector;
 size: number; maxSpeed: number; maxForce: number; speedMult: number;
 constructor(x: number, y: number) {
   this.acceleration = createVector(0, 0);
   this.velocity = createVector(random(-1, 1), random(-1, 1));
   this.position = createVector(x, y);
   this.size = 5.0;
   this.maxSpeed = 3;
   this.maxForce = 0.05;
   this.speedMult = 1;
 }

 update() {
   this.velocity.add(this.acceleration);
   this.velocity.limit(this.maxSpeed);
   this.velocity.mult(this.speedMult);
   this.position.add(
     p5.Vector.div(p5.Vector.mult(this.velocity, 3), Math.min(this.speedMult,this.size/5) )
   );
   this.acceleration.mult(0);
 }

 draw() {
   push();
   translate(this.position.x, this.position.y);
   rotate(this.velocity.heading() + radians(90));
   beginShape();
   vertex(0, -this.size * 2);
   vertex(-this.size, this.size * 2);
   vertex(this.size, this.size * 2);
   endShape(CLOSE);
   pop();
 }

 seek(target: p5.Vector) {
   const d = p5.Vector.sub(target, this.position);
   d.normalize();
   d.mult(this.maxSpeed);
   const steer = p5.Vector.sub(d, this.velocity);
   steer.limit(this.maxForce);
   return steer;
 }

 wrapAround() {
   if (this.position.x < -this.size) this.position.x = width + this.size;
   if (this.position.y < -this.size) this.position.y = height + this.size;
   if (this.position.x > width + this.size) this.position.x = -this.size;
   if (this.position.y > height + this.size) this.position.y = -this.size;
 }
}
