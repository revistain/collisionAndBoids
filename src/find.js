// https://stackoverflow.com/questions/41946007/efficient-and-well-explained-implementation-of-a-quadtree-for-2d-collision-det
// https://stackoverflow.com/questions/59795569/what-is-a-coarse-and-fine-grid-search
// quadtree를 구현해보자

class Rect extends Drawable{
    constructor(top=0, left=0, down=0, right=0) {
        /////////// for debug draw //////////////
        super(new Vector2(top, left), 0, "rect", null, right-left, down-top, false);
        /////////////////////////////////////////
        this.top = top;
        this.left = left;
        this.down = down;
        this.right = right; 
        this.halfwidth = (this.right - this.left) >> 1;
        this.halfheight = (this.down - this.top) >> 1;
        
        this.randomcolorA = Math.random() * 155+100;
        this.randomcolorB = Math.random() * 155+100;
        this.randomcolorC = Math.random() * 155+100;
    }
    draw() {
        this.ctx.fillStyle = `rgba(${this.randomcolorA}, ${this.randomcolorB}, ${this.randomcolorC}, 0.2)`;
        this.ctx.strokeRect(this.left, this.top, this.right-this.left, this.down-this.top);
        this.ctx.fillRect(this.left, this.top, this.right-this.left, this.down-this.top);
    }

    includeDrawable(drawable) {
        return (
            drawable.pos.x >= this.left &&
            drawable.pos.x < this.right &&
            drawable.pos.y >= this.top &&
            drawable.pos.y < this.down
        );
    }
    setRect(top, left, down, right) {
        this.top = top;
        this.left = left;
        this.down = down;
        this.right = right;
    }
    intersectsWith(target){
        if(this.left > target.right) return false;
        if(this.right < target.left) return false;
        if(this.top > target.down) return false;
        if(this.down < target.top) return false;
        return true;
    }
    intersects(top, left, down, right){
        if(this.left > right) return false;
        if(this.right < left) return false;
        if(this.top > down) return false;
        if(this.down < top) return false;
        return true;
    }
}

class QuadTree {
    static instance = null;
    constructor() {
        if(!QuadTree.instance) QuadTree.instance = this;
        this.head = new QuadNode(0, 0, Canvas.instance.pixelX, Canvas.instance.pixelY);
    }
    insert(drawable) {
        if(this.head === null) console.log("WHAT??!?!?!");
        this.head.findInsert(drawable);
    }


    _Query(top, left, down, right) {
        const found = [];
        this.head.query(top, left, down, right, found);
        return found;
    }
}

function quadTreeQuery(top, left, down, right){
    return QuadTree.instance._Query(top, left, down, right);
}

function insertToQuadTree(obj) {
    QuadTree.instance.insert(obj);
    console.log("inserted");
}

class QuadNode {
    constructor(top, left, down, right) {
        this.rect = new Rect(top, left, down, right);
        this.count = 0;
        this.capacity = 4;
        this.firstQuad      = null;
        this.secondQuad     = null;
        this.thirdQuad      = null;
        this.fourthQuad     = null;
        
        this.isLeaf = true;
        this.objects = [];
    }
    find(drawable) {
        if(!this.contains(drawable)) return null;
        
        let ret = null;
        if(!this.isLeaf){
            let result = null;
            if((result = this.firstQuad.find(drawable)) !== null) ret = result
            if((result = this.secondQuad.find(drawable)) !== null) ret = result
            if((result = this.thirdQuad.find(drawable)) !== null) ret = result
            if((result = this.fourthQuad.find(drawable)) !== null) ret = result
        }
        else if(this.isLeaf) { ret = this; }
        console.log("find: ", ret);
        return ret;
    }
    findInsert(obj){
        const leafNode = this.find(obj);
        leafNode.objects.push(obj);
        leafNode.count += 1;
        if(leafNode.count >= leafNode.capacity) {
            leafNode.subdivide();
            leafNode.count = 0;
        }
    }
    contains(drawable) {
        return this.rect.includeDrawable(drawable);
    }
    subdivide() {
        console.log("objects", this.objects);
        this.firstQuad = new QuadNode(this.rect.top, this.rect.left+this.rect.halfwidth, this.rect.down-this.rect.halfheight, this.rect.right);
        this.secondQuad = new QuadNode(this.rect.top, this.rect.left, this.rect.down-this.rect.halfheight, this.rect.right-this.rect.halfwidth);
        this.thirdQuad = new QuadNode(this.rect.top+this.rect.halfheight, this.rect.left+this.rect.halfwidth, this.rect.down, this.rect.right);
        this.fourthQuad = new QuadNode(this.rect.top+this.rect.halfheight, this.rect.left, this.rect.down, this.rect.right-this.rect.halfwidth); 
        console.log(this.firstQuad, this.secondQuad, this.thirdQuad, this.fourthQuad);
        this.isLeaf = false;

        for(let obj of this.objects){
            if(obj !== null) {
                this.findInsert(obj);
            }
        }
        this.objects.length = 0;
        
    }
    query(top, left, down, right, found_list){
        if(!this.rect.intersects(top, left, down, right)) return null;
        console.log("this.objects", this.objects);
        
        
        if(!this.isLeaf){
            console.log(this);
            this.firstQuad.query(top, left, down, right, found_list);
            this.secondQuad.query(top, left, down, right, found_list);
            this.thirdQuad.query(top, left, down, right, found_list);
            this.fourthQuad.query(top, left, down, right, found_list);
        }
        else{
            for(let obj of this.objects){
                if(obj.pos.x >= left && obj.pos.x < right && obj.pos.y >= top && obj.pos.y < down) found_list.push(obj);
            }
        }
        return found_list;
    }
}