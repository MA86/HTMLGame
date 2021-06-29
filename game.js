"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './sample.js';

const addKeyboardInputEventListeners = function (dic) {
    addEventListener("keydown", function (e) {
        dic[e.code] = true;
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
window.addEventListener("load", function (e) {
    // Global variables
    var gameCanvas = document.getElementById("game-canvas");
    var ctx = gameCanvas.getContext("2d");
    var keysDown = {};
    var entities = [];

    // Full screen mode
    setFullScreenMode(gameCanvas);
    window.addEventListener("resize", setFullScreenMode);

    // Set keyboard event listeners
    addKeyboardInputEventListeners(keysDown);

    // Create background entity
    //let background = new Background("images/grass.png", explosionsData);
    //entities.push(background)

    // Create tank entity
    let tank = new Tank(300, 300, 25, 110, { "tank": "images/mSixTankBody.png", "turret": "images/mSixTankTurret.png" }, spriteSheetsData);
    entities.push(tank);

    // Game loop
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        let delta = (timeNow - timeThen) / 1000;

        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Update entities
        for (let i = 0; i < entities.length; i++) {
            entities[i].update(keysDown, delta);
        }
        // Render entities
        for (let i = 0; i < entities.length; i++) {
            entities[i].render(ctx);
        }

        // Call main for every frame
        window.requestAnimationFrame(main);
        timeThen = timeNow;
    }
    // Start game loop
    main();
});
