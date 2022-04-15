const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Collision = Matter.Collision;
const Events = Matter.Events;

class Shell {
    constructor(initPos, world, socket, posVec, angle, forceVec, options, shellID, eng, server) {
        this.body = Bodies.rectangle(initPos.x, initPos.y, 20, 4, {
            collisionFilter: {
                group: -1
            },
            isStatic: false,
            isSensor: true,///
            label: "shell"
        });

        // Properties of shell
        this.clientID = socket.id;
        this.shellID = shellID;
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

        // Apply the force vector to send off the shell
        Body.applyForce(
            this.body,
            { "x": this.body.position.x, "y": this.body.position.y },
            { "x": forceVec.fdx * this.speed, "y": forceVec.fdy * this.speed }
        );

        this.setupEventListeners();
    }

    setupEventListeners() {
        let thiss = this;

        // On engine's collisions report...
        Events.on(thiss.engine, "collisionStart", function (event) {
            for (let index = 0; index < event.pairs.length; index++) {
                const pair = event.pairs[index];

                // If this shell and tank collided, remove shell from world
                if (pair.bodyA.label == "shell" && pair.bodyB.label == "tank" && pair.bodyA.id == thiss.body.id) {
                    Composite.remove(thiss.world, pair.bodyA);

                    // Unsubscribe from engine's collision report
                    Events.off(thiss.engine);

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });

                    // Tell clients to do the same
                    thiss.socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID
                        }
                    );

                    entities.splice(indexOfShell, 1);
                }
                if (pair.bodyB.label == "shell" && pair.bodyA.label == "tank" && pair.bodyB.id == thiss.body.id) {
                    // Remove this shell body from world
                    Composite.remove(thiss.world, pair.bodyB);

                    // Unsubscribe from engine's collision report
                    Events.off(thiss.engine);

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });

                    // Tell clients to do the same
                    thiss.socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID
                        }
                    );

                    entities.splice(indexOfShell, 1);
                }
            }
        });
    }
}

module.exports = { Shell };