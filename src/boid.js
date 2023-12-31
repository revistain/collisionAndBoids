class Boid extends Movable{
    constructor(pos, align=0.001, cohesion=0.001, separation=0.05) {
        const initSpeed = new Vector2(getRandomFloat(0.2, -0.1), getRandomFloat(0.2, -0.1));
        super(pos, 6, "circle", "red", initSpeed, 4, new Vector2(0, 0));
        this.neighbors = null;
        this.congnitive_distance = 50;

        this.align_const = align;
        this.cohesion_const = cohesion;
        this.separation_const = separation;
    }

    getNeighbors(){
        this.neighbors = quadTreeQuery(this.pos.y-this.congnitive_distance,
                                       this.pos.x-this.congnitive_distance,
                                       this.pos.y+this.congnitive_distance,
                                       this.pos.x+this.congnitive_distance);
    }
    draw(){
        // 방향선 그리기
        const line_const = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.pos.x, this.pos.y);
        this.ctx.lineTo(line_const*this.currentSpeed.x+this.pos.x, line_const*this.currentSpeed.y+this.pos.y);     // (200, 200)까지 선을 그림
        this.ctx.strokeStyle = 'blue';
        this.ctx.stroke();
        
        super.draw();
    }

    move(){
        this.getNeighbors();
        let align_force = new Vector2(0, 0);
        let cohesion_force = new Vector2(0, 0);
        const orderstate = this.orderState;
            for(let near of this.neighbors){
            if(near == this) continue;
            if(orderstate == orderType["all_move"]){
                // alignment
                align_force.add(near.currentSpeed);

                // cohesion
                cohesion_force.add(near.pos);
                cohesion_force.sub(this.pos);
            }
            // separation(정석,slow)
            if(orderstate != orderType["stop"]){
                const dist = Math.sqrt((near.pos.x-this.pos.x)*(near.pos.x-this.pos.x) + (near.pos.y-this.pos.y)*(near.pos.y-this.pos.y));
                if(dist != 0){
                    let separation_force = new Vector2(0, 0);
                    separation_force.add(this.pos);
                    separation_force.sub(near.pos);
                    separation_force.mul_var((near.separation_const+this.separation_const)/dist);
                    this.applyForce(separation_force)
                }
            }
        }
        
        if(orderstate == orderType["all_move"]){
            // alignment
            align_force.div_var(this.neighbors.length);
            this.applyForce(align_force.mul_var(this.align_const));

            // cohesion
            cohesion_force.div_var(this.neighbors.length);
            this.applyForce(cohesion_force.mul_var(this.cohesion_const));
        }
        super.move();
    }
}

class CircleBoid extends Boid{
    static align = 0.001;
    static cohesion = 0.001;
    static separation = 0.05;
    constructor(pos) {
        super(pos, CircleBoid.align, CircleBoid.cohesion, CircleBoid.separation);
    }

    move(){
        this.align_const = CircleBoid.align;
        this.cohesion_const = CircleBoid.cohesion;
        this.separation_const = CircleBoid.separation;
        
        super.move();
    }
}