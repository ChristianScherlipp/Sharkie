import { MovableObject } from "./movable-object.class.js";

export class Light extends MovableObject {
    y = 0;
    width = 450;
    height = 450;
    

    constructor() {
        super().loadImage('./assets/img/3.Background/Layers/1.Light/1.png');
        this.x = Math.random() * 450;
    }

    update(deltaTime) {
        this.moveLeft(deltaTime);
    }
}