export class Level {
    enemies;
    lights;
    backgroundObjects;
    coins;
    poisons;
    net;
    level_start_x;
    level_end_x;

    /**
 * Creates a new Level instance and derives the level's horizontal
 * boundaries from the background objects.
 * @param {Array<Jellyfish|Pufferfish|Finalboss>} enemies - All enemies placed in this level, including the final boss.
 * @param {Array<Coin|BigCoin>} coins - Collectible coins placed in this level.
 * @param {Array<Poison>} poisons - Collectible poison bottles placed in this level.
 * @param {Net} net - The net obstacle that triggers the boss intro.
 * @param {Array<Light>} lights - Background light/decoration objects.
 * @param {Array<BackgroundObject>} backgroundObjects - Scrolling background layers; used to compute level_start_x/level_end_x.
 */
    constructor(enemies, coins, poisons, net, lights, backgroundObjects){
        this.enemies = enemies;
        this.coins = coins;
        this.poisons = poisons;
        this.net = net;
        this.lights = lights;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(bg => bg.x));
        this.level_end_x = Math.max(...backgroundObjects.map(bg => bg.x + bg.width));
    }
}