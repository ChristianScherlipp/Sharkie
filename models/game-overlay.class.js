export class GameOverlay {
    /**
     * Create a new GameOverlay instance.
     * @param {Object} elements - DOM elements used by the overlay.
     * @param {Object} handlers - Callback function for the overlay buttons.
     */
    constructor(elements, handlers) {
        this.overlay = elements.overlay;
        this.banner = elements.banner;
        this.buttons = elements.buttons;
        this.tryAgainBtn = elements.tryAgainBtn;
        this.backMenuBtn = elements.backMenuBtn;

        this.tryAgainBtn.addEventListener('click', () => handlers.onTryAgain());
        this.backMenuBtn.addEventListener('click', () => handlers.onBackToMenu());
    }

    /**
     * Reset reset.
     */
    reset() {
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('show-banner', 'show-buttons');
        this.banner.classList.remove('fullcover');
        this.banner.src = '';
    }

    /**
     * Shows game over.
     */
    showGameOver() {
        this.play('./assets/img/6.Botones/Tittles/Game_Over/4.png', false, true);
    }

    /**
     * Shows win banner.
     */
    showWinBanner() {
        this.play('./assets/img/6.Botones/Tittles/You_win/4.png', false, false);
    }

    /**
     * Shows win final.
     */
    showWinFinal() {
        this.play('./assets/img/6.Botones/Tittles/You_win/1.png', true, true);
    }

    /**
     * Plays play.
     * @param {string} bannerSrc - Path to the banner image to display.
     * @param {boolean} fullcover - Whether the banner should cover the full screen.
     * @param {boolean} withButtons - Whether the try-again/back-to-menu buttons should be shown.
     */
    play(bannerSrc, fullcover, withButtons) {
        this.overlay.classList.remove('hidden');
        this.banner.src = bannerSrc;
        this.banner.classList.toggle('fullcover', fullcover);
        this.animateBannerIn();
        if (withButtons) this.scheduleButtonsIn();
    }

    /**
     * Animates banner in.
     */
    animateBannerIn(){
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('show-banner');
            });
        });
    }

    /**
     * Animates buttons in.
     */
    scheduleButtonsIn(){
        setTimeout(() => {
            this.overlay.classList.add('show-buttons');
        }, 700);
    }
}
