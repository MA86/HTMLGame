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

const loadImages = function (listOfPaths) {
    let images = [];
    let loadedImages = 0
    for (let i = 0; i < listOfPaths.length; i++) {
        let image = new Image();
        image.src = listOfPaths[i];
        images[listOfPaths[i]] = image;
        image.onload = function () {
            loadedImages++;
        }
    }
    image.onload =
        images = [{ path: image }, {}]
    return images
}

const preLoadImages = function (images, entities, keysDown, dt, bgCtx, ugCtx) {
    let loadedImages = 0;
    let totalImages = images.length;
    for (let i = 0; i < totalImages; i++) {
        images[i].onload = function () {
            loadedImages++;
            if (loadedImages == totalImages) {
                loadGameObjects()
            }
        }
    }
}

const loadGameObjects = function (entities, keysDown, dt, bgCtx, ugCtx) {
    // Create background
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
    gazalaGrass.update(keysDown, dt);
    gazalaGrass.render(bgCtx);

    // Create player
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
    // Global objects
    var backgroundCanv = document.getElementById("bg-canvas");    // For static
    var middlegroundCanv = document.getElementById("mg-canvas");  // For frames
    var uppergroundCanv = document.getElementById("ug-canvas");   // For events

    var backgroundCtx = backgroundCanv.getContext("2d");
    var middlegroundCtx = middlegroundCanv.getContext("2d");
    var uppergroundCtx = uppergroundCanv.getContext("2d");

    var keysDown = {};
    var entities = [];
    var delta = 0;

    // Function calls
    addFullScreen(backgroundCanv);
    addFullScreen(middlegroundCanv);
    addFullScreen(uppergroundCanv);
    addKeyboardInputEventListeners(keysDown);
    loadGameObjects(entities, keysDown, delta, backgroundCtx);

    /*** Every Frame ***/
    var timeNow = 0;
    var timeThen = 0;
    const main = function (timeStamp) {
        // Calculate Time between two frames
        timeNow = (timeStamp == undefined) ? 0 : timeStamp;
        delta = (timeNow - timeThen) / 1000;

        // Clear middle-canvas
        middlegroundCtx.clearRect(0, 0, middlegroundCanv.width, middlegroundCanv.height);

        // Update/render entities of middle-canvas
        for (let i = 0; i < entities.length; i++) {
            entities[i].update(keysDown, delta);
        }
        for (let i = 0; i < entities.length; i++) {
            entities[i].render(middlegroundCtx);
        }

        // Call main again ASAP
        requestAnimationFrame(main);
        timeThen = timeNow;
    }
    main();
});
