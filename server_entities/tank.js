const Turret = require("./turret.js").Turret;
const StaticObject = require("./static_object.js").StaticObject;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Events = Matter.Events;
const Vector = Matter.Vector;

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
            frictionAir: 0.05,
            restitution: 0,
            density: 5,
            friction: 0.6,
            frictionStatic: 10,
        });

        // Properties of tank
        this.clientID = socket.id;
        this.socketServer = server;
        this.maxSpeed = 5;
        this.currentSpeed = 0;
        this.maxTurnSpeed = 0.01;
        this.currentTurnSpeed = 0;
        this.world = world;
        this.engine = eng;
        this.socket = socket;
        this.parent = parent;
        this.lastBackwardTreadMarkPos = Vector.create(this.body.position.x, this.body.position.y);
        this.lastForwardTreadMarkPos = Vector.create(this.body.position.x, this.body.position.y);
        this.spaceBetweenTreadMarks = 10;

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

        // Listen for key released
        thiss.socket.on("arrow up released", function (data) {
            thiss.currentSpeed = 0;
        });
        thiss.socket.on("arrow down released", function (data) {
            thiss.currentSpeed = 0;
        });
        thiss.socket.on("arrow right released", function (data) {
            thiss.currentTurnSpeed = 0;
        });
        thiss.socket.on("arrow left released", function (data) {
            thiss.currentTurnSpeed = 0;
        });

        // Listen for forward movement
        thiss.socket.on("move forward", function (data) {
            // Slowly increment speed
            if (thiss.currentSpeed < thiss.maxSpeed) {
                thiss.currentSpeed += 0.5;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * thiss.currentSpeed;
            let velocityY = Math.sin(thiss.body.angle) * thiss.currentSpeed;

            // Apply velocity
            Body.setVelocity(thiss.body, {
                x: velocityX, y: velocityY
            });

            // Prepare forward position vector for tread mark
            let pdx = Math.cos(thiss.body.angle) * -60;
            let pdy = Math.sin(thiss.body.angle) * -60;
            pdx = pdx + thiss.body.position.x;
            pdy = pdy + thiss.body.position.y;

            let distance = Vector.sub({ "x": pdx, "y": pdy }, thiss.lastForwardTreadMarkPos);

            if (Vector.magnitude(distance) > thiss.spaceBetweenTreadMarks) {
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
                thiss.lastForwardTreadMarkPos = treadMark.body.position;

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
                thiss.currentSpeed += 0.5;
            }
            // Prepare velocity vector
            let velocityX = Math.cos(thiss.body.angle) * -thiss.currentSpeed;
            let velocityY = Math.sin(thiss.body.angle) * -thiss.currentSpeed;

            // Apply velocity vector
            Body.setVelocity(thiss.body, {
                x: velocityX, y: velocityY
            });

            // Prepare backward position vector for tread mark
            let pdx = Math.cos(thiss.body.angle) * 60;
            let pdy = Math.sin(thiss.body.angle) * 60;
            pdx = pdx + thiss.body.position.x;
            pdy = pdy + thiss.body.position.y;

            let distance = Vector.sub({ "x": pdx, "y": pdy }, thiss.lastBackwardTreadMarkPos);

            if (Vector.magnitude(distance) > thiss.spaceBetweenTreadMarks) {
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
                thiss.lastBackwardTreadMarkPos = treadMark.body.position;

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

        // Listen for right turn
        thiss.socket.on("turn right", function (data) {
            if (thiss.currentTurnSpeed < thiss.maxTurnSpeed) {
                thiss.currentTurnSpeed += 0.00006;
            }
            Body.setAngularVelocity(thiss.body, thiss.currentTurnSpeed);
        });

        // Listen for left turn
        thiss.socket.on("turn left", function (data) {
            if (thiss.currentTurnSpeed < thiss.maxTurnSpeed) {
                thiss.currentTurnSpeed += 0.00006;
            }
            Body.setAngularVelocity(thiss.body, -thiss.currentTurnSpeed);
        });
    }
}

module.exports = { Tank };