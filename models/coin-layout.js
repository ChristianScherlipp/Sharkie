import { Coin } from "./coin.class.js";
 
/**
 * Creates a group of coins evenly spaced around the edge of an ellipse.
 * @param {number} cx - X position of the ellipse's center, in pixels.
 * @param {number} cy - Y position of the ellipse's center, in pixels.
 * @param {number} rx - Horizontal radius of the ellipse, in pixels.
 * @param {number} ry - Vertical radius of the ellipse, in pixels.
 * @param {number} count - Number of coins to place around the ellipse.
 * @param {number} [value=1] - Coin value passed through to each Coin.
 * @returns {Array<Coin>} The generated coins, ready to add to a level.
 */
export function createCoinEllipse(cx, cy, rx, ry, count, value = 1) {
    let coins = [];
    for (let i = 0; i < count; i++) {
        let angle = (i / count) * 2 * Math.PI;
        let x = cx + rx * Math.cos(angle);
        let y = cy + ry * Math.sin(angle);
        coins.push(new Coin(x, y, value));
    }
    return coins;
}