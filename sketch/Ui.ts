class UI {
 draw(){
  this.drawFoodChain(4,6)
 }
 
 drawFoodChain(fillAmount: number, classes:number){
  const _x = width/classes;
  const Y = 40;
  const _xoff = width/6/2

  pop();
  const COLOR = "#4EE094"
  const WHITE = "#FFFFFF"

  // OUTLINE
  strokeWeight(20);
  fill(WHITE);
  stroke(WHITE);
  line(_xoff,Y,width-_xoff,Y)
  noStroke();

  for(let i=0;i<classes;i+=1){ 
   circle(_x*i+_xoff,Y,40)
  }

  // MAIN
  fill(COLOR)
  for(let i=0;i<classes;i+=1){
   
   circle(_x*i+_xoff,Y,30)
  }
  strokeWeight(10)
  line(_xoff,Y,width-_xoff,Y)

  strokeWeight(10);
  stroke(COLOR)
  line(_xoff,Y,width-_xoff,Y)
  push();

 }
}