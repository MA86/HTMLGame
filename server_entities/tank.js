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
            frictionAir: 0.5,
            restitution: 0.01,
            density: 1,
            friction: 1,
            //frictionStatic: 10,
        });

        // Properties of tank
        this.clientID = socket.id;
        this.socketServer = server;
        this.speed = 0.2;
        this.rotationSpeed = 25;
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
            // Create a force vector and apply this force
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;
            Body.applyForce(
                thiss.body,
                { "x": thiss.body.position.x, "y": thiss.body.position.y },
                { "x": dx, "y": dy }
            );

            if (thiss.placeTreadMark) {
                // TODO: 
                // Prepare position vector for tread mark
                let pdx = Math.cos(thiss.body.angle) * 140;
                let pdy = Math.sin(thiss.body.angle) * 140;
                pdx = pdx + thiss.body.position.x;
                pdy = pdy + thiss.body.position.y;

                // Create tread mark
                let treadTrack = new StaticObject(
                    { "pdx": pdx, "pdy": pdy },
                    thiss.body.angle,
                    thiss.world,
                    thiss.engine,
                    thiss.socketServer,
                    thiss.clientID,
                    5000
                );

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
                // Reset flag
                thiss.placeTreadMark = false;
                // Set timeout between tread marks
                thiss.setTreadMarkTimeOut(1000);
            }
        });

        // Trigger backward movement
        thiss.socket.on("move backward", function (data) {
            // Create a force vector and apply this force
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;
            Body.applyForce(
                thiss.body,
                { "x": thiss.body.position.x, "y": thiss.body.position.y },
                { "x": -dx, "y": -dy }
            );

            // TODO: Create position vector and tracks
            // Prepare position vector
            let pdx = Math.cos(thiss.body.angle) * 140;
            let pdy = Math.sin(thiss.body.angle) * 140;
            pdx = pdx + thiss.body.position.x;
            pdy = pdy + thiss.body.position.y;
            let treadTrack = new StaticObject(
                { "pdx": pdx, "pdy": pdy },
                thiss.body.angle,
                thiss.world,
                thiss.engine,
                thiss.socketServer,
                thiss.clientID,
                10000
            );

            // TODO: Tell all clients to create this tread mark's representation
            thiss.socketServer.emit(
                "create tread mark",
                {
                    "clientID": treadTrack.clientID,
                    "staticObjectID": treadTrack.staticObjectID,
                    "position": treadTrack.body.position,
                    "angle": treadTrack.body.angle
                }
            );
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