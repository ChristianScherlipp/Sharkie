import { Keyboard } from '../models/keyboard.class.js';
import { World } from "../models/world.class.js";
import { GameOverlay } from "../models/game-overlay.class.js"
import { AudioHub } from '../models/audio-hub.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let currentLevel = 1;

let overlay = new GameOverlay(
    {
        overlay: document.getElementById('overlay'),
        banner: document.getElementById('overlay-banner'),
        buttons: document.getElementById('overlay-buttons'),
        tryAgainBtn: document.getElementById('btn-try-again'),
        backMenuBtn: document.getElementById('btn-back-menu'),
    },
    {
        onTryAgain: () => restartGame(),
        onBackToMenu: () => backToMenu(),
    }
);

function init() {
    canvas = document.getElementById('canvas');
    overlay.reset();
    resetKeyboard();
    
    world = new World(canvas, keyboard, buildWorldCallbacks(), currentLevel);

    console.log('My Character is', world.character);
    
}

function buildWorldCallbacks() {
    return{
        onGameOver: handleGameOver,
        onWinBanner: handleWinBanner,
        onWinFinal: handleWinFinal,
        onLevelComplete: handleLevelComplete,
    };
}

// Sharkie ist gestorben: Game- Over-Screen zeigen, alle laufenden Sounds
// (Musik, Bewegung, etc) stoppen und den Game-Over-Sound abspielen.
function handleGameOver() {
    overlay.showGameOver();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_OVER);
}

// Level gewonnen (nicht das letzte Level).
function handleWinBanner() {
    overlay.showWinBanner();
    AudioHub.playOne(AudioHub.LEVEL_SUCCESS);
}

// Komplettes Spiel gewonnen (Letztes Level).
function handleWinFinal() {
    overlay.showWinFinal();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_WIN);
}

// Sharkie ist nach dem Levelsieg komplett aus dem Bild rausgeschwommen -
// jetzt wird tatsächlich das nächste Level gestartet (kein Game-Over/Sieg-
// Overlay nötig, der Banner hat den Sieg schon gezeigt).
function handleLevelComplete() {
    currentLevel++;
    init();
}

// Startet das Spiel neu, ohne die komplette Seite neu zu laden - erzeugt
// einfach eine frische World (inkl. frischem Level dank createLevel1()).
function restartGame() {
    init();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.MUSIC);
}

// Für "Back to Menu" gibt es aktuell noch keine eigene Menü-Ansicht im
// Projekt - die Seite selbst ist momentan der Einstiegspunkt, deshalb landet
// man hier vorerst wieder ganz am Anfang. Sobald es eine echte Menü-Seite
// gibt, kann hier stattdessen z.B. dorthin navigiert werden.
function backToMenu() {
    location.reload();
}

function resetKeyboard() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.E = false;
    keyboard.Q = false;
}

function startGame() {

    const startScreen = document.getElementById("start-screen");

    startScreen.classList.add("fade-out");

    setTimeout(() => {

        startScreen.style.display = "none";

        document.getElementById("canvas").style.display = "block";

        AudioHub.playIfNotRunning(AudioHub.MUSIC);

        init();

    }, 800);

}

// Blendet genau einen der drei Popup-Inhalte ein und die anderen beiden
// aus - openControls/openCredits/openMusicSettings nutzen das gemeinsam,
// statt jeweils eine eigene, fast identische Funktion zu haben.
function showPopupSection(sectionId) {
    ["popup-controls", "popup-credits", "popup-music"].forEach((id) => {
        document.getElementById(id).classList.toggle("hidden", id !== sectionId);
    });
    document.getElementById("popup").classList.remove("hidden");
}

function openControls() {
    showPopupSection("popup-controls")
}

function openCredits() {
    showPopupSection("popup-credits")
}

function openMusicSettings() {
    showPopupSection("popup-music");
}

function handleMusicToggle() {
    let isPlaying = AudioHub.toggleMusic();
    document.getElementById('music-toggle-btn').textContent = isPlaying ? '🔇 Musik AUS' : '🔊 Musik AN';
}

function closePopup(){

    document
        .getElementById("popup")
        .classList.add("hidden");

}

window.addEventListener('keydown', (e) => {
    if(e.key.toLocaleLowerCase() == 'd' || e.key == 'ArrowRight') {
        keyboard.RIGHT = true;
    }
    if(e.key.toLocaleLowerCase() == 'a' || e.key == 'ArrowLeft') {
        keyboard.LEFT = true;
    }
    if(e.key.toLocaleLowerCase() == 'w' || e.key == 'ArrowUp') {
        keyboard.UP = true;
    }
    if(e.key.toLocaleLowerCase() == 's' || e.key == 'ArrowDown') {
        keyboard.DOWN = true;
    }
    if(e.key == ' ') {
        keyboard.SPACE = true;        
    }
    if (e.key.toLocaleLowerCase() == 'e') {
        keyboard.E = true;
    }
    if (e.key.toLocaleLowerCase() == 'q') {
        keyboard.Q = true;
    }
    
});

window.addEventListener('keyup', (e) => {
    if(e.key.toLocaleLowerCase() == 'd' || e.key == 'ArrowRight') {
        keyboard.RIGHT = false;
    }
    if(e.key.toLocaleLowerCase() == 'a' || e.key == 'ArrowLeft') {
        keyboard.LEFT = false;
    }
    if(e.key.toLocaleLowerCase() == 'w' || e.key == 'ArrowUp') {
        keyboard.UP = false;
    }
    if(e.key.toLocaleLowerCase() == 's' || e.key == 'ArrowDown') {
        keyboard.DOWN = false;
    }
    if(e.key == ' ') {
        keyboard.SPACE = false;
    }
    if (e.key.toLocaleLowerCase() == 'e') {
        keyboard.E = false;
    }
    if (e.key.toLocaleLowerCase() == 'q') {
        keyboard.Q = false;
    }
});

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("start-btn")
        .addEventListener("click", startGame);

    document
        .getElementById("controls-btn")
        .addEventListener("click", openControls);

    document
        .getElementById("credits-btn")
        .addEventListener("click", openCredits);

        document
        .getElementById("music-btn")
        .addEventListener("click", openMusicSettings);

    document
        .getElementById("music-toggle-btn")
        .addEventListener("click", handleMusicToggle);

    document
        .getElementById("volume-master")
        .addEventListener("input", (e) => AudioHub.setMasterVolume(e.target.value));

    document
        .getElementById("volume-music")
        .addEventListener("input", (e) => AudioHub.setMusicVolume(e.target.value));

    document
        .getElementById("volume-sfx")
        .addEventListener("input", (e) => AudioHub.setSfxVolume(e.target.value));

    AudioHub.applyVolumes();

    document
        .getElementById("close-popup")
        .addEventListener("click", closePopup);

});