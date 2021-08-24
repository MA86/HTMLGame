"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './entities/tank.js';

/*** On Window Load ***/
addEventListener("load", function (e) {
    // Global Variables 
    window.globals = {};
    window.globals.canvas = document.getElementById("canvas");
    window.globals.context = window.globals.canvas.getContext("2d");
    window.globals.keysDown = {};
    window.globals.images = {};
    window.globals.entities = [];
    window.globals.imagePaths = [
        "./client/images_and_data/ground.png",
        "./client/images_and_data/mSixTankBody.png",
        "./client/images_and_data/mSixTankTurret.png",
    ];

    // Matter APIs (aliases)
    var Engine = Matter.Engine;         // For updating physics.
    var Render = Matter.Render;         // For rendering results of Engine.
    var Bodies = Matter.Bodies;         // To use a pre-made Body.
    var Composite = Matter.Composite;   // Container for entity made of multiple parts.
    var Body = Matter.Body;             // To make a custom Body.
    var Runner = Matter.Runner;         // Optional game loop (Auto updates Engine).
    var Composite = Matter.World;

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

        // *** Starting Point and Image Loading *** //
        ; (function () {
            let numImagesLoaded = 0;
            let numImagesRequested = window.globals.imagePaths.length;
            for (let i = 0; i < numImagesRequested; i++) {
                let image = new Image();
                image.src = window.globals.imagePaths[i];

                image.onload = function () {
                    window.globals.images[window.globals.imagePaths[i]] = image;
                    numImagesLoaded++;
                    if (numImagesLoaded == numImagesRequested) {
                        // Start only when all images are loaded
                        Start();
                    }
                }
            }
        })();

    const Start = function () {
        setupKeyboardHandler(window.globals.keysDown);
        // Set canvas size
        window.globals.canvas.width = window.innerWidth;
        window.globals.canvas.height = window.innerHeight;

        // Create a physics engine
        var engine = Engine.create({
            gravity: { x: 0, y: 0 },
            //enableSleeping: true,
            //gravity: {x: 3, y:4},
            //timing: {timeScale: 0.1},
        });

        // *** Use For Debugging to Visualize Bodies *** //
        var render = Render.create({
            canvas: window.globals.canvas,
            engine: engine,
            options: {
                wireframes: true,
                background: "transparent"
            }
        });
        Render.run(render);

        // Create tank
        var mSixTank = new Tank(
            {
                tank: window.globals.images["./client/images_and_data/mSixTankBody.png"],
                turret: window.globals.images["./client/images_and_data/mSixTankTurret.png"]
            },
            {
                tankData: spriteSheetsData.mSixTankBodyData,
                turretData: spriteSheetsData.mSixTankTurretData
            },
            0,
            Bodies
        );
        window.globals.entities.push(mSixTank);
        Composite.add(engine.world, [mSixTank.body, mSixTank.children[0].body]);

        // Create box for testing
        var box = Bodies.circle(200, 200, 50, {
            isStatic: false,
            restitution: 0.5,
            render: {
                sprite: {
                    //texture: "./ball.png",
                    //xScale: 1 / 6.5,
                    //yScale: 1 / 6.5
                }
            }
        });
        Composite.add(engine.world, [box]);

        /*** Game Loop ***/
        var delta = 0;
        var timeNow = 0;
        var timeThen = 0;
        (function gameLoop(timeStamp) {
            // Calculate Time between two frames
            timeNow = (timeStamp == undefined) ? 0 : timeStamp;
            delta = (timeNow - timeThen) / 1000;

            // Update entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].update(window.globals.keysDown, delta, Body);
            }

            // Update physics
            Engine.update(engine, 1000 / 60);

            // Clear canvas when default renderer is not used
            //window.globals.context.clearRect(
            // 0,
            // 0,
            // window.globals.canvas.width,
            // window.globals.canvas.height
            //);

            // Draw entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].render(window.globals.context);
            }

            // Request to run Game Loop again
            window.requestAnimationFrame(gameLoop);
            timeThen = timeNow;
        })();
    }
});
