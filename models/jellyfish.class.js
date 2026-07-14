class Jellyfish extends MovableObject {


    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.x = 150 + (Math.random() * 500);
        this.y = Math.random() * 450;
    }

}