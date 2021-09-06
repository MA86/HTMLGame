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
        Composite = Matter.Composite;

    window.globals = {};
    window.globals.keysDown = {};

    setupKeyboardHandler(window.globals.keysDown);

    // create an engine
    var engine = Engine.create({
        gravity: { x: 0, y: 0 }
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
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

    var compoundBody = Body.create({
        parts: [boxA, boxB]
    });

    // add all of the bodies to the world
    Composite.add(engine.world, [compoundBody, ground]);

    // run the renderer
    Render.run(render);

    // create runner
    //var runner = Runner.create();

    // run the engine
    //Runner.run(runner, engine);

    (function run() {
        window.requestAnimationFrame(run);

        if (window.globals.keysDown && window.globals.keysDown.KeyD == true) {
            //compoundBody.parts[0].torque = 0.1;
            Body.rotate(boxA, 0.0174533);
        }
        if (window.globals.keysDown && window.globals.keysDown.KeyA == true) {
            //boxA.torque = -0.1;
            Body.rotate(boxA, -0.0174533);
        }

        Engine.update(engine, 1000 / 60);
    })();
});
