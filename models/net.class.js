import { MovableObject } from "./movable-object.class.js";

export class Net extends MovableObject {
    x;
    y = 0;
    width = 75;
    height = 480;
    blocksMovement = false;

    NET_IMAGES_UNROLL = [
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_01.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_02.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_03.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_04.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_05.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_06.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_07.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_08.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_09.png',
        './assets/img/3.Background/Barrier/Net_unroll/net_unroll_10.png',
    ];

    NET_IMAGES_LOOP = [
        './assets/img/3.Background/Barrier/Net_Frame/net_frame1.png',
        './assets/img/3.Background/Barrier/Net_Frame/net_frame2.png',
        './assets/img/3.Background/Barrier/Net_Frame/net_frame3.png',
        './assets/img/3.Background/Barrier/Net_Frame/net_frame4.png',
    ];

    isUnrolling = false;
    unrollDone = false;
    unrollFrame = 0;
    unrollTimer = 0;
    unrollFrameDuration = 100;

    constructor(x) {
        super().loadImage('./assets/img/3.Background/Barrier/Net_unroll/net_unroll_01.png');
        this.loadImages(this.NET_IMAGES_UNROLL);
        this.loadImages(this.NET_IMAGES_LOOP);
        this.x = x;
        this.getRealFrame();
    }

    startUnrolling() {
        this.blocksMovement = true;
        this.isUnrolling = true;
        this.unrollFrame = 0;
        this.unrollTimer = 0;
        this.img = this.imageCache[this.NET_IMAGES_UNROLL[this.unrollFrame]];
    }

    update(deltaTime){
        if (this.isUnrolling) {
            this.updateUnrolling(deltaTime);
            return;
        }
        if (this.unrollDone) {
            this.animateImages(this.NET_IMAGES_LOOP, deltaTime, 200);
        }
    }

    updateUnrolling(deltaTime) {
        this.unrollTimer += deltaTime;
        if (this.unrollTimer <= this.unrollFrameDuration) return;
        this.unrollTimer = 0;
        this.unrollFrame++;
        if (this.unrollFrame >= this.NET_IMAGES_UNROLL.length) {
            this.isUnrolling = false;
            this.unrollDone = true;
        } else {
            this.img = this.imageCache[this.NET_IMAGES_UNROLL[this.unrollFrame]]
        }
    }
}