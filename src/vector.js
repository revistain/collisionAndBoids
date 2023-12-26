class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    assign(v){
        this.x = v.x;
        this.y = v.y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mul(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    div(vec){
        return new Vector2(this.x / vec, this.y / vec);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    limit(maxMagnitude) {
        const currentMagnitude = this.magnitude();
        if (currentMagnitude > maxMagnitude) {
            this.setMagnitude(maxMagnitude);
        }
        return this;
    }
    setMagnitude(magnitude) {
        const normalized = this.normalize();
        this.x = normalized.x * magnitude;
        this.y = normalized.y * magnitude;
        return this;
    }
    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? new Vector2(this.x / mag, this.y / mag) : new Vector2();
    }
}
