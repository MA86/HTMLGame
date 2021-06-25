"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank, Turret, Background } from './entities.js';

const addKeyboardInputEventListeners = function (dic) {
    addEventListener("keydown", function (e) {
        dic[e.code] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete dic[e.code];
    }, false);
}

/* On Window load */
window.addEventListener("load", function (e) {
    // Global variables
    var gameCanvas = document.getElementById("game-canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 1000;
    var ctx = gameCanvas.getContext("2d");

    var keysDown = {};
    var entities = [];

    // Set keyboard event listeners
    addKeyboardInputEventListeners(keysDown);

    // Create background entity
    //let background = new Background("images/grass.png", explosionsData);
    //entities.push(background)

    // Create tank entity
    let tank = new Tank(200, 200, 25, 100, "images/mSixTankBody.png", spriteSheetsData.mSixTankBodyData);
    entities.push(tank);

    let turret = new Turret(tank.position, 0, 35, "images/mSixTankTurret.png", spriteSheetsData.mSixTankTurretData);
    entities.push(turret);

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
