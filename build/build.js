var Pico = (function () {
    function Pico(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.size = 5.0;
        this.maxSpeed = 3;
        this.maxForce = 0.05;
        this.speedMult = 1;
    }
    Pico.prototype.update = function () {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.velocity.mult(this.speedMult);
        this.position.add(p5.Vector.div(p5.Vector.mult(this.velocity, 3), Math.min(this.speedMult, this.size / 5)));
        this.acceleration.mult(0);
    };
    Pico.prototype.draw = function () {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(90));
        beginShape();
        vertex(0, -this.size * 2);
        vertex(-this.size, this.size * 2);
        vertex(this.size, this.size * 2);
        endShape(CLOSE);
        pop();
    };
    Pico.prototype.seek = function (target) {
        var d = p5.Vector.sub(target, this.position);
        d.normalize();
        d.mult(this.maxSpeed);
        var steer = p5.Vector.sub(d, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    };
    Pico.prototype.wrapAround = function () {
        if (this.position.x < -this.size)
            this.position.x = width + this.size;
        if (this.position.y < -this.size)
            this.position.y = height + this.size;
        if (this.position.x > width + this.size)
            this.position.x = -this.size;
        if (this.position.y > height + this.size)
            this.position.y = -this.size;
    };
    return Pico;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Boid = (function (_super) {
    __extends(Boid, _super);
    function Boid(x, y) {
        var _this = _super.call(this, x, y) || this;
        Game.boids.push(_this);
        return _this;
    }
    Boid.prototype.separateSteer = function (steerWeight) {
        if (steerWeight === void 0) { steerWeight = 1; }
        var desiredDistance = 25.0;
        var friendsPosition = [];
        var self = this;
        forAllBoids(function (boid) {
            var d = p5.Vector.dist(self.position, boid.position);
            if (d > 0 && d < desiredDistance) {
                var diff = p5.Vector.sub(self.position, boid.position);
                diff.normalize();
                diff.div(d);
                friendsPosition.push(diff);
            }
        });
        var steer = friendsPosition.reduce(function (p, c) { return p5.Vector.add(p, c); }, createVector(0, 0));
        steer.div(friendsPosition.length || 1);
        if (steer.mag() == 0)
            return steer;
        steer.normalize();
        steer.mult(this.maxSpeed);
        steer.sub(this.velocity);
        steer.limit(this.maxForce);
        steer.mult(steerWeight);
        return steer;
    };
    Boid.prototype.cohesionSteer = function (cohesionWeight) {
        if (cohesionWeight === void 0) { cohesionWeight = 1; }
        var friendsRange = 50;
        var friendsPositions = [];
        var self = this;
        forAllBoids(function (boid) {
            var d = p5.Vector.dist(self.position, boid.position);
            return d > 0 && d < friendsRange && friendsPositions.push(boid.position);
        });
        var cohesionSteerSum = friendsPositions.reduce(function (p, c) { return p5.Vector.add(p, c); }, createVector(0, 0));
        cohesionSteerSum.div(friendsPositions.length || 1);
        var cohesionSteer = cohesionSteerSum.mag() != 0
            ? this.seek(cohesionSteerSum)
            : createVector(0, 0);
        cohesionSteer.mult(cohesionWeight);
        return cohesionSteer;
    };
    Boid.prototype.alignSteer = function (alignWeight) {
        if (alignWeight === void 0) { alignWeight = 1; }
        var friendsRange = 50;
        var friendsVelocities = [];
        var self = this;
        forAllBoids(function (boid) {
            var d = p5.Vector.dist(self.position, boid.position);
            return d > 0 && d < friendsRange && friendsVelocities.push(boid.velocity);
        });
        var alignSteer = friendsVelocities.reduce(function (p, c) { return p5.Vector.add(p, c); }, createVector(0, 0));
        if (alignSteer.mag() != 0) {
            alignSteer.div(friendsVelocities.length || 1);
            alignSteer.normalize();
            alignSteer.mult(this.maxSpeed);
            alignSteer.sub(this.velocity);
            alignSteer.limit(this.maxForce);
        }
        alignSteer.mult(alignWeight);
        return alignSteer;
    };
    Boid.prototype.baseSteer = function () {
        var steer = createVector(0, 0);
        var separationForce = this.separateSteer(2);
        var alignForce = this.alignSteer(1);
        var cohesionForce = this.cohesionSteer(1);
        steer.add(separationForce);
        steer.add(alignForce);
        steer.add(cohesionForce);
        drawVector(this.position, separationForce, "red");
        drawVector(this.position, alignForce, "blue");
        drawVector(this.position, cohesionForce, "green");
        return steer;
    };
    return Boid;
}(Pico));
var forAllBoids = function (fn) {
    Game.boids.forEach(function (boid) {
        fn(boid);
    });
};
var createPlayer = function () {
    var player = new Boid(windowWidth / 2, windowHeight / 2);
};
var applyAvoidPlayerSteer = function (boid, weight) {
    if (!Game.player)
        return;
    if (playerInRange(boid, 250)) {
        var pushForce = p5.Vector.mult(boid.seek(Game.player.position), -1 * weight);
        drawVector(boid.position, pushForce, "red");
        boid.acceleration.add(pushForce);
    }
};
var applyFruitSteerToBoid = function (boid) {
    var full = millis() / 1000 - boid.lastAte > 5;
    var fruit = closestFruit(boid.position);
    if (fruit && !full) {
        var attractionForce = p5.Vector.mult(boid.seek(fruit.position), 2);
        drawVector(boid.position, attractionForce, "white");
        boid.acceleration.add(attractionForce);
    }
};
var playerInRange = function (boid, range) {
    if (range === void 0) { range = 200; }
    return p5.Vector.sub(Game.player.position, boid.position).mag() < range;
};
var Fruit = (function () {
    function Fruit(x, y) {
        Game.fruits.push(this);
        this.active = true;
        this.size = 10;
        this.position = createVector(x, y);
    }
    Fruit.prototype.spawn = function () {
        this.active = true;
        this.size = 10;
        this.position = createVector(random(windowWidth), random(windowHeight));
    };
    Fruit.prototype.draw = function () {
        if (!this.active)
            return;
        push();
        translate(this.position.x, this.position.y);
        fill("#00b894");
        circle(0, 0, this.size);
        pop();
    };
    Fruit.prototype.update = function () {
        var _this = this;
        if (!this.active)
            return;
        this.size = Math.min((this.size += 0.5), 30);
        var closeBoids = Game.boids.filter(function (boid) { return p5.Vector.sub(boid.position, _this.position).mag() < _this.size; });
        if (closeBoids.length != 0) {
            this.disable();
        }
    };
    Fruit.prototype.disable = function () {
        Game.fruitsPool.push(this);
        this.active = false;
    };
    return Fruit;
}());
var forAllFruits = function (fn) {
    Game.fruits.filter(function (fruit) { return fruit.active; }).forEach(function (fruit) { return fn(fruit); });
};
var closestFruit = function (position) {
    var closeFruits = Game.fruits.filter(function (fruit) {
        return fruit.active && p5.Vector.sub(position, fruit.position).mag() < 300;
    });
    if (closeFruits.length == 0)
        return;
    var _closestFruit = closeFruits.reduce(function (pFruit, cFruit) {
        return p5.Vector.sub(position, pFruit.position).mag() <
            p5.Vector.sub(position, cFruit.position).mag()
            ? pFruit
            : cFruit;
    }, closeFruits[0]);
    return _closestFruit;
};
var spawnFruitRandomly = function () {
    if (frameCount % 20 == 0) {
        if (Game.fruitsPool.length != 0) {
            var fruit = Game.fruitsPool.pop();
            fruit.spawn();
        }
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Game = (function () {
    function Game() {
    }
    Game.prototype.init = function () {
        Game.player = new Player(windowWidth / 2, windowHeight / 2);
        __spreadArrays(Array(10)).map(function () { return new Boid(windowWidth / 2, windowHeight / 2); });
        __spreadArrays(Array(20)).map(function () { return new Fruit(random(windowWidth), random(windowHeight)); });
    };
    Game.prototype.loop = function () {
        Game.player.applyMouseSteer(2);
        Game.player.update();
        forAllBoids(function (boid) {
            boid.acceleration.add(boid.baseSteer());
            applyFruitSteerToBoid(boid);
            applyAvoidPlayerSteer(boid, 3);
            boid.update();
            boid.wrapAround();
        });
        forAllFruits(function (fruit) {
            fruit.update();
        });
        spawnFruitRandomly();
    };
    Game.prototype.draw = function () {
        Game.player.draw();
        forAllBoids(function (boid) { return boid.draw(); });
        forAllFruits(function (fruit) { return fruit.draw(); });
    };
    Game.boids = [];
    Game.fruits = [];
    Game.fruitsPool = [];
    return Game;
}());
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.maxSpeed = _this.maxSpeed * 1.15;
        return _this;
    }
    Player.prototype.applyMouseSteer = function (weight) {
        if (weight === void 0) { weight = 1; }
        this.acceleration.add(p5.Vector.mult(this.seek(createVector(mouseX, mouseY)), weight));
    };
    Player.prototype.update = function () {
        _super.prototype.update.call(this);
        var _closestFruit = closestFruit(this.position);
        if (_closestFruit && p5.Vector.sub(_closestFruit.position, this.position).mag() < _closestFruit.size) {
            _closestFruit.disable();
            this.size += 1;
        }
    };
    return Player;
}(Pico));
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
var drawVector = function (pos, vector, color) {
    push();
    var sep = p5.Vector.mult(vector, 200);
    stroke(color);
    line(pos.x, pos.y, pos.x + sep.x, pos.y + sep.y);
    pop();
};
//# sourceMappingURL=build.js.map