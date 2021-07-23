"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Tank } from './entities/tank.js';
import { TerrainLayer } from './entities/terrainlayer.js';

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

const setupFullScreen = function () {
    window.globals.backgroundCanv.width = window.innerWidth;
    window.globals.backgroundCanv.height = window.innerHeight;
    window.globals.middlegroundCanv.width = window.innerWidth;
    window.globals.middlegroundCanv.height = window.innerHeight;
    window.globals.uppergroundCanv.width = window.innerWidth;
    window.globals.uppergroundCanv.height = window.innerHeight;
    // Reload erased map
    createWorld(window.globals.backgroundCtx);

    addEventListener("resize", setupFullScreen);
}

const createWorld = function (bgCtx) {
    let mapSS = window.globals.images["./images_and_data/ground.png"];
    let map = new TerrainLayer(
        { "x": 0, "y": 0 },
        0,
        null,
        30,
        30,
        mapSS,
        128,
        8,
        8
    );
    map.fill(8);
    map.render(bgCtx);
}

// Load image elements into array
const loadImageElementsThenStartGame = function () {
    let numImagesLoaded = 0;
    let numImagesRequested = window.globals.imagePaths.length;
    for (let i = 0; i < numImagesRequested; i++) {
        let image = new Image();
        image.src = window.globals.imagePaths[i];

        image.onload = function () {
            window.globals.images[window.globals.imagePaths[i]] = image;
            numImagesLoaded++;
            if (numImagesLoaded == numImagesRequested) {
                startGame();
            }
        }
    }
}

/*** Every Frame ***/
const startGame = function () {
    setupKeyboardHandler(window.globals.keysDown);
    setupFullScreen();
    createWorld(window.globals.backgroundCtx);
    window.globals.clientSocket.on("create tank", function (data) {
        let tank = new Tank(
            { "x": 200, "y": 200 },
            25,
            null,
            {
                "tank": window.globals.images["./images_and_data/mSixTankBody.png"],
                "turret": window.globals.images["./images_and_data/mSixTankTurret.png"]
            },
            spriteSheetsData,
            data
        );
        window.globals.entities.push(tank);
    });

    var delta = 0;
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        // Calculate Time between two frames
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        delta = (timeNow - timeThen) / 1000;

        // Clear middle-canvas
        window.globals.middlegroundCtx.clearRect(0, 0, window.globals.middlegroundCanv.width, window.globals.middlegroundCanv.height);
        // Server code
        // Update/render entities of middle-canvas
        for (let i = 0; i < window.globals.entities.length; i++) {
            window.globals.entities[i].update(window.globals.keysDown, delta, window.globals.clientSocket);
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
    window.globals.clientSocket = io();

    loadImageElementsThenStartGame();
});
