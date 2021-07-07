"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import * as maps from './maps/maps.js';
import { Tank, TerrainLayer, Turret } from './entities.js';

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

const addFullScreen = function (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    addEventListener("resize", addFullScreen);
}

const loadGame = function (entities) {
    // Load map
    let ssMap = new Image();
    ssMap.src = "images/ground.png";
    let gazalaGrass = new TerrainLayer(
        { x: 0, y: 0 },
        0,
        null,
        30,
        30,
        ssMap,
        128,
        8,
        8
    );
    gazalaGrass.fill(8);
    entities.push(gazalaGrass);

    let desertTurret = new Turret({ x: 0, y: 0 }, 0, gazalaDesert, "images/mSixTankTurret.png", spriteSheetsData.mSixTankTurretData);
    desertTurret.rotationSpeed = 900;

    // Load player
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
}

/*** On Window Load ***/
addEventListener("load", function (e) {
    // Global variables
    var staticCanvas = document.getElementById("static-canvas");    // For static bg
    var uiCanvas = document.getElementById("ui-canvas");            // For event
    var gameCanvas = document.getElementById("game-canvas");        // For frame
    var staticCtx = staticCanvas.getContext("2d");
    var uiCtx = uiCanvas.getContext("2d");
    var gameCtx = gameCanvas.getContext("2d");
    var keysDown = {};
    var entities = [];

    addFullScreen(staticCanvas);
    addFullScreen(uiCanvas);
    addFullScreen(gameCanvas);
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
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Update/render entities
        for (let i = 0; i < entities.length; i++) {
            entities[i].update(keysDown, delta);
        }
        for (let i = 0; i < entities.length; i++) {
            entities[i].render(gameCtx);
        }

        // Call main again ASAP
        requestAnimationFrame(main);
        timeThen = timeNow;
    }
    main();
});
