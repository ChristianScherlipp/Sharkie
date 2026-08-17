import { Level } from "../models/core/level.class.js";
import { Pufferfish } from "../models/enemies/pufferfish.class.js";
import { Jellyfish } from "../models/enemies/jellyfish.class.js";
import { Finalboss } from "../models/enemies/finalboss.class.js";
import { createCoinEllipse, createCoinLineHorizontal, createCoinLineVertical, createCoinLineDiagonal } from "../models/items/coin-layout.js";
import { Light } from "../models/items/light.class.js";
import { BackgroundObject } from "../models/items/background-object.class.js";
import { BigCoin } from "../models/items/big-coin.class.js";
import { Poison } from "../models/items/poison.class.js";
import { Net } from "../models/items/net.class.js";

/**
 * Total number of levels in the game. Raise this to add more levels -
 * generateLevel() builds every level procedurally, so no per-level file
 * needs to be created or edited by hand.
 */
export const TOTAL_LEVELS = 10;

const TILE_WIDTH = 720;
const TILE_COUNT = 10;
const NET_X = TILE_COUNT * TILE_WIDTH - 1450;
const BOSS_X = TILE_COUNT * TILE_WIDTH - 300;
const ENEMY_ZONE_END = NET_X - 300;

/**
 * Checks whether a rectangle at the given position overlaps a coin,
 * including some extra clearance. Blocking coins (BigCoins) get much more
 * clearance than regular coins, since an enemy patrolling right next to a
 * BigCoin would otherwise immediately bounce off it and back again.
 * @param {number} x - X position to check, in pixels.
 * @param {number} y - Y position to check, in pixels.
 * @param {number} width - Width of the rectangle to check, in pixels.
 * @param {number} height - Height of the rectangle to check, in pixels.
 * @param {Coin|BigCoin} coin - The coin to check against.
 * @returns {boolean} True if the rectangle (plus clearance) overlaps the coin.
 */
function overlapsCoin(x, y, width, height, coin) {
    let padding = coin.blocksMovement ? 120 : 40;
    return x < coin.x + coin.width + padding &&
        x + width + padding > coin.x &&
        y < coin.y + coin.height + padding &&
        y + height + padding > coin.y;
}

/**
 * Finds a spawn position within a slot that doesn't overlap any coin,
 * retrying with a new random position a few times before giving up. The
 * search range widens every few failed attempts, so an enemy that
 * happens to land right on top of a coin cluster can still escape it
 * instead of only jittering within its original narrow slot.
 * @param {number} slotCenter - Center X of the slot to spawn within, in pixels.
 * @param {number} slotWidth - Width of the slot, used to jitter X within it.
 * @param {number} width - Width of the enemy to place, in pixels.
 * @param {number} height - Height of the enemy to place, in pixels.
 * @param {Array<Coin|BigCoin>} coins - Coins to avoid overlapping.
 * @returns {{x: number, y: number}} A spawn position, ideally clear of every coin.
 */
function findClearSpawn(slotCenter, slotWidth, width, height, coins) {
    let x, y;
    for (let attempt = 0; attempt < 40; attempt++) {
        let widen = 1 + Math.floor(attempt / 8);
        x = slotCenter + (Math.random() - 0.5) * slotWidth * 0.6 * widen;
        y = 60 + Math.random() * 280;
        if (!coins.some(coin => overlapsCoin(x, y, width, height, coin))) {
            return { x, y };
        }
    }
    return { x, y };
}


/**
 * Builds the enemies for a level: alternating Pufferfish/Jellyfish spread
 * across the enemy zone in evenly sized slots, each randomized within its
 * slot (and kept clear of every coin) so enemies don't spawn at the same
 * fixed spot every time or inside a coin. Enemy count and strength both
 * scale up with the level number. All Pufferfish in a level share one
 * color, all Jellyfish share one skin - both picked from the level
 * number, cycling through the available variants.
 * @param {number} levelNumber - Number of the level to build (1-based).
 * @param {Array<Coin|BigCoin>} coins - The level's coins, so enemies can avoid spawning inside them.
 * @returns {Array<Pufferfish|Jellyfish|Finalboss>} The level's enemies, including the Finalboss.
 */
function buildEnemies(levelNumber, coins) {
    let strengthBonus = levelNumber - 1;
    let count = 12 + Math.floor((levelNumber - 1) / 2) * 2;
    let spacing = (ENEMY_ZONE_END - 500) / (count - 1);
    let pufferfishColor = Pufferfish.COLOR_VARIANTS[(levelNumber - 1) % Pufferfish.COLOR_VARIANTS.length];
    let jellyfishSkin = (levelNumber - 1) % Jellyfish.SKINS.length;
    let enemies = [];
    for (let i = 0; i < count; i++) {
         let slotCenter = 500 + i * spacing;
        let isPufferfish = i % 2 === 0;
        let size = isPufferfish ? { width: 140, height: 110 } : { width: 70, height: 120 };
        let pos = findClearSpawn(slotCenter, spacing, size.width, size.height, coins);
        enemies.push(isPufferfish
            ? new Pufferfish(pos.x, pos.y, strengthBonus, pufferfishColor)
            : new Jellyfish(pos.x, pos.y, strengthBonus, jellyfishSkin));
    }
    enemies.push(new Finalboss(BOSS_X, 5, strengthBonus * 5));
    return enemies;
}

/**
 * Builds the collectible coins for a level: coin clusters spread evenly
 * across the enemy zone, cycling through several layout patterns (ellipse,
 * horizontal line, vertical line, diagonal line) instead of always the
 * same shape, plus evenly spaced BigCoins.
 * @returns {Array<Coin|BigCoin>} The level's coins.
 */
function buildCoins() {
    let clusterCount = 7;
    let coins = [];
    for (let i = 0; i < clusterCount; i++) {
        let cx = 550 + i * ((ENEMY_ZONE_END - 550) / (clusterCount - 1));
        switch (i % 4) {
            case 0:
                coins.push(...createCoinEllipse(cx, 195, 160, 140, 8));
                break;
            case 1:
                coins.push(...createCoinLineHorizontal(cx, 195, 320, 8));
                break;
            case 2:
                coins.push(...createCoinLineVertical(cx, 195, 260, 8));
                break;
            default:
                coins.push(...createCoinLineDiagonal(cx, 195, 300, 8, i % 8 < 4));
                break;
        }
    }

    let bigCoinYCycle = [80, 150, 220, 290, 360];
    let bigCoinCount = 12;
    for (let i = 0; i < bigCoinCount; i++) {
        let x = 300 + i * ((ENEMY_ZONE_END - 300) / (bigCoinCount - 1));
        coins.push(new BigCoin(x, bigCoinYCycle[i % bigCoinYCycle.length]));
    }
    return coins;
}

/**
 * Builds the collectible poison bottles for a level, evenly spaced across
 * the enemy zone.
 * @returns {Array<Poison>} The level's poisons.
 */
function buildPoisons() {
    let yCycle = [100, 180, 260, 340];
    let count = 10;
    let poisons = [];
    for (let i = 0; i < count; i++) {
        let x = 350 + i * ((ENEMY_ZONE_END - 350) / (count - 1));
        poisons.push(new Poison(x, yCycle[i % yCycle.length]));
    }
    return poisons;
}

/**
 * Builds the scrolling background layers for a level: TILE_COUNT tiles,
 * each made up of the water/back/front/floor layers, alternating between
 * the two provided variants (D1/D2) so neighboring tiles don't repeat
 * identically.
 * @returns {Array<BackgroundObject>} The level's background layers.
 */
function buildBackground() {
    let layers = [
        '5.Water',
        '4.Fondo2',
        '3.Fondo1',
        '2.Floor',
    ];
    let objects = [];
    for (let tile = 0; tile < TILE_COUNT; tile++) {
        let variant = tile % 2 === 0 ? 'D1' : 'D2';
        for (let layer of layers) {
            objects.push(new BackgroundObject(`./assets/img/3.Background/Layers/${layer}/${variant}.png`, tile * TILE_WIDTH));
        }
    }
    return objects;
}

/**
 * Procedurally builds a complete level: enemies, coins, poisons, the net
 * obstacle, lights and the scrolling background - all generated from the
 * level number instead of being hand-authored per level. Coins are built
 * first so enemy placement can avoid spawning inside them.
 * @param {number} levelNumber - Number of the level to build (1-based).
 * @returns {Level} A fully assembled Level instance ready to hand to World.
 */
export function generateLevel(levelNumber) {
    let coins = buildCoins();
    return new Level(
        buildEnemies(levelNumber, coins),
        coins,
        buildPoisons(),
        new Net(NET_X),
        [new Light()],
        buildBackground(),
    );
}
