"use strict";

import { Tank, Background } from './entities.js';
import { Sprite } from './sprite.js';

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
    var ctx = gameCanvas.getContext("2d");
    var keysDown = {};
    var entities = [];

    // Set keyboard event listeners
    addKeyboardInputEventListeners(keysDown);

    // Background entity
    let bgImage = new Image();
    bgImage.src = "images/grass.png";
    let background = new Background(bgImage);
    entities.push(background)

    // Tank entity
    let tankImage = new Image();
    tankImage.src = "images/icon.png";
    let tank = new Tank(200, 200, 50, 100, tankImage);
    entities.push(tank);
    
    // TEST
    let explosions = new Image();
    explosions.src = "images/explosions.png";
    let sprite = new Sprite(explosions, explosionsData, 30);
    entities.push(sprite);
    // TEST

    // Game loop
    var timeNow;
    var timeThen;
    const main = function () {
        timeNow = Date.now();
        let delta = (timeNow - timeThen) / 1000.0;

        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        background.render(ctx);

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
