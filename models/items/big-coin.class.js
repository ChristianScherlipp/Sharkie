import { Coin } from "./coin.class.js";

export class BigCoin extends Coin {
    width = 60;
    height = 60;
    collectOnTouch = false;
    blocksMovement = true;
    
    /**
     * Creates a new BigCoin instance.
     * @param {number} x - X position in pixels.
     * @param {number} y - Y position in pixels.
     */
    constructor(x, y) {
        let value = 5 + Math.floor(Math.random() * 6);
        super(x, y, value);
        this.getRealFrame();
    }
}