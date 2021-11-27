const Shell = require("./shell.js").Shell;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Turret {
    constructor(initPos, world, socket, parent) {
        // Create body representing turret
        this.body = Bodies.rectangle(initPos.x, initPos.y, 148, 10, {
            isSensor: true,     // Inactivate physics
        });

        // Properties of turret
        this.clientID = socket.id;
        this.speed = 0.65;
        this.readyToFire = true;
        this.world = world;
        this.socket = socket;
        this.parent = parent;
    }

    setupEventListeners() {
        // Create rotation in radians
        let thiss = this;
        let rotation = 0.00872665 * thiss.speed;

        // Trigger left/right turn
        thiss.socket.on("rotate right", function (data) {
            Body.rotate(thiss.body, rotation);
            //console.log(thiss.body.angle);///
        });
        thiss.socket.on("rotate left", function (data) {
            Body.rotate(thiss.body, -rotation);
        });

        // Trigger cannon fire
        thiss.socket.on("fire shell", function (data) {
            if (thiss.readyToFire) {
                // Fire a shell
                let shell = new Shell(
                    thiss.world,
                    thiss.body,
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