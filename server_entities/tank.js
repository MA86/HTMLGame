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
        this.currentBackwardSpeed = 0;
        this.currentForwardSpeed = 0;
        this.rotationSpeed = 10;
        this.world = world;
        this.engine = eng;
        this.socket = socket;
        this.parent = parent;
        this.placeTreadMark = true;

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

        // Trigger forward movement
        thiss.socket.on("move forward", function (data) {
            // Since moving forward, backward speed is zero
            thiss.currentBackwardSpeed = 0;

            // Slowly increment speed
            if (thiss.currentForwardSpeed < thiss.maxSpeed) {
                thiss.currentForwardSpeed += 0.1;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * thiss.currentForwardSpeed;
            let velocityY = Math.sin(thiss.body.angle) * thiss.currentForwardSpeed;

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
                let treadTrack = new StaticObject(
                    { "x": pdx, "y": pdy },
                    thiss.body.angle,
                    thiss.world,
                    thiss.engine,
                    thiss.socketServer,
                    thiss.clientID,
                    5000
                );
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
            ///
            console.log("UP");
        });

        // Trigger backward movement
        thiss.socket.on("move backward", function (data) {
            // Since moving backward, forward speed is zero
            thiss.currentForwardSpeed = 0;

            // Slowly increment speed
            if (thiss.currentBackwardSpeed < thiss.maxSpeed) {
                thiss.currentBackwardSpeed += 0.1;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * -thiss.currentBackwardSpeed;
            let velocityY = Math.sin(thiss.body.angle) * -thiss.currentBackwardSpeed;

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
            console.log("DOWN")///
        });

        // Trigger right turn
        thiss.socket.on("turn right", function (data) {
            thiss.body.torque = thiss.rotationSpeed;
        });

        // Trigger left turn
        thiss.socket.on("turn left", function (data) {
            thiss.body.torque = -thiss.rotationSpeed;
        });
    }

    setTreadMarkTimeOut(time) {
        let thiss = this;
        setTimeout(function () {
            thiss.placeTreadMark = true;
        }, time);
    }
}

module.exports = { Tank };