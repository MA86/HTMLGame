const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Shell {
    constructor(world, turret, options) {
        this.shell = Bodies.rectangle(turret.position.x, turret.position.y, 20, 4, {
            isStatic: false,
            isSensor: false,
        })

        // Properties of shell
        this.speed = options.speed;
        this.type = options.type;
        this.blastRadius = options.blastRadius;
        this.penetration = options.penetration;

        // Prepare a position vector
        this.pdx = Math.cos(turret.angle + turret.parent.angle) * 140;
        this.pdy = Math.sin(turret.angle + turret.parent.angle) * 140;

        // Add two vectors to create a new position vector where shell will be placed
        Body.setPosition(
            this.shell,
            { x: this.pdx + turret.position.x, y: this.pdy + turret.position.y }
        );
        // Set shell's angle to turret's angle.
        Body.setAngle(this.shell, turret.angle + turret.parent.angle);

        // Prepare a force vector
        this.fdx = Math.cos(turret.angle + turret.parent.angle) * this.speed;
        this.fdy = Math.sin(turret.angle + turret.parent.angle) * this.speed;

        // Add shell to the world
        Composite.add(world, [this.shell]);

        // Apply the force vector to send off the shell
        Body.applyForce(
            this.shell,
            { x: this.shell.position.x, y: this.shell.position.y },
            { x: this.fdx, y: this.fdy }
        );
    }

    setupEventListeners(socket) {
        // Does nothing
    }

    onImpact() {
        // TODO:
        // Destroy this shell.
        // Remove this shell from world
        // Remove this shell from cannon parent
    }
}

module.exports = { Shell };