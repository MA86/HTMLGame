const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Engine = Matter.Engine;

class Tank {
    constructor(world, initPos, turret) {
        // Create compound body representing tank & turret
        this.tank = Body.create({
            parts: [
                Bodies.rectangle(initPos.x, initPos.y, 225, 100,),
                turret
            ],
            isStatic: false,
            frictionAir: 0.5,
            restitution: 0,
            density: 4,
            friction: 1,
            frictionStatic: 10,
        });

        // Properties of tank
        this.speed = 0.004;
        this.rotationSpeed = 2;

        // Move turret center from middle to left
        Body.setCentre(turret, { x: -48, y: -4 }, true);
        // Position turret on tank (based on new center)
        Body.setPosition(turret, this.tank.position);

        // Add tank to the world
        Composite.add(world, [this.tank]);
    }

    setupEventListeners(socket, engine) {
        //let thisTank = this;
        let thiss = this;

        // Apply the force vector for forward/backward movement
        socket.on("move forward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.tank.angle) * thiss.speed;
            let dy = Math.sin(thiss.tank.angle) * thiss.speed;

            Body.applyForce(
                thiss.tank,
                { x: thiss.tank.position.x, y: thiss.tank.position.y },
                { x: dx, y: dy }
            );
        });
        socket.on("move backward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.tank.angle) * thiss.speed;
            let dy = Math.sin(thiss.tank.angle) * thiss.speed;

            Body.applyForce(
                thiss.tank,
                { x: thiss.tank.position.x, y: thiss.tank.position.y },
                { x: -dx, y: -dy }
            );
        });

        // Apply torque for right/left turn
        socket.on("turn right", function (data) {
            thiss.tank.torque = thiss.rotationSpeed;

            Body.update(thiss.tank, 1000 / 60, 1, 1); ///
            socket.emit("render coordinates", { "position": thiss.tank.position, "angle": thiss.tank.angle });///
        });
        socket.on("turn left", function (data) {
            thiss.tank.torque = -thiss.rotationSpeed;

            Body.update(thiss.tank, 1000 / 60, 1, 1); ///
            socket.emit("render coordinates", { "position": thiss.tank.position, "angle": thiss.tank.angle });///
        });
    }
}

module.exports = { Tank };