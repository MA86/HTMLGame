const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Events = Matter.Events;

class Shell {
    constructor(initPos, world, clientID, posVec, angle, forceVec, options, eng, server) {
        this.body = Bodies.rectangle(initPos.x, initPos.y, 20, 4, {
            collisionFilter: {
                group: 1
            },
            clientID: clientID,
            isStatic: false,
            isSensor: true,
            label: "shell"
        });

        // Bind this object to its functions
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleCollision = this.handleCollision.bind(this);
        this.removeSelf = this.removeSelf.bind(this);

        // Properties of shell
        this.clientID = clientID;
        this.shellID = this.body.id;
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
        Events.on(thiss.engine, "collisionStart", thiss.handleCollision);

        // Destory self after 2s
        thiss.removeSelf(2000)
    }

    handleCollision(event) {
        let thiss = this;

        for (let index = 0; index < event.pairs.length; index++) {
            const pair = event.pairs[index];

            // If this shell and tank collided, delete shell
            if (pair.bodyA.label == "shell" && pair.bodyB.label == "hull" && pair.bodyA.id == thiss.shellID) {
                // Tell clients to destroy this shell
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
                    if (obj instanceof Shell && obj.shellID == thiss.shellID) {
                        return true;
                    }
                });
                entities.splice(indexOfShell, 1);

                // Remove this shell body from world
                Composite.remove(thiss.world, thiss.body, true);

                // Lose references to important objects
                delete thiss.body;

                // Then, unsubscribe from engine's collision signal
                Events.off(thiss.engine, "collisionStart", thiss.handleCollision);
            }
            if (pair.bodyB.label == "shell" && pair.bodyA.label == "hull" && pair.bodyB.id == thiss.shellID) {
                // Tell clients to destroy this shell
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
                    if (obj instanceof Shell && obj.shellID == thiss.shellID) {
                        return true;
                    }
                });
                entities.splice(indexOfShell, 1);

                // Remove this shell body from world
                Composite.remove(thiss.world, thiss.body, true);

                // Lose references to important objects
                delete thiss.body;

                // Then, unsubscribe from engine's collision signal
                Events.off(thiss.engine, "collisionStart", thiss.handleCollision);
            }
        }
    }

    removeSelf(time) {
        let thiss = this;
        if (time > -1) {
            // After x amount of time, remove shell
            setTimeout(function () {
                // If not already destroyed due to collision...
                if (thiss.body != undefined) {
                    // Tell clients to remove shell
                    thiss.socketServer.emit(
                        "destroy shell",
                        {
                            "clientID": thiss.clientID,
                            "shellID": thiss.shellID,
                            "currentPosition": thiss.body.position,
                            "currentAngle": thiss.body.angle
                        }
                    );

                    // Remove from entities list
                    let indexOfShell = entities.findIndex(function (obj) {
                        if (obj instanceof Shell && obj.shellID == thiss.shellID) {
                            return true;
                        }
                    });
                    entities.splice(indexOfShell, 1);

                    thiss.cleanupSelf();
                }
            }, time);
        }
    }

    cleanupSelf() {
        let thiss = this;

        // Remove this body from physics world
        Composite.remove(thiss.world, thiss.body, true);

        // Lose reference to important properties
        delete thiss.body;

        // Unsubscribe from other events
        Events.off(thiss.engine, "collisionStart", thiss.handleCollision);
    }
}

module.exports = { Shell };