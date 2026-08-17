import { Level } from "../models/level.class.js";
import { Pufferfish } from "../models/pufferfish.class.js";
import { Jellyfish } from "../models/jellyfish.class.js";
import { Finalboss } from "../models/finalboss.class.js";
import { createCoinEllipse } from "../models/coin-layout.js";
import { Light } from "../models/light.class.js";
import { BackgroundObject } from "../models/background-object.class.js";
import { BigCoin } from "../models/big-coin.class.js";
import { Poison } from "../models/poison.class.js";
import { Net } from "../models/net.class.js";

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
 * Builds the enemies for a level: alternating Pufferfish/Jellyfish spread
 * across the enemy zone in evenly sized slots, each randomized within its
 * slot so enemies don't spawn at the same fixed spot every time. Enemy
 * count and strength both scale up with the level number.
 * @param {number} levelNumber - Number of the level to build (1-based).
 * @returns {Array<Pufferfish|Jellyfish|Finalboss>} The level's enemies, including the Finalboss.
 */
function buildEnemies(levelNumber) {
    let strengthBonus = levelNumber - 1;
    let count = 12 + Math.floor((levelNumber - 1) / 2) * 2;
    let spacing = (ENEMY_ZONE_END - 500) / (count - 1);
    let enemies = [];
    for (let i = 0; i < count; i++) {
         let slotCenter = 500 + i * spacing;
        let x = slotCenter + (Math.random() - 0.5) * spacing * 0.6;
        let y = 60 + Math.random() * 280;
        enemies.push(i % 2 === 0
            ? new Pufferfish(x, y, strengthBonus)
            : new Jellyfish(x, y, strengthBonus));
    }
    enemies.push(new Finalboss(BOSS_X, 5, strengthBonus * 5));
    return enemies;
}

/**
 * Builds the collectible coins for a level: a fixed number of coin
 * ellipses spread evenly across the enemy zone, plus evenly spaced
 * BigCoins.
 * @returns {Array<Coin|BigCoin>} The level's coins.
 */
function buildCoins() {
    let clusterCount = 7;
    let coins = [];
    for (let i = 0; i < clusterCount; i++) {
        let cx = 550 + i * ((ENEMY_ZONE_END - 550) / (clusterCount - 1));
        coins.push(...createCoinEllipse(cx, 195, 160, 140, 8));
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
 * level number instead of being hand-authored per level.
 * @param {number} levelNumber - Number of the level to build (1-based).
 * @returns {Level} A fully assembled Level instance ready to hand to World.
 */
export function generateLevel(levelNumber) {
    return new Level(
        buildEnemies(levelNumber),
        buildCoins(),
        buildPoisons(),
        new Net(NET_X),
        [new Light()],
        buildBackground(),
    );
}