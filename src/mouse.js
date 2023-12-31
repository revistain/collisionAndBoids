class MouseManager extends Drawable{
    static selected = [];
    constructor() {
        super(null, 0, "rect", "black", 0, 0, true);

        if (!MouseManager.instance) MouseManager.instance = this;
        this.isDragging = false;
        this.currentPos = null;
        
        this.canvas = Canvas.instance.canvas;
        this.canvas.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.pos = this.getMousePosition(event);
            this.currentPos = this.pos;
            Drawable.drawablelist.push(this);
            for(let obj of MouseManager.selected){
                obj.color = "red";
            }
            MouseManager.selected.length = 0;
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
            const objs = this.findObjectAtBox();
            // Drag removable
            // for(let obj of objs){
            //     removeObjectFromQuadTree(obj);
            //     obj.remove();
            // }
            
            for(let obj of objs){
                obj.color = "blue";
                MouseManager.selected.push(obj);
            }
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
    findObjectAtBox() {
        const top = Math.min(this.currentPos.y, this.pos.y);
        const left = Math.min(this.currentPos.x, this.pos.x);
        const right = Math.max(this.currentPos.x, this.pos.x);
        const down = Math.max(this.currentPos.y, this.pos.y);

        return queryQuadTreeByBox(top, left, down, right);
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

function removeSelected(){
    for(let obj of MouseManager.selected){
        removeObjectFromQuadTree(obj);
        obj.remove();
    }
}

function logSelected(){
    for(let obj of MouseManager.selected){
        console.log("log:: ", obj);
    }
}