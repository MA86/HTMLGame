const Shell = require("./shell.js").Shell;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;

class Turret {
    constructor(initPos, world, socket, server, tank, eng) {
        // Create a body representing turret
        this.body = Bodies.rectangle(initPos.x, initPos.y, 148, 10, {
            isSensor: true,     // Inactivate physics
        });

        // Bind this object to its functions
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setLoadTime = this.setLoadTime.bind(this);
        this.cleanupSelf = this.cleanupSelf.bind(this);

        // Properties of turret
        this.clientID = socket.id;
        this.socketServer = server;
        this.speed = 0.72;
        this.readyToFire = true;
        this.firedShell = null;
        this.world = world;
        this.engine = eng;
        this.socket = socket;
        this.tank = tank;

        this.setupEventListeners();
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

                // Create a shell
                thiss.firedShell = new Shell(
                    { "x": thiss.body.position.x, "y": thiss.body.position.y },
                    thiss.world,
                    thiss.clientID,
                    { "pdx": pdx, "pdy": pdy },
                    angle,
                    { "fdx": fdx, "fdy": fdy },
                    {
                        speed: 0.009,
                        type: "HE",
                        blastRadius: 2,
                        penetration: 2
                    },
                    thiss.engine,
                    thiss.socketServer
                );

                // Tell all clients to create this shell's representation
                thiss.socketServer.emit(
                    "create shell",
                    {
                        "clientID": thiss.firedShell.clientID,
                        "shellID": thiss.firedShell.shellID
                    }
                );
                // Remove reference
                thiss.firedShell = null;

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

    cleanupSelf() {
        let thiss = this;

        delete thiss.tank;
    }
}

module.exports = { Turret };