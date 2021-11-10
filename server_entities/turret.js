const Shell = require("./shell.js").Shell;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Turret {
    constructor(world, initPos) {
        // Create turret on tank's position
        this.turret = Bodies.rectangle(initPos.x, initPos.y, 148, 10, {
            isSensor: true,     // Inactivate body
        });

        // Properties of turret
        this.speed = 1;
        this.readyToFire = true;
        this.parent;    // Set @ server.js
        this.world = world;

        // Add turret to world
        Composite.add(world, [this.turret]);
    }

    setupEventListeners(socket) {
        // Prepare a rotation in radians
        let rotation = 0.00872665 * this.speed;
        let thiss = this;

        // Apply rotation for left/right turn
        socket.on("rotate right", function (data) {
            Body.rotate(thiss.turret, rotation);
        });
        socket.on("rotate left", function (data) {
            Body.rotate(thiss.turret, -rotation);
        });

        socket.on("fire shell", function (data) {
            if (this.readyToFire) {
                // Fire a shell
                let shell = new Shell(
                    thiss.world,
                    thiss.turret,
                    {
                        speed: 0.01,
                        type: "HE",
                        blastRadius: 2,
                        penetration: 2
                    }
                );

                // Wait to "load" new shell
                thiss.readyToFire = false;
                thiss.setLoadTime(500);
            }
        });
    }

    // Shell load time
    setLoadTime(time) {
        let thiss = this;
        setTimeout(function () {
            thiss.readyToFire = true;
        }, time);
    }
}

module.exports = { Turret };