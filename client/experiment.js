const setupKeyboardHandler = function (dic) {
    addEventListener("keydown", function (e) {
        dic[e.code] = true;
        switch (e.code) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "Space":
                e.preventDefault();
                break;
            default:
                break;
        }
    }, false);

    addEventListener("keyup", function (e) {
        delete dic[e.code];
    }, false);
}

addEventListener("load", function () {
    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Constraint = Matter.Constraint,
        Composite = Matter.Composite;

    window.globals = {};
    window.globals.keysDown = {};

    setupKeyboardHandler(window.globals.keysDown);

    // create an engine
    var engine = Engine.create({
        gravity: { x: 0, y: 0.05 }
    });

    // create a renderer
    var render = Render.create({
        element: document.getElementById("canvas-div"),
        engine: engine,
        options: {
            wireframes: true
        }
    });

    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 50, 10, {
        //collisionFilter: { group: -1 },
        //isStatic: true
    });
    var boxB = Bodies.rectangle(400, 200, 80, 80, {
        //collisionFilter: { group: -1 },
        //isStatic: true
    });
    // Test: turn into same mass
    //Body.setMass(boxA, 2);
    //Body.setMass(boxB, 2);

    var ground = Bodies.rectangle(400, 400, 810, 60, { isStatic: true });

    /*
    // Test 1 Compound Method
    Body.setCentre(boxA, { x: -50, y: 0 }, true);
    Body.setPosition(boxA, boxB.position);
    var compoundBody = Bodies.circle(400, 200, 100, {
        parts: [boxA, boxB]
    });
    

    
    // Test 2 Constraint Method
    var con = Constraint.create({
        bodyA: boxA,
        bodyB: boxB,
        stiffness: 1,
        length: 0
    });
    */

    // Test 3 Composite Method
    var c = Composite.create({
        constraints: [con]
    });


    // add all of the bodies to the world
    Composite.add(engine.world, [compoundBody, ground]);

    // run the renderer
    Render.run(render);

    // create game loop
    //var runner = Runner.create();
    // run engine in game loop
    //Runner.run(runner, engine);

    (function run() {
        window.requestAnimationFrame(run);

        if (window.globals.keysDown && window.globals.keysDown.KeyD == true) {
            Body.rotate(boxB, 0.00872665);
            //Body.rotate(boxA, -0.00872665);
            //boxA.torque = 0.01;
        }
        if (window.globals.keysDown && window.globals.keysDown.KeyA == true) {
            boxA.torque = 0.01;
            //Body.applyForce(boxB, { x: boxB.position.x, y: boxB.position.y }, { X: 0, y: 1 });
        }
        //Engine.update(engine, (1 / 3) / 60 * 1000);
        Engine.update(engine, 1000 / 60);
    })();
});
