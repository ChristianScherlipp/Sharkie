export class Level {
    enemies;
    lights;
    backgroundObjects;
    coins;
    poisons;
    level_start_x;
    level_end_x;

    constructor(enemies, coins, poisons, lights, backgroundObjects){
        this.enemies = enemies;
        this.coins = coins;
        this.poisons = poisons;
        this.lights = lights;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(bg => bg.x));
        this.level_end_x = Math.max(...backgroundObjects.map(bg => bg.x + bg.width));
    }
}