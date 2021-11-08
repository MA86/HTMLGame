const Matter = require("matter-js/build/matter");
//import Matter from "matter-js";
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class Tank {
    constructor(world, turret) {
        // Create compound body representing tank & turret
        this.tank = Body.create({
            parts: [
                Bodies.rectangle(100, 100, 225, 100,),
                turret
            ],
            isStatic: false,
            frictionAir: 0.5,
            restitution: 0,
            density: 10,
            friction: 1,
            frictionStatic: 10,
        });

        // Properties of tank
        this.speed = 0.04;
        this.rotationSpeed = 5;

        // Move turret center from middle to left
        Body.setCentre(turret, { x: -48, y: -4 }, true);
        // Position turret on tank (based on new center)
        Body.setPosition(turret, this.tank.position);

        // Add tank to the world
        Composite.add(world, [this.tank]);
    }

    setupEventListeners(socket) {
        // Create a force vector
        let dx = Math.cos(this.tank.angle) * this.speed;
        let dy = Math.sin(this.tank.angle) * this.speed;
        let thisTank = this.tank;

        // Apply the force vector for forward/backward movement
        socket.on("move forward", function (data) {
            Body.applyForce(
                thisTank,
                { x: thisTank.position.x, y: thisTank.position.y },
                { x: dx, y: dy }
            );
        });
        socket.on("move backward", function (data) {
            Body.applyForce(
                thisTank,
                { x: thisTank.position.x, y: thisTank.position.y },
                { x: -dx, y: -dy }
            );
        });

        // Apply torque for right/left turn
        socket.on("turn right", function (data) {
            thisTank.torque = thisTank.rotationSpeed;
        });
        socket.on("turn left", function (data) {
            thisTank.torque = -thisTank.rotationSpeed;
        });
    }
}

export { Tank };