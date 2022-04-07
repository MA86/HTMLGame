const Shell = require("./shell.js").Shell;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Turret {
    constructor(initPos, world, socket, servSoc, tank) {
        // Create body representing turret
        this.body = Bodies.rectangle(initPos.x, initPos.y, 148, 10, {
            isSensor: true,     // Inactivate physics
        });

        // Properties of turret
        this.clientID = socket.id;
        this.serverSocket = servSoc;
        this.speed = 0.72;
        this.readyToFire = true;
        this.firedShell = null;
        this.world = world;
        this.socket = socket;
        this.tank = tank;
    }

    setupEventListeners() {
        // Create rotation in radians
        let thiss = this;
        let rotation = 0.00872665 * thiss.speed;

        // Trigger left/right turn
        thiss.socket.on("rotate right", function (data) {
            Body.rotate(thiss.body, rotation);
        });
        thiss.socket.on("rotate left", function (data) {
            Body.rotate(thiss.body, -rotation);
        });

        // Trigger cannon fire
        thiss.socket.on("fire shell", function (data) {
            if (thiss.readyToFire && thiss.clientID == data.clientID) {
                // TODO: Remove previous shell from world
                // Move to shell, remove by x time.
                if (thiss.firedShell) {
                    Composite.remove(thiss.world, thiss.firedShell.body);
                }


                // Prepare position vector
                let pdx = Math.cos(thiss.body.angle + thiss.tank.body.angle) * 140;
                let pdy = Math.sin(thiss.body.angle + thiss.tank.body.angle) * 140;
                pdx = pdx + thiss.body.position.x;
                pdy = pdy + thiss.body.position.y;

                // Prepare angle
                let angle = thiss.body.angle + thiss.tank.body.angle;

                // Prepare a force vector
                let fdx = Math.cos(thiss.body.angle + thiss.tank.body.angle);
                let fdy = Math.sin(thiss.body.angle + thiss.tank.body.angle);

                // Fire shell
                thiss.firedShell = new Shell(
                    { "x": thiss.body.position.x, "y": thiss.body.position.y },
                    thiss.world,
                    thiss.socket,
                    { "pdx": pdx, "pdy": pdy },
                    angle,
                    { "fdx": fdx, "fdy": fdy },
                    {
                        speed: 0.01,
                        type: "HE",
                        blastRadius: 2,
                        penetration: 2
                    }
                );

                // Tell all clients to create this shell's representation///
                thiss.serverSocket.emit(
                    "create shell",
                    { "clientID": thiss.clientID }
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