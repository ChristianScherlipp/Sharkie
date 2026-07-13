class Light extends MovableObject {

    constructor() {
        super().loadImage('../assets/img/3.Background/Layers/1.Light/1.png');
        this.x = (Math.random() * 500);
        this.y = 0;
        this.width = 450;
        this.height = 450;
    }
}