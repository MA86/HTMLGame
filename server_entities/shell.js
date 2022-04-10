const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Collision = Matter.Collision;
const Events = Matter.Events;

class Shell {
    constructor(initPos, world, socket, posVec, angle, forceVec, options, shellID, eng) {
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
    }

    setupEventListeners() {
        let thiss = this;
        // TODO: fix logic
        Events.on(thiss.engine, "collisionStart", function (event) {
            for (let index = 0; index < event.pairs.length; index++) {
                const pair = event.pairs[index];
                console.log(pair.bodyA.id);///
                console.log(pair.bodyB.id);///

                // If this shell and tank collided, remove shell from world
                if (pair.bodyA.label == "shell" && pair.bodyB.label == "tank" && pair.bodyA.id == thiss.body.id) {
                    Composite.remove(thiss.world, pair.bodyA);

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });
                    entities.splice(indexOfShell, 1);

                    // Tell clients to do the same
                    serverSocket.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID
                        }
                    );
                }
                if (pair.bodyB.label == "shell" && pair.bodyA.label == "tank" && pair.bodyB.id == thiss.body.id) {
                    Composite.remove(thiss.world, pair.bodyB);

                    // Remove this shell from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if ("shellID" in obj && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });
                    entities.splice(indexOfShell, 1);
                    ///
                    for (let index = 0; index < entities.length; index++) {
                        const element = entities[index];
                        console.log(typeof element);
                    }
                    // Tell clients to do the same
                    socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID
                        }
                    );
                }
            }
        });
    }


    destroyShell(event) {
        // TODO
        let thiss = this;
    }
}

module.exports = { Shell };