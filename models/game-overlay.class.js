// Steuert das HTML-Overlay über dem Canvas für Game Over und Levelsieg.
// Bewusst als eigenes DOM-Element statt in den Canvas gezeichnet, damit die
// beiden Buttons ganz normale, klickbare <button>-Elemente sein können.
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
 
    // Setzt das Overlay komplett zurück (wird bei jedem (Neu-)Start aufgerufen)
    reset() {
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('show-banner', 'show-buttons');
        this.banner.classList.remove('fullcover');
        this.banner.src = '';
    }
 
    // Game Over: Banner fährt von oben rein, danach fahren die zwei
    // Buttons von unten rein.
    showGameOver() {
        this.play('./assets/img/6.Botones/Tittles/Game_Over/4.png', false, true);
    }
 
    // Levelsieg, aber NICHT das letzte Level: nur das Banner fährt von oben
    // rein, keine Buttons (Sharkie schwimmt in der Zwischenzeit selbstständig
    // aus dem Canvas, siehe Character.autoSwimRight).
    showWinBanner() {
        this.play('./assets/img/6.Botones/Tittles/You_win/4.png', false, false);
    }
 
    // Levelsieg im letzten Level: Bild deckt das komplette Canvas ab,
    // danach die gleichen zwei Buttons wie bei Game Over.
    showWinFinal() {
        this.play('./assets/img/6.Botones/Tittles/You_win/1.png', true, true);
    }
 
    play(bannerSrc, fullcover, withButtons) {
        this.overlay.classList.remove('hidden');
        this.banner.src = bannerSrc;
        this.banner.classList.toggle('fullcover', fullcover);
 
        // Ein Frame warten, damit der Browser die Startposition (transform)
        // erst rendert, bevor die "show"-Klasse die CSS-Transition auslöst -
        // sonst springt das Bild ohne Animation direkt an seine Endposition.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('show-banner');
            });
        });
 
        if (withButtons) {
            setTimeout(() => {
                this.overlay.classList.add('show-buttons');
            }, 700);
        }
    }
}