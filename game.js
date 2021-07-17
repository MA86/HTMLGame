"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './entities/tank.js';
import { TerrainLayer } from './entities/terrainlayer.js';

// client code
const setupKeyboardHandler = function (dic) {
    addEventListener("keydown", function (e) {
        // emit keydown, send message to server..
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
        // emit keyup, send message to server...
        delete dic[e.code];
    }, false);
}

const setupFullScreen = function () {
    window.globals.backgroundCanv.width = window.innerWidth;
    window.globals.backgroundCanv.height = window.innerHeight;
    window.globals.middlegroundCanv.width = window.innerWidth;
    window.globals.middlegroundCanv.height = window.innerHeight;
    window.globals.uppergroundCanv.width = window.innerWidth;
    window.globals.uppergroundCanv.height = window.innerHeight;
    // Reload map erased map
    loadMap(window.globals.backgroundCtx);

    addEventListener("resize", setupFullScreen);
}

const loadMap = function (bgCtx) {
    let ssMap = window.globals.images["./images_and_data/ground.png"];
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
    gazalaGrass.render(bgCtx);
}

const loadObject = function (entities, keysDown, bgCtx, ugCtx) {
    // load background
    loadMap(bgCtx);

    // load player
    let tank = new Tank(
        { "x": 200, "y": 200 },
        25,
        null,
        {
            "tank": window.globals.images["./images_and_data/mSixTankBody.png"],
            "turret": window.globals.images["./images_and_data/mSixTankTurret.png"]
        },
        spriteSheetsData
    );
    entities.push(tank);
}

const preLoadThenStart = function (listOfPaths) {
    let numImagesLoaded = 0;
    let numImagesRequested = listOfPaths.length;
    for (let i = 0; i < numImagesRequested; i++) {
        let image = new Image();
        image.src = listOfPaths[i];

        image.onload = function () {
            window.globals.images[listOfPaths[i]] = image;
            numImagesLoaded++;
            if (numImagesLoaded == numImagesRequested) {
                start();
            }
        }
    }
}

const start = function () {
    setupKeyboardHandler(window.globals.keysDown);
    setupFullScreen();
    loadObject(window.globals.entities, window.globals.keysDown, window.globals.backgroundCtx);

    /*** Every Frame ***/
    var delta = 0;
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        // Calculate Time between two frames
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        delta = (timeNow - timeThen) / 1000;

        // Clear middle-canvas
        window.globals.middlegroundCtx.clearRect(0, 0, window.globals.middlegroundCanv.width, window.globals.middlegroundCanv.height);

        // Update/render entities of middle-canvas
        for (let i = 0; i < window.globals.entities.length; i++) {
            window.globals.entities[i].update(window.globals.keysDown, delta);
        }
        for (let i = 0; i < window.globals.entities.length; i++) {
            window.globals.entities[i].render(window.globals.middlegroundCtx);
        }

        // Call main again ASAP
        requestAnimationFrame(main);
        timeThen = timeNow;
    }
    main();
}

/*** On Window Load ***/
addEventListener("load", function (e) {
    // Global objects
    window.globals = {};
    window.globals.backgroundCanv = document.getElementById("bg-canvas");    // For static stuff
    window.globals.middlegroundCanv = document.getElementById("mg-canvas");  // For frames stuff
    window.globals.uppergroundCanv = document.getElementById("ug-canvas");   // For event stuff
    window.globals.backgroundCtx = window.globals.backgroundCanv.getContext("2d");
    window.globals.middlegroundCtx = window.globals.middlegroundCanv.getContext("2d");
    window.globals.uppergroundCtx = window.globals.uppergroundCanv.getContext("2d");
    window.globals.keysDown = {};
    window.globals.entities = [];
    window.globals.imagePaths = [
        "./images_and_data/ground.png",
        "./images_and_data/mSixTankBody.png",
        "./images_and_data/mSixTankTurret.png",
    ];
    window.globals.images = {};

    preLoadThenStart(window.globals.imagePaths);
});
