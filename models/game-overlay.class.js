export class GameOverlay {
    constructor(elements, handlers) {
        this.overlay = elements.overlay;
        this.banner = elements.banner;
        this.buttons = elements.buttons;
        this.tryAgainBtn = elements.tryAgainBtn;
        this.backMenuBtn = elements.backMenuBtn;

        this.tryAgainBtn.addEventListener('click', () => handlers.onTryAgain());
        this.backMenuBtn.addEventListener('click', () => handlers.onBackToMenu());
    }

    reset() {
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('show-banner', 'show-buttons');
        this.banner.classList.remove('fullcover');
        this.banner.src = '';
    }

    showGameOver() {
        this.play('./assets/img/6.Botones/Tittles/Game_Over/4.png', false, true);
    }

    showWinBanner() {
        this.play('./assets/img/6.Botones/Tittles/You_win/4.png', false, false);
    }

    showWinFinal() {
        this.play('./assets/img/6.Botones/Tittles/You_win/1.png', true, true);
    }

    play(bannerSrc, fullcover, withButtons) {
        this.overlay.classList.remove('hidden');
        this.banner.src = bannerSrc;
        this.banner.classList.toggle('fullcover', fullcover);
        this.animateBannerIn();
        if (withButtons) this.scheduleButtonsIn();
    }

    animateBannerIn(){
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('show-banner');
            });
        });
    }

    scheduleButtonsIn(){
        setTimeout(() => {
            this.overlay.classList.add('show-buttons');
        }, 700);
    }
}
