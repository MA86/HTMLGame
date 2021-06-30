"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './sample.js';

const addKeyboardInputEventListeners = function (dic) {
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

const setFullScreenMode = function (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
}

/* On Window load */
addEventListener("load", function (e) {
    // Global variables
    var gameCanvas = document.getElementById("game-canvas");
    var ctx = gameCanvas.getContext("2d");
    var keysDown = {};
    var entities = [];

    setFullScreenMode(gameCanvas);
    addEventListener("resize", setFullScreenMode);
    addKeyboardInputEventListeners(keysDown);

    // Create tank entity
    let tank = new Tank(
        { "x": 200, "y": 200 },
        25,
        null,
        {
            "tank": "images/mSixTankBody.png",
            "turret": "images/mSixTankTurret.png"
        },
        spriteSheetsData
    );
    entities.push(tank);

    // Game loop
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        // Calculate time between two frames
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        let delta = (timeNow - timeThen) / 1000;

        // Clear canvas
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        for (let i = 0; i < entities.length; i++) {
            entities[i].update(keysDown, delta);
        }
        for (let i = 0; i < entities.length; i++) {
            entities[i].render(ctx);
        }

        // Call main for every frame
        requestAnimationFrame(main);
        timeThen = timeNow;
    }
    // Start loop
    main();
});
