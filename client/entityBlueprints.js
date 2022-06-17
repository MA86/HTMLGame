// Aggregator: this file contains all entities.

let terrainLayer;
let sprite;
let staticObject;
let entity;
let tank;
let turret;
let shell;

// Import entities and misc. objects
(async function () {
    terrainLayer = await import("./entities/terrainlayer.js");
    sprite = await import("./entities/sprite.js");
    staticObject = await import("./entities/static_object.js");
    entity = await import("./entities/entity.js");
    tank = await import("./entities/tank.js");
    turret = await import("./entities/turret.js");
    shell = await import("./entities/shell.js");
})();

//import { TerrainLayer } from "./entities/terrainlayer.js";
//import { Sprite } from "./entities/sprite.js";
//import { StaticObject } from "./entities/static_object.js";
//import { Entity } from "./entities/entity.js";
//import { Tank } from "./entities/tank.js";
//import { Turret } from "./entities/turret.js";
//import { Shell } from "./entities/shell.js";

// Export entities and misc. objects
export {
    terrainLayer,
    sprite,
    staticObject,
    entity,
    tank,
    turret,
    shell
};