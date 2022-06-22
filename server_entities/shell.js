const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Events = Matter.Events;

class Shell {
    constructor(initPos, world, clientID, posVec, angle, forceVec, options, eng, server) {
        this.body = Bodies.rectangle(initPos.x, initPos.y, 20, 4, {
            collisionFilter: {
                group: -1
            },
            isStatic: false,
            isSensor: true,
            label: "shell"
        });

        // Properties of shell
        this.clientID = clientID;
        this.shellID = shellID++;
        this.engine = eng;
        this.world = world;
        this.socketServer = server;

        // Options
        this.speed = options.speed;
        this.type = options.type;
        this.blastRadius = options.blastRadius;
        this.penetration = options.penetration;

        // Position
        Body.setPosition(
            this.body,
            { "x": posVec.pdx, "y": posVec.pdy }
        );
        // Angle
        Body.setAngle(this.body, angle);

        // Add shell to the world
        Composite.add(this.world, this.body);

        this.setupEventListeners();

        // Add self to entities list
        entities.push(this);

        // Apply the force vector to send off the shell
        Body.applyForce(
            this.body,
            { "x": this.body.position.x, "y": this.body.position.y },
            { "x": forceVec.fdx * this.speed, "y": forceVec.fdy * this.speed }
        );
    }

    setupEventListeners() {
        let thiss = this;

        // On engine's collisions event...
        Events.on(thiss.engine, "collisionStart", function (event) {
            for (let index = 0; index < event.pairs.length; index++) {
                const pair = event.pairs[index];

                // If this shell and tank collided, remove shell from world
                if (pair.bodyA.label == "shell" && pair.bodyB.label == "tank" && pair.bodyA.id == thiss.body.id) {
                    // Tell clients to destroy shell
                    thiss.socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID,
                            "currentPosition": thiss.body.position,
                            "currentAngle": thiss.body.angle
                        }
                    );

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });
                    entities.splice(indexOfShell, 1);

                    // Remove this shell body from world
                    Composite.remove(thiss.world, pair.bodyA);

                    // Then, unsubscribe from engine's collision signal
                    Events.off(thiss.engine);
                }
                if (pair.bodyB.label == "shell" && pair.bodyA.label == "tank" && pair.bodyB.id == thiss.body.id) {
                    // Tell clients to destroy shell
                    thiss.socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID,
                            "currentPosition": thiss.body.position,
                            "currentAngle": thiss.body.angle
                        }
                    );

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });
                    entities.splice(indexOfShell, 1);

                    // Remove this shell body from world
                    Composite.remove(thiss.world, pair.bodyB);

                    // Then, unsubscribe from engine's collision signal
                    Events.off(thiss.engine);
                }
            }
        });
    }
}

module.exports = { Shell };