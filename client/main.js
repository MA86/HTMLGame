"use strict";

//import * as spriteSheetsData from "./spritesheetsData.js";
//import { Tank } from "./entities/tank.js";
//import { TerrainLayer } from "./entities/terrainlayer.js";

/*** On Window Load Event ***/
window.addEventListener("load", function (e) {
    // Global Variables 
    window.globals = {};
    window.globals.bgCanvas = document.getElementById("bg-canvas");
    window.globals.bgContext = window.globals.bgCanvas.getContext("2d");
    window.globals.gameCanvas = document.getElementById("game-canvas");
    window.globals.gameContext = window.globals.gameCanvas.getContext("2d");
    window.globals.uiCanvas = document.getElementById("ui-canvas");
    window.globals.uiContext = window.globals.uiCanvas.getContext("2d");
    window.globals.keysDown = {};
    window.globals.spriteSheetsData = {};
    window.globals.entityBlueprints = {};
    window.globals.images = {};
    window.globals.entities = [];
    window.globals.staticEntities = [];
    window.globals.clientIDs = [];
    window.globals.imagePaths = [
        "./images_and_data/mSixTankBody.png",
        "./images_and_data/treadMark.png",
        "./images_and_data/mSixTankTurret.png",
        "./images_and_data/shell.png",
        "./images_and_data/explosions.png", /// Delete if not needed
        "./images_and_data/hit.png",
        "./images_and_data/ground.png"
    ];
    window.globals.clientSocket = null;
    window.globals.serverTickRate = 1000 / 10;     // Milisecond

    const setupKeyboardHandler = function (pressedArray) {
        // Listen for key pressed
        addEventListener("keydown", function (key) {
            // Add key to pressed array
            pressedArray[key.code] = true;
            // Prevent default key behavior
            switch (key.code) {
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight":
                case "Space":
                    key.preventDefault();
                    break;
                default:
                    break;
            }
        }, false);

        // Listen for key released
        addEventListener("keyup", function (key) {
            // Key is no longer 'pressed'
            delete pressedArray[key.code];
        }, false);
    }

    const Start = function () {
        setupKeyboardHandler(window.globals.keysDown);

        // UI, game, and background canvases match browser screen
        window.globals.bgCanvas.width = window.innerWidth;
        window.globals.bgCanvas.height = window.innerHeight;
        window.globals.gameCanvas.width = window.innerWidth;
        window.globals.gameCanvas.height = window.innerHeight;
        window.globals.uiCanvas.width = window.innerWidth;
        window.globals.uiCanvas.height = window.innerHeight;

        //TODO: create multiple terrian layers instead of one. Render the map
        let testTerrain = new window.globals.entityBlueprints.TerrainLayer(
            0, 0, null, 10, 10, window.globals.images["./images_and_data/ground.png"], 128, 8, 8
        );
        testTerrain.setTiles(window.globals.spriteSheetsData.oasis.layerOne);
        testTerrain.renderThis(window.globals.bgContext);
        testTerrain.setTiles(window.globals.spriteSheetsData.oasis.layerTwo);
        testTerrain.renderThis(window.globals.bgContext);

        // Open a TCP/UDP socket connection to server
        window.globals.clientSocket = io();

        // Create entities when 'create entities' event is triggered
        window.globals.clientSocket.on("create entities", function (data) {
            // If entity doesn't exist already...
            if (!window.globals.clientIDs.includes(data.clientID)) {
                // Create tank
                let mSixTank = new window.globals.entityBlueprints.Tank(
                    window.globals.images["./images_and_data/mSixTankBody.png"],
                    window.globals.spriteSheetsData.mSixTankBodyData,
                    0,
                    data.clientID,
                    {
                        "ss": window.globals.images,
                        "ssData": window.globals.spriteSheetsData,
                        "fps": 0,
                        "clientID": data.clientID
                    },
                    {
                        "ss": window.globals.images["./images_and_data/shell.png"],
                        "ssData": window.globals.spriteSheetsData.shellData,
                        "fps": 30,
                        "clientID": data.clientID
                    }
                );

                // Add to list
                window.globals.entities.push(mSixTank);
                window.globals.clientIDs.push(data.clientID);
            }
        });

        // Remove entity when 'remove entities' event is triggered
        window.globals.clientSocket.on("remove entities", function (data) {
            if (window.globals.clientIDs.includes(data.clientID)) {
                let indexOfEntity = window.globals.entities.map(function (obj) {
                    return obj.clientID;
                }).indexOf(data.clientID);
                window.globals.entities.splice(indexOfEntity, 1);
                window.globals.clientIDs.splice(indexOfEntity, 1);
            }
        });

        // Game Loop //
        var delta = 0;
        var timeNow = 0;
        var timeThen = 0;

        (function gameLoop(timeStamp) {
            // Calculate time between two frames
            timeNow = timeStamp;
            delta = (timeNow - timeThen);

            // Update game-canvas's entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].update(window.globals.keysDown, delta);
            }

            // Clear game-canvas
            window.globals.gameContext.clearRect(
                0,
                0,
                window.globals.gameCanvas.width,
                window.globals.gameCanvas.height
            );

            // Render game-canvas's static entities
            for (let i = 0; i < window.globals.staticEntities.length; i++) {
                window.globals.staticEntities[i].render(window.globals.gameContext, 1000, delta);
            }

            // Render game-canvas's entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].render(window.globals.gameContext, 1000, delta);
            }

            // Request to run Game Loop again
            window.requestAnimationFrame(gameLoop);
            timeThen = timeNow;
        })();
    }

        // Self-Invoking Starting Point: Assets are loaded here //
        ; (async function () {
            // Download modules
            window.globals.entityBlueprints = await import("./entityBlueprints.js");
            window.globals.spriteSheetsData = await import("./spritesheetsData.js");

            // Download sprites 
            let numImagesLoaded = 0;
            let numImagesRequested = window.globals.imagePaths.length;
            for (let i = 0; i < numImagesRequested; i++) {
                let image = new Image();
                image.src = window.globals.imagePaths[i];

                image.onload = function () {
                    window.globals.images[window.globals.imagePaths[i]] = image;
                    numImagesLoaded++;
                    if (numImagesLoaded == numImagesRequested) {
                        // Start only when all images are loaded
                        Start();
                    }
                }
            }
        })();
});
