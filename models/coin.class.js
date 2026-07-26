import { MovableObject } from "./movable-object.class.js";

export class Coin extends MovableObject {
    showFrame = true;
    x;
    y;
    width = 30;
    height = 30;

    offset = {
        top : 5,
        left : 5,
        right : 5,
        bottom : 5
    };
    value = 1;

    IMAGES_COIN = [
        './assets/img/4.Marcadores/1.Coins/1.png',
        './assets/img/4.Marcadores/1.Coins/2.png',
        './assets/img/4.Marcadores/1.Coins/3.png',
        './assets/img/4.Marcadores/1.Coins/4.png',
    ];

    constructor(x, y, value = 1) {
        super();
        this.loadImage(this.IMAGES_COIN[0]);
        this.loadImages(this.IMAGES_COIN);
        this.x = x;
        this.y = y
        this.value = value;
        this.getRealFrame();
    }

    update(deltaTime){
        this.animateImages(this.IMAGES_COIN, deltaTime, 255)
    }
}