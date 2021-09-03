class Entity {
    constructor(body, isChild = false) {
        this.isChild = isChild;
        if (this.isChild) {
            this.position = { x: 0, y: 0 };
            this.angle = 0;
        }
        this.body = body;
        this.children = [];
    }

    render(ctx) {
        if (this.isChild) {
            // If child, move context to local position
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.body.angle);
        } else {
            // If parent, move context to global position
            ctx.save();
            ctx.translate(this.body.position.x, this.body.position.y);
            ctx.rotate(this.body.angle);
        }

        // Render image
        this.renderThis(ctx);
        // Render children's images
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

    update(keysDown, dt, Body, ctx) {
        // Apply physics
        this.updateThis(keysDown, dt, Body, ctx);

        // Apply children's physics
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt, Body, ctx);
        }
    }

    updateThis(keysdown, dt, Body, ctx) {
        // Derived class defines this method
    }
}

export { Entity };