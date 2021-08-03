"use strict";

/**
 * The Following implementation of game physics was made possible 
 * thanks to a clear and helpful tutorial by Spicy Yoghurt
 * @ https://spicyyoghurt.com
 */

const detectCollision = function (objA, objB, entities) {
    let objA;
    let objB;

    // Reset collision state of all objects
    for (let i = 0; i < entities.length; i++) {
        entities[i].isColliding = false;
    }

    for (let i = 0; i < entities.length; i++) {
        objA = entities[i];
        for (let j = i + 1; j < entities.length; j++) {
            objB = entities[j];
            // This efficient compare algorithm is borrowed from Spicy Yoghurt
            if (
                objB.x > objA.width + objA.x ||
                objA.x > objB.width + objB.x ||
                objB.y > objA.height + objA.y ||
                objA.y > objB.height + objB.y
            ) {
                objA.isColliding = false;
                objB.isColliding = false;
            } else {
                objA.isColliding = true;
                objB.isColliding = true;
            }
        }
    }
}

export { detectCollision };