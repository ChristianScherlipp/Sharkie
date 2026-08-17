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

/**
* Creates a group of coins evenly spaced along a straight line.
 * @param {number} cx - X position of the line's center, in pixels.
 * @param {number} cy - Y position of the line's center, in pixels.
 * @param {number} angleDegrees - Direction of the line in degrees (0 = horizontal, 90 = vertical).
 * @param {number} length - Total length of the line, in pixels.
 * @param {number} count - Number of coins to place along the line.
 * @param {number} [value=1] - Coin value passed through to each Coin.
 * @returns {Array<Coin>} The generated coins, ready to add to a level.
 */
export function createCoinLine(cx, cy, angleDegrees, length, count, value = 1) {
    let angle = angleDegrees * (Math.PI / 180);
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);
    let coins = [];
    for (let i = 0; i < count; i++) {
        let t = count === 1 ? 0 : (i / (count - 1)) - 0.5;
        let x = cx + dx * length * t;
        let y = cy + dy * length * t;
        coins.push(new Coin(x, y, value));
    }
    return coins;
}

/**
 * Creates a group of coins evenly spaced along a horizontal line.
 * @param {number} cx - X position of the line's center, in pixels.
 * @param {number} cy - Y position of the line, in pixels.
 * @param {number} length - Total length of the line, in pixels.
 * @param {number} count - Number of coins to place along the line.
 * @param {number} [value=1] - Coin value passed through to each Coin.
 * @returns {Array<Coin>} The generated coins, ready to add to a level.
 */
export function createCoinLineHorizontal(cx, cy, length, count, value = 1) {
    return createCoinLine(cx, cy, 0, length, count, value);
}

/**
 * Creates a group of coins evenly spaced along a vertical line.
 * @param {number} cx - X position of the line, in pixels.
 * @param {number} cy - Y position of the line's center, in pixels.
 * @param {number} length - Total length of the line, in pixels.
 * @param {number} count - Number of coins to place along the line.
 * @param {number} [value=1] - Coin value passed through to each Coin.
 * @returns {Array<Coin>} The generated coins, ready to add to a level.
 */
export function createCoinLineVertical(cx, cy, length, count, value = 1) {
    return createCoinLine(cx, cy, 90, length, count, value);
}

/**
 * Creates a group of coins evenly spaced along a diagonal line.
 * @param {number} cx - X position of the line's center, in pixels.
 * @param {number} cy - Y position of the line's center, in pixels.
 * @param {number} length - Total length of the line, in pixels.
 * @param {number} count - Number of coins to place along the line.
 * @param {boolean} [risingLeftToRight=true] - True for a line rising from bottom-left to top-right, false for the opposite diagonal.
 * @param {number} [value=1] - Coin value passed through to each Coin.
 * @returns {Array<Coin>} The generated coins, ready to add to a level.
 */
export function createCoinLineDiagonal(cx, cy, length, count, risingLeftToRight = true, value = 1) {
    return createCoinLine(cx, cy, risingLeftToRight ? -45 : 45, length, count, value);
}
