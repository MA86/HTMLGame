"use strict";

import { Tank, Background } from './entities.js';

const addKeyboardInputEventListeners = function (dic) {
    addEventListener("keydown", function (e) {
        dic[e.code] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete dic[e.code];
    }, false);
}

/* On Window load - AKA main */
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

    // Background entity
    //let background = new Background("images/grass.png", explosionsData);
    //entities.push(background)
    
    // Tank entity
    let tank = new Tank(200, 200, 25, 100, "images/mSix.png", mSixData);
    entities.push(tank);

    // Game loop
    var timeNow;
    var timeThen;
    const main = function () {
        timeNow = Date.now();
        let delta = (timeNow - timeThen) / 1000.0;

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
    timeThen = Date.now()
    main();   // Initial call
});
