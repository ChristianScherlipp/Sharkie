export class Level {
    enemies;
    lights;
    backgroundObjects;
    coins;
    level_start_x;
    level_end_x;

    constructor(enemies, coins, lights, backgroundObjects){
        this.enemies = enemies;
        this.coins = coins;
        this.lights = lights;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(bg => bg.x));
        this.level_end_x = Math.max(...backgroundObjects.map(bg => bg.x + bg.width));
    }
}