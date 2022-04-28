var Pico = (function () {
    function Pico(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.size = 5.0;
        this.maxSpeed = 3;
        this.maxForce = 0.05;
        this.speedMult = 1;
        this.color = "#ffffff";
    }
    Pico.prototype.update = function () {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.velocity.mult(this.speedMult);
        this.position.add(p5.Vector.div(p5.Vector.mult(this.velocity, 1), Math.min(this.speedMult, this.size)));
        this.acceleration.mult(0);
    };
    Pico.prototype.draw = function () {
        var _this = this;
        forEachQuad(function (q) {
            push();
            fill(_this.color);
            translate(q.x + _this.position.x, q.y + _this.position.y);
            rotate(_this.velocity.heading() + radians(270));
            translate(0, -_this.size * 1);
            if (Math.floor(frameCount / 15) % 2 != 0) {
                beginShape();
                vertex(-_this.size * 1, -_this.size * 3);
                vertex(_this.size * 1, -_this.size * 3);
                vertex(0, -_this.size * 2);
                endShape(CLOSE);
                beginShape();
                vertex(0, -_this.size * 2);
                vertex(-_this.size * 1.5, _this.size * 2);
                vertex(0, _this.size * 1.2);
                vertex(_this.size * 1.5, _this.size * 2);
                endShape(CLOSE);
            }
            else {
                beginShape();
                vertex(-_this.size * 1, -_this.size * 3);
                vertex(_this.size * 1, -_this.size * 3);
                vertex(0, -_this.size * 2);
                endShape(CLOSE);
                beginShape();
                vertex(0, -_this.size * 2);
                vertex(-_this.size * 1.5, _this.size * 2);
                vertex(0, _this.size * 2.7);
                vertex(_this.size * 1.5, _this.size * 2);
                endShape(CLOSE);
            }
            pop();
        });
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
        if (this.position.x < 0)
            this.position.x = width;
        if (this.position.y < 0)
            this.position.y = height;
        if (this.position.x > width)
            this.position.x = 0;
        if (this.position.y > height)
            this.position.y = 0;
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
var BoidType;
(function (BoidType) {
    BoidType[BoidType["PASSIVE"] = 0] = "PASSIVE";
    BoidType[BoidType["HOSTILE"] = 1] = "HOSTILE";
})(BoidType || (BoidType = {}));
var Boid = (function (_super) {
    __extends(Boid, _super);
    function Boid(x, y, type) {
        var _this = _super.call(this, x, y) || this;
        Game.boids.push(_this);
        _this.spawn(type);
        return _this;
    }
    Boid.prototype.spawn = function (type) {
        this.active = true;
        this.convert(type);
        while (true) {
            var pos = createVector(random(windowWidth), random(windowHeight));
            if (pos.dist(Game.player.position) > 200) {
                this.position = createVector();
                break;
            }
        }
    };
    Boid.prototype.convert = function (type) {
        this.type = type;
        this.color = type == BoidType.HOSTILE ? COLORS.RED : COLORS.WHITE;
        this.size = type == BoidType.HOSTILE ? 20 : 8;
        this.speedMult = type == BoidType.HOSTILE ? 0.9 : 1;
    };
    Boid.prototype.draw = function () {
        if (this.type == BoidType.PASSIVE) {
            if (levels[1]() && !levels[3]()) {
                setEdibleBorder();
            }
            else {
                noStroke();
            }
        }
        if (this.type == BoidType.HOSTILE) {
            if (levels[3]()) {
                setEdibleBorder();
            }
            else {
                noStroke();
            }
        }
        _super.prototype.draw.call(this);
    };
    Boid.prototype.separateSteer = function (steerWeight) {
        var _this = this;
        if (steerWeight === void 0) { steerWeight = 1; }
        var desiredDistance = this.size * 5;
        var friendsPosition = [];
        var self = this;
        forAllBoids(function (boid) {
            if (boid.type != _this.type)
                return;
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
        var _this = this;
        if (cohesionWeight === void 0) { cohesionWeight = 1; }
        var friendsRange = 50;
        var friendsPositions = [];
        var self = this;
        forAllBoids(function (boid) {
            if (boid.type != _this.type)
                return;
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
        var _this = this;
        if (alignWeight === void 0) { alignWeight = 1; }
        var friendsRange = 50;
        var friendsVelocities = [];
        var self = this;
        forAllBoids(function (boid) {
            if (boid.type != _this.type)
                return;
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
    Boid.prototype.baseSteer = function (weights) {
        if (weights === void 0) { weights = [2, 1, 1]; }
        var steer = createVector(0, 0);
        var separationForce = this.separateSteer(weights[0]);
        var alignForce = this.alignSteer(weights[1]);
        var cohesionForce = this.cohesionSteer(weights[2]);
        steer.add(separationForce);
        steer.add(alignForce);
        steer.add(cohesionForce);
        Game.debug && drawVector(this.position, separationForce, "red");
        Game.debug && drawVector(this.position, alignForce, "blue");
        Game.debug && drawVector(this.position, cohesionForce, "green");
        return steer;
    };
    Boid.prototype.disable = function () {
        Game.boidsPool.push(this);
        this.active = false;
    };
    return Boid;
}(Pico));
var forAllBoids = function (fn) {
    Game.boids
        .filter(function (boid) { return boid.active; })
        .forEach(function (boid) {
        fn(boid);
    });
};
var applyAvoidPlayerSteer = function (boid, weight, maxDistance) {
    if (!Game.player)
        return;
    if (playerInRange(boid, maxDistance || 400)) {
        var pushForce = p5.Vector.mult(boid.seek(Game.player.position), -1 * weight);
        Game.debug && drawVector(boid.position, pushForce, "red");
        boid.acceleration.add(pushForce);
    }
};
var applyTowardPlayerSteer = function (boid, weight, maxDistance) {
    if (!Game.player)
        return;
    if (playerInRange(boid, maxDistance || 400)) {
        var pushForce = p5.Vector.mult(boid.seek(Game.player.position), 1 * weight);
        Game.debug && drawVector(boid.position, pushForce, "red");
        boid.acceleration.add(pushForce);
    }
};
var applyTowardBoidSteer = function (boid, weight) {
    var _closestBoid = closestBoid(boid.position, BoidType.PASSIVE);
    if (_closestBoid) {
        var pullForce = p5.Vector.mult(boid.seek(_closestBoid.position), 1 * weight);
        Game.debug && drawVector(boid.position, pullForce, "blue");
        boid.acceleration.add(pullForce);
    }
};
var applyFruitSteerToBoid = function (boid, weight) {
    if (weight === void 0) { weight = 2; }
    var full = millis() / 1000 - boid.lastAte > 5;
    var fruit = closestFruit(boid.position);
    if (fruit && !full) {
        var attractionForce = p5.Vector.mult(boid.seek(fruit.position), weight);
        Game.debug && drawVector(boid.position, attractionForce, "white");
        boid.acceleration.add(attractionForce);
    }
};
var playerInRange = function (boid, range) {
    if (range === void 0) { range = 200; }
    return range == -1
        ? true
        : p5.Vector.sub(Game.player.position, boid.position).mag() < range;
};
var closestBoid = function (position, type) {
    var closeBoids = Game.boids.filter(function (boid) {
        return boid.type == type &&
            boid.active &&
            p5.Vector.sub(position, boid.position).mag() < 300;
    });
    if (closeBoids.length == 0)
        return;
    return closeBoids.reduce(function (pBoid, cBoid) {
        return p5.Vector.sub(position, pBoid.position).mag() <
            p5.Vector.sub(position, cBoid.position).mag()
            ? pBoid
            : cBoid;
    }, closeBoids[0]);
};
var spawnBoidRandomly = function () {
    if (frameCount % 30 == 0) {
        if (Game.boidsPool.length != 0) {
            var boid = Game.boidsPool.pop();
            if (Game.hostiles < 5 && levels[1]()) {
                boid.spawn(BoidType.HOSTILE);
                Game.hostiles += 1;
            }
            else {
                boid.spawn(BoidType.PASSIVE);
            }
        }
    }
};
var boidInRange = function (boid, prey, after) {
    if (prey &&
        p5.Vector.sub(prey.position, boid.position).mag() <
            (boid.size * 5) / 2 + (prey.size * 5) / 2) {
        after === null || after === void 0 ? void 0 : after();
    }
};
var COLORS = Object.freeze({
    GREEN: "#31ff81",
    AQUA: "#00897b",
    RED: "#fb8c00",
    WHITE: "#ffffff",
    DARK: "#37474f",
});
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
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
        var _this = this;
        if (!this.active)
            return;
        forEachQuad(function (q) {
            push();
            translate(q.x + _this.position.x, q.y + _this.position.y);
            if (!levels[2]()) {
                setEdibleBorder();
            }
            else {
                noStroke();
            }
            fill(COLORS.AQUA);
            circle(0, 0, _this.size);
            pop();
        });
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
        Game.player = new Player(windowWidth / 2 - 100, windowHeight / 2);
        Game.score = 0;
        Game.hostiles = 0;
        Game.UI = new UI();
        __spreadArrays(Array(15)).forEach(function (_, i) { return new Boid(windowWidth / 2, windowHeight / 2, BoidType.PASSIVE); });
        __spreadArrays(Array(20)).forEach(function () { return new Fruit(random(windowWidth), random(windowHeight)); });
    };
    Game.prototype.gameRestart = function () {
        Game.score = 0;
        Game.hostiles = 0;
    };
    Game.prototype.loop = function () {
        if (!Game.player.dead) {
            Game.player.applyMouseSteer(2);
            Game.player.update();
            Game.player.wrapAround();
        }
        else {
            Game.score = Math.max(Game.score - 1, 0);
            Game.player.position.add(createVector(1, 1));
            Game.player.wrapAround();
            if (mouseIsPressed === true) {
                Game.player.dead = false;
                forAllBoids(function (boid) { return boid.convert(BoidType.PASSIVE); });
                Game.score = 0;
                Game.hostiles = 0;
            }
        }
        forAllBoids(function (boid) {
            if (boid.type == BoidType.PASSIVE) {
                boid.acceleration.add(boid.baseSteer());
                applyFruitSteerToBoid(boid);
                applyAvoidPlayerSteer(boid, 3);
            }
            if (boid.type == BoidType.HOSTILE) {
                boid.acceleration.add(levels[3]() ? boid.baseSteer() : boid.baseSteer([7, 2, 2]));
                applyFruitSteerToBoid(boid, 2);
                if (!Game.player.dead) {
                    if (!levels[3]()) {
                        applyTowardPlayerSteer(boid, 3, -1);
                        applyTowardPlayerSteer(boid, 5);
                    }
                    else {
                        applyAvoidPlayerSteer(boid, 3, 500);
                    }
                }
                applyTowardBoidSteer(boid, 4);
                var _closestPrey_1 = closestBoid(boid.position, BoidType.PASSIVE);
                boidInRange(boid, _closestPrey_1, function () {
                    _closestPrey_1.disable();
                });
            }
            boid.update();
            boid.wrapAround();
        });
        forAllFruits(function (fruit) {
            fruit.update();
        });
        spawnFruitRandomly();
        spawnBoidRandomly();
    };
    Game.prototype.draw = function () {
        push();
        noFill();
        var S = 1.9 - Game.score / 100;
        var TX = width / S / 2 - Game.player.position.x;
        var TY = height / S / 2 - Game.player.position.y;
        scale(S);
        translate(TX, TY);
        forAllBoids(function (boid) { return boid.draw(); });
        forAllFruits(function (fruit) { return fruit.draw(); });
        if (!Game.player.dead) {
            Game.player.draw();
        }
        pop();
        push();
        Game.score = min(Game.score, 100);
        Game.UI.draw();
        pop();
    };
    Game.debug = false;
    Game.boids = [];
    Game.boidsPool = [];
    Game.fruits = [];
    Game.fruitsPool = [];
    Game.score = 0;
    return Game;
}());
var _levels = 4;
var levels = __spreadArrays(Array(_levels)).map(function (x, i) { return function () { return Game.score >= (i * 100) / _levels; }; });
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.dead = true;
        _this.maxSpeed = _this.maxSpeed * 1.15;
        _this.size = 10;
        _this.color = "#CEFFC8";
        return _this;
    }
    Player.prototype.applyMouseSteer = function (weight) {
        if (weight === void 0) { weight = 1; }
        this.acceleration.add(p5.Vector.mult(this.seek(p5.Vector.add(createVector(mouseX - width / 2, mouseY - height / 2), Game.player.position)), weight));
    };
    Player.prototype.draw = function () {
        noStroke();
        _super.prototype.draw.call(this);
    };
    Player.prototype.update = function () {
        this.size = getSize();
        _super.prototype.update.call(this);
        levels.map(function (fn) { return (fn() ? 1 : 0); }).reduce(function (pi, ci) { return pi + ci; }, 0);
        var _closestFruit = closestFruit(this.position);
        if (_closestFruit &&
            p5.Vector.sub(_closestFruit.position, this.position).mag() <
                _closestFruit.size) {
            _closestFruit.disable();
            if (!levels[2]()) {
                Game.score += 2;
            }
        }
        var _closestPassive = closestBoid(this.position, BoidType.PASSIVE);
        levels[1]() &&
            boidInRange(this, _closestPassive, function () {
                _closestPassive.disable();
                if (!levels[3]()) {
                    Game.score += 3;
                }
            });
        var _closestHostile = closestBoid(this.position, BoidType.HOSTILE);
        boidInRange(this, _closestHostile, function () {
            if (levels[3]()) {
                _closestHostile.disable();
                if (Game.score != 100) {
                    Game.score += 3;
                }
                Game.hostiles -= 1;
            }
            else {
                Game.player.dead = true;
            }
        });
    };
    return Player;
}(Pico));
var getSize = function () {
    if (levels[3]()) {
        return 23;
    }
    if (levels[2]()) {
        return 15;
    }
    if (levels[1]()) {
        return 12;
    }
    if (levels[0]()) {
        return 5;
    }
};
var UI = (function () {
    function UI() {
    }
    UI.prototype.draw = function () {
        if (Game.player.dead) {
            this.drawMenu();
        }
        else {
            this.drawInfo();
            this.drawFoodChain(Game.score, _levels - 1);
            Game.score == 100 && this.drawVictory();
        }
    };
    UI.prototype.drawInfo = function () {
        fill("white");
        noStroke();
        textSize(30);
        textAlign(CENTER);
        textStyle(BOLD);
        text(" SURVIVE AND THRIVE", windowWidth / 2, 100);
    };
    UI.prototype.drawVictory = function () {
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
    };
    UI.prototype.drawMenu = function () {
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
    };
    UI.prototype.drawFoodChain = function (fillAmount, classes) {
        var _x = 0;
        var Y = 40;
        var _xoff = 0;
        pop();
        var COLOR = "#4EE094";
        var WHITE = "#FFFFFF";
        var OFF = 30;
        strokeWeight(20);
        fill(WHITE);
        stroke(WHITE);
        line(OFF, Y, width - OFF, Y);
        noStroke();
        for (var i = 0; i < classes; i += 1) {
            circle(((i + 1) / (classes + 1)) * width, Y, 40);
        }
        var BAR = width - OFF * 2;
        fill(COLOR);
        for (var i = 0; i < classes; i += 1) {
            levels[i + 1]() && circle(((i + 1) / (classes + 1)) * width, Y, 30);
        }
        strokeWeight(10);
        stroke(COLOR);
        line(OFF, Y, (BAR * Game.score) / 100 + OFF, Y);
        push();
    };
    return UI;
}());
var setEdibleBorder = function () {
    strokeWeight(1);
    stroke(COLORS.GREEN);
};
var _wrapAroundMap = [
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
var wrapAroundMap;
var forEachQuad = function (fn) {
    wrapAroundMap.forEach(function (q) { return fn(q); });
};
function setup() {
    createCanvas(windowWidth, windowHeight);
    var dim = new Point(width, height);
    wrapAroundMap = _wrapAroundMap.map(function (v) {
        return createVector(dim.x * v.x, dim.y * v.y);
    });
    Game.main = new Game();
    Game.main.init();
}
function draw() {
    background(COLORS.DARK);
    noFill();
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