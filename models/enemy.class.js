class Pufferfish extends MovableObject {

    constructor(){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.x = 300;
        this.y = Math.random() * 450;
        this.width = 140;
        this.height = 110;
    }
}

class Jellyfish extends MovableObject {


    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.x = 190 + (Math.random() * 500);
        this.y = Math.random() * 450;
        this.width = 120;
        this.height = 180;
    }

}

class Finalboss extends MovableObject {


    constructor (){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.x = 500;
        this.y = Math.random() * 450;
        this.width = 250;
        this.height = 220;
    }
}