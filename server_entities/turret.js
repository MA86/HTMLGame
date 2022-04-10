const Shell = require("./shell.js").Shell;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Turret {
    constructor(initPos, world, socket, servSoc, tank, eng) {
        // Create a body representing turret
        this.body = Bodies.rectangle(initPos.x, initPos.y, 148, 10, {
            isSensor: true,     // Inactivate physics
        });

        // Properties of turret
        this.clientID = socket.id;
        this.shellID = null;
        this.serverSocket = servSoc;
        this.speed = 0.72;
        this.readyToFire = true;
        this.firedShell = null;
        this.world = world;
        this.engine = eng;
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

                // Increment shellID and create a shell
                thiss.shellID = shellID++;
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
                    },
                    thiss.shellID,
                    thiss.engine
                );

                // Setup child events TODO: move it to shell...
                thiss.firedShell.setupEventListeners();

                // Add this shell to entities list
                entities.push(thiss.firedShell);
                thiss.firedShell = null;

                // Tell all clients to create this shell's representation
                thiss.serverSocket.emit(
                    "create shell",
                    {
                        "clientID": thiss.clientID,
                        "shellID": thiss.shellID
                    }
                );

                // Wait-time to "load" new shell
                thiss.readyToFire = false;
                thiss.setLoadTime(2000);
            }
        });

    }

    // Shell load time
    setLoadTime(time) {
        let thiss = this;
        setTimeout(function () {
            // TODO: Perhaps do something while shell is being loaded?

            thiss.readyToFire = true;
        }, time);
    }
}

module.exports = { Turret };