class Entity {
    constructor(pos, angle, isChild = false) {
        this.isChild = isChild;
        this.position = pos;
        this.angle = angle;
        this.children = [];

        // Variables for lerping
        this.updatedPosition = { "x": 0, "y": 0 }; //TODO move to tank
    }

    render(ctx, lerpFactor, delta) {
        // TODO: Make values frame-rate independent? And put lerp in update
        //this.position.x = this.position.x * (delta / 1000);
        //this.position.y = this.position.y * (delta / 1000);
        //this.updatedPosition.x = this.updatedPosition.x * (delta / 1000);
        //this.updatedPosition.y = this.updatedPosition.y * (delta / 1000);
        //this.angle = this.angle * (delta / 1000);

        // Lerp states
        this.lerpMovement(this.lerp, this.position, this.updatedPosition, delta, lerpFactor);

        // This logic is for rendering locally vs globally
        if (this.isChild) {
            // Translate context relative to parent position
            ctx.save();
            ctx.translate(0, 0);
            ctx.rotate(this.angle);
        } else {
            // Otherwise, translate context normally
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.angle);
        }

        // Render self
        this.renderThis(ctx);
        // Render children
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            child.render(ctx, lerpFactor, delta);
        }

        // Restore context
        ctx.restore();
    }

    renderThis(ctx) {
        // Derived class defines this method
    }

    update(keysDown, delta) {
        // Update self
        this.updateThis(keysDown, delta);

        // Update children
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            child.update(keysDown, delta);
        }
    }

    updateThis(keysdown, delta) {
        // Derived class defines this method
    }

    lerpMovement(lerpFunc, position, updatedPosition, delta, lerpFactor) {
        if (delta <= lerpFactor) {
            // Do linear interpolation
            this.position.x = lerpFunc(position.x, updatedPosition.x, delta / lerpFactor);
            this.position.y = lerpFunc(position.y, updatedPosition.y, delta / lerpFactor);
        } else {
            // Skip linear interpolation
            this.position.x = updatedPosition.x;
            this.position.y = updatedPosition.y;
        }
    }

    lerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

export { Entity };