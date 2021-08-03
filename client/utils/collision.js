"use strict";

/**
 * The Following implementation of game physics was made possible 
 * thanks to a clear and helpful tutorial by Spicy Yoghurt
 * @ https://spicyyoghurt.com
 */

const detectCollision = function (entities) {
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
                objB.position.x > objA.width + objA.position.x ||
                objA.position.x > objB.width + objB.position.x ||
                objB.position.y > objA.height + objA.position.y ||
                objA.position.y > objB.height + objB.position.y
            ) {
                // Do nothing
            } else {
                objA.isColliding = true;
                objB.isColliding = true;
                console.log("colliding");
            }
        }
    }
}

export { detectCollision };