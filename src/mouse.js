class MouseManager extends Drawable{
    constructor() {
        super(null, 0, "rect", "black", 0, 0, true);
        
        if (!MouseManager.instance) MouseManager.instance = this;
        this.isDragging = false;
        this.currentPos = null;
        
        this.canvas = Canvas.instance.canvas;
        this.canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.pos = this.getMousePosition(event);
            Drawable.drawablelist.push(this);
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.currentPos = this.getMousePosition(event);
                this.width = this.currentPos.x - this.pos.x;
                this.height = this.currentPos.y - this.pos.y;
                
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.stopDraw();
            // select units
        });
    }
    stopDraw() {
        this.isDragging = false;
        this.remove();
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const isOutOfBoundary = mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height;
        if(isOutOfBoundary) this.stopDraw();
        return new Vector2(mouseX, mouseY);
    }

    
    draw() {
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)'; // Cyan color with 20% opacity
        this.ctx.fillRect(
            this.pos.x, 
            this.pos.y, 
            this.currentPos.x - this.pos.x, 
            this.currentPos.y - this.pos.y
        );
    }
}

