class Entity {
    constructor(pos, rot, parent) {
        this.position = pos;
        this.rotation = rot;
        this.parent = parent;
        this.children = [];
        if (parent != null)
            parent.children.push(this);
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

    update(keysDown, dt, socket) {
        this.updateThis(keysDown, dt, socket);
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt, socket);
        }
    }

    updateThis(keysdown, dt, socket) {
        // Derived class defines this method
    }
}

export { Entity };