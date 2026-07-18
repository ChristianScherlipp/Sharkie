class FiringObject extends MovableObject {

    constructor(x, y) {
        super().loadImage('./assets/img/1.Sharkie/4.Attack/Bubble_trap/Bubble.png');
        this.x = x;
        this.y = y;
        this.height = 50;
        this.width = 50;
        this.firing(); 
    }


    firing(){
        this.stpeedY = 30;
        this.applyAntiGravity();
        setInterval(() => {
            this.x += 3;
        }, 50)
    }
}