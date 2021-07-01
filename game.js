"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './entities.js';

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

const addFullScreenMode = function (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    addEventListener("resize", addFullScreenMode);
}

const loadGame = function (entities) {
    // Load entities
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

    // Load map
}

/*** On Window Load ***/
addEventListener("load", function (e) {
    // Global variables
    var gameCanvas = document.getElementById("game-canvas");
    var ctx = gameCanvas.getContext("2d");
    var keysDown = {};
    var entities = [];

    addFullScreenMode(gameCanvas);
    addKeyboardInputEventListeners(keysDown);

    loadGame(entities);

    /*** Game Loop ***/
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        // Time between two frames
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        let delta = (timeNow - timeThen) / 1000;

        // Clear canvas
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Update/render
        for (let i = 0; i < entities.length; i++) {
            entities[i].update(keysDown, delta);
        }
        for (let i = 0; i < entities.length; i++) {
            entities[i].render(ctx);
        }

        // Call main again ASAP
        requestAnimationFrame(main);
        timeThen = timeNow;
    }
    main();
});
