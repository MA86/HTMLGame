import { Turret } from "./entities";
import { Sprite } from "./sprite";

class Entity {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.parent = null;
        this.children = []
    }

    render(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        this.renderThis(ctx);

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.render()
        }

        ctx.restore();
    }

    renderThis(ctx) {

    }

    update(keysDown, dt) {
        this.updateThis();
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt)
        }
    }

    updateThis(keysdown, dt) {

    }
}

class Tank extends Entity {
    constructor() {
        super();
        this.children.push(new Sprite());
        this.children.push(new Turret());
    }
}

class Sprite extends Entity {
    constructor(spriteSheetPath, spriteSheetData, framesPerSecond) {
        super();
        this.spriteSheetData = spriteSheetData;
        this.spriteSheet = new Image();
        this.spriteSheet.src = spriteSheetPath;
        this.index = 0;
        this.framesPerSecond = framesPerSecond;
        this.timeTracker = 0;
    }
    renderThis(ctx) {
        let frameCenter = {
            "x": this.spriteSheetData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.frames[this.index].frame.h / 2
        };
        ctx.save();
        ctx.translate(
            this.position.x,
            this.position.y
        );
        ctx.rotate(this.rotation.r * Math.PI / 180);
        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -frameCenter.x,
            -frameCenter.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h
        );
        ctx.restore();
    }

    updateThis(keysDown, dt) {
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

class Turret extends Entity {
    constructor() {
        super();
        this.rotationSpeed = rotationSpeed;
        let sprite = new Sprite(spriteSheetPath, spriteSheetData, 0, this);
        this.children.push(sprite);
    }

    updateThis(keysDown, dt) {
        // Set rotateBy
        if (keysDown.KeyD == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown.KeyA == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

