class Player extends Pico {
 constructor(x: number, y: number) {
   super(x, y);
   this.maxSpeed=this.maxSpeed*1.15;
   this.color="#CEFFC8"
 }

 applyMouseSteer(weight = 1) {
   this.acceleration.add(
     p5.Vector.mult(this.seek(p5.Vector.add(createVector(mouseX-width/2, mouseY-height/2),Game.player.position)), weight)
   );
 }

 update() {
   super.update()

   // CHECK IF EAT FRUIT
   const _closestFruit = closestFruit(this.position); // TODO FIX WHEN NO FRUITS LEFT
   if(_closestFruit && p5.Vector.sub(_closestFruit.position, this.position).mag()<_closestFruit.size){
    _closestFruit.disable()
    this.size+=1;
   }

}
}
