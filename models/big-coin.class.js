import { Coin } from "./coin.class.js";

export class BigCoin extends Coin {
    width = 60;
    height = 60;
    collectOnTouch = false;
    blocksMovement = true;
    
    constructor(x, y) {
        let value = 5 + Math.floor(Math.random() * 6);
        super(x, y, value);
        this.getRealFrame();
    }
}