import { Entity } from "./entity";

// Tank cannon sketch
class Cannon extends Entity {
    constructor() {
        this.speed;
        this.blastRadius;
        this.type;
        this.damage;
        this.penetration;
    }

    animation() {

    }

    onImpact() {
        // Event?
    }

    renderThis() {
        // Render animation as usual
    }

    updateThis() {
        // Physics
    }
}