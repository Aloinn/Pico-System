const forAllFruits = (fn: (f: Fruit)=>void) => {
  Game.fruits.filter((fruit) => fruit.active).forEach((fruit) => fn(fruit));
};

// GET CLOSEST FRUIT
const closestFruit = (position: p5.Vector) => {
  const closeFruits = Game.fruits.filter(
    (fruit) =>
      fruit.active && p5.Vector.sub(position, fruit.position).mag() < 300
  );
  if (closeFruits.length == 0) return;
  const _closestFruit = closeFruits.reduce(
    (pFruit, cFruit) =>
      p5.Vector.sub(position, pFruit.position).mag() <
      p5.Vector.sub(position, cFruit.position).mag()
        ? pFruit
        : cFruit,
    closeFruits[0]
  );
  return _closestFruit;
};

// SPAWN FRUIT
const spawnFruitRandomly = () => {
  if (frameCount % 20 == 0) {
    if (Game.fruitsPool.length != 0) {
      const fruit = Game.fruitsPool.pop();
      fruit.spawn();
    }
  }
};
