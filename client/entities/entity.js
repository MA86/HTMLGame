class Entity {
    constructor(body, isChild = false) {
        this.isChild = isChild;
        if (this.isChild) {
            this.position = { x: 0, y: 0 };
        }
        this.body = body;
        this.children = [];
    }

    render(ctx) {
        // This logic is for rendering locally vs globally
        if (this.isChild) {
            // Move context to parent position
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.body.angle);
        } else {
            // Move context to global position
            ctx.save();
            ctx.translate(this.body.position.x, this.body.position.y);
            ctx.rotate(this.body.angle);
        }

        // Render self
        this.renderThis(ctx);
        // Render children
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.render(ctx);
        }

        // Restore context
        ctx.restore();
    }

    renderThis(ctx) {
        // Derived class defines this method
    }

    update(keysDown, dt) {
        // Update self
        this.updateThis(keysDown, dt);

        // Update children
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt);
        }
    }

    updateThis(keysdown, dt) {
        // Derived class defines this method
    }
}

export { Entity };