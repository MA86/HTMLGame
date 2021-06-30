class Entity {
    constructor(pos, rot, parent) {
        this.position = pos;
        this.rotation = rot;
        this.parent = parent;
        this.children = [];
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        this.renderThis(ctx);

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.render(ctx);
        }
        ctx.restore();
    }

    renderThis(ctx) {
        // Derived class defines this method
    }

    update(keysDown, dt) {
        this.updateThis(keysDown, dt);
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt);
        }
    }

    updateThis(keysdown, dt) {
        // Derived class defines this method
    }
}

class Tank extends Entity {
    constructor(pos, rot, parent, ssPath, ssData) {
        super(pos, rot, parent);
        this.speed = 70;             // Unit: PPS       
        this.rotationSpeed = 20;     // Unit: DPS
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, ssPath.tank, ssData.mSixTankBodyData, 0)
        );
        this.children.push(
            new Turret({ "x": 0, "y": 0 }, 0, this, ssPath.turret, ssData.mSixTankTurretData, 0)
        );
    }

    updateThis(keysDown, dt) {
        let rotationInRadian = this.rotation * Math.PI / 180;
        let dx = Math.cos(rotationInRadian) * (this.speed * dt);
        let dy = Math.sin(rotationInRadian) * (this.speed * dt);

        // Move forward/backward
        if (keysDown && keysDown.ArrowUp == true) {
            this.position.x += dx;
            this.position.y += dy;
        }
        if (keysDown && keysDown.ArrowDown == true) {
            this.position.x -= dx;
            this.position.y -= dy;
        }

        // Rotate right/left
        if (keysDown && keysDown.ArrowRight == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.ArrowLeft == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

class Sprite extends Entity {
    constructor(pos, rot, parent, spriteSheetPath, spriteSheetData, framesPerSecond) {
        super(pos, rot, parent);
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
        //ctx.save();
        //ctx.translate(
        //this.position.x,
        //this.position.y
        //);
        //ctx.rotate(this.rotation * Math.PI / 180);
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
        //ctx.restore();
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
    constructor(pos, rot, parent, ssPath, ssData) {
        super(pos, rot, parent);
        this.rotationSpeed = 25;
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, ssPath, ssData, 0)
        );
    }

    updateThis(keysDown, dt) {
        // Set rotateBy
        if (keysDown && keysDown.KeyD == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.KeyA == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

export { Tank };

