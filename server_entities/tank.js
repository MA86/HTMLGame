const Turret = require("./turret.js").Turret;
const StaticObject = require("./static_object.js").StaticObject;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Events = Matter.Events;

class Tank {
    constructor(initPos, world, socket, server, parent, eng) {
        // Create turret
        this.turret = new Turret({ "x": initPos.x, "y": initPos.y }, world, socket, server, this, eng);

        // Create a compound body representing tank
        this.body = Body.create({
            parts: [
                Bodies.rectangle(initPos.x, initPos.y, 225, 100, { label: "tank" }),
                this.turret.body
            ],
            collisionFilter: {
                group: 1
            },
            isStatic: false,
            frictionAir: 0.9,
            restitution: 0,
            density: 10,
            friction: 0.6,
            frictionStatic: 10,
        });

        // Properties of tank
        this.clientID = socket.id;
        this.socketServer = server;
        this.maxSpeed = 15;
        this.currentSpeed = 0;
        this.turningSpeed = 16;
        this.world = world;
        this.engine = eng;
        this.socket = socket;
        this.parent = parent;
        this.placeTreadMark = true;
        this.lastTreadMarkPos = 0;

        // Redefine turret's center from middle to left
        Body.setCentre(this.turret.body, { x: -48, y: -4 }, true);
        // Position turret on tank (based on new center)
        Body.setPosition(this.turret.body, this.body.position);

        // Add tank body to the world
        Composite.add(world, this.body);

        this.setupEventListeners();
    }

    setupEventListeners() {
        let thiss = this;

        // Listen for key released/pressed
        thiss.socket.on("arrow up released", function (data) {
            thiss.currentSpeed = 0;
        });
        thiss.socket.on("arrow down released", function () {
            thiss.currentSpeed = 0;
        });

        // Listen for forward movement
        thiss.socket.on("move forward", function (data) {
            // Slowly increment speed
            if (thiss.currentSpeed < thiss.maxSpeed) {
                thiss.currentSpeed += 0.1;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * thiss.currentSpeed;
            let velocityY = Math.sin(thiss.body.angle) * thiss.currentSpeed;

            // Apply velocity
            Body.setVelocity(thiss.body, {
                x: velocityX, y: velocityY
            });

            // Prepare position vector for tread mark
            let pdx = Math.cos(thiss.body.angle) * -100;
            let pdy = Math.sin(thiss.body.angle) * -100;
            pdx = pdx + thiss.body.position.x;
            pdy = pdy + thiss.body.position.y;

            if (thiss.placeTreadMark) {
                // Create tread mark
                let treadMark = new StaticObject(
                    { "x": pdx, "y": pdy },
                    thiss.body.angle,
                    thiss.world,
                    thiss.engine,
                    thiss.socketServer,
                    thiss.clientID,
                    5000
                );
                thiss.lastTreadMarkPos = treadMark.body.position;
                // Reset flag
                thiss.placeTreadMark = false;
                // Set timeout for next tread marks
                thiss.setTreadMarkTimeOut(100);

                // Tell all clients to create this tread mark's representation
                thiss.socketServer.emit(
                    "create tread mark",
                    {
                        "clientID": treadMark.clientID,
                        "staticObjectID": treadMark.staticObjectID,
                        "position": treadMark.body.position,
                        "angle": treadMark.body.angle
                    }
                );
            }
        });

        // Listen for backward movement
        thiss.socket.on("move backward", function (data) {
            // Slowly increment speed
            if (thiss.currentSpeed < thiss.maxSpeed) {
                thiss.currentSpeed += 0.1;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * -thiss.currentSpeed;
            let velocityY = Math.sin(thiss.body.angle) * -thiss.currentSpeed;

            // Apply velocity vector
            Body.setVelocity(thiss.body, {
                x: velocityX, y: velocityY
            });

            // Prepare position vector for tread mark
            let pdx = Math.cos(thiss.body.angle) * 100;
            let pdy = Math.sin(thiss.body.angle) * 100;
            pdx = pdx + thiss.body.position.x;
            pdy = pdy + thiss.body.position.y;

            if (thiss.placeTreadMark) {
                // Create tread mark
                let treadTrack = new StaticObject(
                    { "x": pdx, "y": pdy },
                    thiss.body.angle,
                    thiss.world,
                    thiss.engine,
                    thiss.socketServer,
                    thiss.clientID,
                    5000
                );
                thiss.lastTreadMarkPos = treadMark.body.position;
                // Reset flag
                thiss.placeTreadMark = false;
                // Set timeout for next tread marks
                thiss.setTreadMarkTimeOut(100);

                // Tell all clients to create this tread mark's representation
                thiss.socketServer.emit(
                    "create tread mark",
                    {
                        "clientID": treadTrack.clientID,
                        "staticObjectID": treadTrack.staticObjectID,
                        "position": treadTrack.body.position,
                        "angle": treadTrack.body.angle
                    }
                );
            }
        });

        // Listen for right turn
        thiss.socket.on("turn right", function (data) {
            thiss.body.torque = thiss.turningSpeed;
        });

        // Listen for left turn
        thiss.socket.on("turn left", function (data) {
            thiss.body.torque = -thiss.turningSpeed;
        });
    }

    setTreadMarkTimeOut(time) {
        let thiss = this;
        setTimeout(function () {
            // Keep time between tread marks consistent
            time += 1 / thiss.currentSpeed;
            thiss.placeTreadMark = true;
        }, time);
    }
}

module.exports = { Tank };