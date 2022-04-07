"use strict";

import * as spriteSheetsData from "./spritesheetsData.js";
import { Tank } from "./entities/tank.js";
import { Turret } from "./entities/turret.js";


/*** On Window Load Event ***/
addEventListener("load", function (e) {
    // Global Variables 
    window.globals = {};
    window.globals.canvas = document.getElementById("canvas");
    window.globals.context = window.globals.canvas.getContext("2d");
    window.globals.keysDown = {};
    window.globals.images = {};
    window.globals.entities = [];
    window.globals.clientIDs = [];
    window.globals.imagePaths = [
        "./images_and_data/mSixTankBody.png",
        "./images_and_data/mSixTankTurret.png",
        "./images_and_data/shell.png"
    ];
    window.globals.clientSocket = null;

    const setupKeyboardHandler = function (dic) {
        // Listen for key pressed
        addEventListener("keydown", function (key) {
            dic[key.code] = true;
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
        addEventListener("keyup", function (e) {
            delete dic[e.code];
        }, false);
    }

    const Start = function () {
        setupKeyboardHandler(window.globals.keysDown);

        // Canvas screen match browser screen
        window.globals.canvas.width = window.innerWidth;
        window.globals.canvas.height = window.innerHeight;

        //TODO: Load the map

        // Open a TCP/UDP socket connection to server
        window.globals.clientSocket = io();

        // Create entities when 'create entities' event is triggered
        window.globals.clientSocket.on("create entities", function (data) {
            // If entity doesn't exist already...
            if (!window.globals.clientIDs.includes(data.clientID)) {
                // Create tank
                let mSixTank = new Tank(
                    window.globals.images["./images_and_data/mSixTankBody.png"],
                    spriteSheetsData.mSixTankBodyData,
                    0,
                    data.clientID,
                    {
                        "ss": window.globals.images,
                        "ssData": spriteSheetsData,
                        "fps": 0,
                        "clientID": data.clientID
                    },
                    {
                        "ss": window.globals.images["./images_and_data/shell.png"],
                        "ssData": spriteSheetsData.shellData,
                        "fps": 0,
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

        /*** Game Loop ***/
        var delta = 0;
        var timeNow = 0;
        var timeThen = 0;

        (function gameLoop(timeStamp) {
            // Calculate time between two frames
            timeNow = (timeStamp == undefined) ? 0 : timeStamp;
            delta = (timeNow - timeThen);

            // Update entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].update(window.globals.keysDown, delta);
            }

            // Clear canvas when default renderer is not used
            window.globals.context.clearRect(
                0,
                0,
                window.globals.canvas.width,
                window.globals.canvas.height
            );

            // Draw entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].render(window.globals.context);
            }

            // Request to run Game Loop again
            window.requestAnimationFrame(gameLoop);
            timeThen = timeNow;
        })();
    }

        // *** Starting Point and Image Loading *** //
        ; (function () {
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
