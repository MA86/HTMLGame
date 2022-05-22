class Entity {
    constructor(pos, angle, isChild = false) {
        this.isChild = isChild;
        this.position = pos;
        this.angle = angle;
        this.children = [];
    }

    render(ctx, lerpFactor, delta) {
        // TODO: Make values frame-rate independent? And put lerp in update
        //this.position.x = this.position.x * (delta / 1000);
        //this.position.y = this.position.y * (delta / 1000);
        //this.updatedPosition.x = this.updatedPosition.x * (delta / 1000);
        //this.updatedPosition.y = this.updatedPosition.y * (delta / 1000);
        //this.angle = this.angle * (delta / 1000);

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
}

export { Entity };