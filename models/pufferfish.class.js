class Pufferfish extends MovableObject {

    constructor(){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.x = 300;
        this.y = Math.random() * 450;
    }
}