const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
// TODO
class Shell {
    constructor(initPos, world, socket, posVec, angle, forceVec, options) {
        this.body = Bodies.rectangle(initPos.x, initPos.y, 20, 4, {
            isStatic: false,
            isSensor: false,
        });


        // Properties of shell
        this.clientID = socket.id;

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
        Composite.add(world, this.body);

        // Apply the force vector to send off the shell
        Body.applyForce(
            this.body,
            { "x": this.body.position.x, "y": this.body.position.y },
            { "x": forceVec.fdx * this.speed, "y": forceVec.fdy * this.speed }
        );
    }

    setupEventListeners() {
        // TODO: "oimpact.on()..."
    }

    onImpact() {
        // TODO:
        // Destroy this shell.
        // Remove this shell from world
        // Remove this shell from cannon parent
    }
}

module.exports = { Shell };