import { Keyboard } from '../models/keyboard.class.js';
import { World } from "../models/world.class.js";
import { GameOverlay } from "../models/game-overlay.class.js"
import { AudioHub } from '../models/audio-hub.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let currentLevel = 1;

let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickRadius = 0;

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
    resetPauseMenu();
    resetKeyboard();
    
    world = new World(canvas, keyboard, buildWorldCallbacks(), currentLevel);

    console.log('My Character is', world.character);
    
}

// Erzwingt den geschlossenen Zustand des Pausenmenüs - unabhängig davon,
// ob/wie es vorher offen war. Wird sowohl beim allerersten Laden der Seite
// als auch bei jedem Spielstart/-neustart aufgerufen.
function resetPauseMenu() {
    document.getElementById("pause-menu").classList.add("hidden");
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
    setTimeout(showGameAfterFadeOut, 800);
}

// Läuft, nachdem die Fade-Out-Animation des Startbildschirms fertig ist:
// Startbildschirm weg, Canvas + Game-Controls sichtbar, Musik an, level laden.
function showGameAfterFadeOut() {
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('canvas').style.display = "block";
    document.getElementById('game-controls').classList.remove("hidden");
    document.getElementById('touch-controls').classList.remove("hidden");
    AudioHub.playIfNotRunning(AudioHub.MUSIC);
    init();
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

// Erkennt Touch-Geräte genauso wie das CSS in style-mobile.css
// (@media (hover: none)).
function isTouchDevice() {
    return window.matchMedia("(hover: none)").matches;
}

// Zeigt je nach Gerät die Tastatur- oder die Touch-Belegung im
// Steuerung-Popup an, die jeweils andere bleibt versteckt.
function updateControlsPopupForDevice() {
    let touch = isTouchDevice();
    document.getElementById("controls-keyboard").classList.toggle("hidden", touch);
    document.getElementById("controls-touch").classList.toggle("hidden", !touch);
}

function openControls() {
    showPopupSection("popup-controls");
    updateControlsPopupForDevice();
}

function openCredits() {
    showPopupSection("popup-credits")
}

function openMusicSettings() {
    showPopupSection("popup-music");
}

// Schaltet die Hintergrundmusik um und hält Popup-Button-Text und
// Mute-Icon synchron (beide Buttons rufen diese Funktion auf).
function handleMusicToggle() {
    let isPlaying = AudioHub.toggleMusic();
    updateMusicUI(isPlaying);
}

function updateMusicUI(isPlaying){
    document.getElementById('music-toggle-btn').innerHTML = isPlaying 
    ? '<img class="btn-icon" src="./assets/icons/Volume-Level-High--Streamline-Core.svg" alt="Volume Icon"> Musik AN'
    : '<img class="btn-icon" src="./assets/icons/Volume-Off--Streamline-Core.svg" alt="Volume Icon"> Musik AUS'; 
    document.getElementById('mute-icon').src = isPlaying
        ? './assets/icons/Volume-Level-High--Streamline-Core.svg'
        : './assets/icons/Volume-Mute--Streamline-Core.svg';
}

function closePopup(){
    document.getElementById("popup").classList.add("hidden");
}

// Öffnet/schließt das Pausenmenü - nur relevant, solange eine Runde läuft
// (kein Sinn vor dem Start oder nach Game Over/Sieg).
function togglePauseMenu() {
    if (!world || world.gameEnded) return;
    let isOpen = !document.getElementById('pause-menu').classList.contains("hidden");
    isOpen ? closePauseMenu() : openPauseMenu();
}

function openPauseMenu() {
    document.getElementById("pause-menu").classList.remove("hidden");
    world.pause();
    AudioHub.stopOne(AudioHub.MOVE);
}

function closePauseMenu() {
    document.getElementById("pause-menu").classList.add("hidden");
    world.resume();
}

// Taste (klein geschrieben) -> zugehöriges Keyboard-Feld. Pfeiltasten
// separat, da sie sich nicht klein/groß schreiben lassen wie Buchstaben.
const MOVEMENT_KEY_MAP = {
    'd': 'RIGHT', 'arrowright': 'RIGHT',
    'a': 'LEFT', 'arrowleft': 'LEFT',
    'w': 'UP', 'arrowup': 'UP',
    's': 'DOWN', 'arrowdown': 'DOWN',
    ' ': 'SPACE',
    'e': 'E',
    'q': 'Q',
};

function setMovementKey(e, isPressed) {
    let field = MOVEMENT_KEY_MAP[e.key.toLowerCase()];
    if (field) keyboard[field] = isPressed;
}

// Tasten, die unabhängig von der Bewegung etwas auslösen.
function handleGlobalKeydown(e) {
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        togglePauseMenu();
    }
}

window.addEventListener('keydown', (e) => {
    setMovementKey(e, true);
    handleGlobalKeydown(e);
});

window.addEventListener('keyup', (e) => {
    setMovementKey(e, false);
});

document.addEventListener("DOMContentLoaded", initEventListeners);

function initEventListeners(){
    wireStartMenuButtons();
    wireGameControlButtons();
    wirePauseMenuButtons();
    wireMusicPopupControls();
    document.getElementById("close-popup").addEventListener("click", closePopup);
    AudioHub.applyVolumes();
    resetPauseMenu();
    initJoystick();
    wireTouchActionButtons();
}

function wireStartMenuButtons() {
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("controls-btn").addEventListener("click", openControls);
    document.getElementById("credits-btn").addEventListener("click", openCredits);
    document.getElementById("music-btn").addEventListener("click", openMusicSettings);
}

// Buttons außerhalb des Canvas (Mute, Pause).
function wireGameControlButtons() {
    document.getElementById("mute-btn").addEventListener("click", handleMusicToggle);
    document.getElementById("pause-btn").addEventListener("click", togglePauseMenu);
}

// Buttons innerhalb des Pausenmenüs.
function wirePauseMenuButtons() {
    document.getElementById("resume-btn").addEventListener("click", closePauseMenu);
    document.getElementById("pause-controls-btn").addEventListener("click", openControls);
    document.getElementById("pause-music-btn").addEventListener("click", openMusicSettings);
    document.getElementById("pause-credits-btn").addEventListener("click", openCredits);
}

function wireMusicPopupControls() {
    document.getElementById("music-toggle-btn").addEventListener("click", handleMusicToggle);
    document.getElementById("volume-master").addEventListener("input", (e) => AudioHub.setMasterVolume(e.target.value));
    document.getElementById("volume-music").addEventListener("input", (e) => AudioHub.setMusicVolume(e.target.value));
    document.getElementById("volume-sfx").addEventListener("input", (e) => AudioHub.setSfxVolume(e.target.value));
}

// ========================= //
// Touch-Steuerung (Joystick + Angriffs-Buttons) //
// ========================= //
// Setzen dieselben keyboard.*-Felder wie die echte Tastatur - Character
// und World merken so gar nicht, ob die Eingabe von Tastatur oder Touch kam.

// Merkt sich Mittelpunkt/Radius des Joystick-Kreises für die Dauer einer
// Berührung, damit touchmove nicht bei jedem Aufruf neu messen muss.
function initJoystick() {
    let base = document.getElementById('joystick-base');
    base.addEventListener('touchstart', startJoystickTouch);
    base.addEventListener('touchmove', moveJoystickTouch);
    base.addEventListener('touchend', endJoystickTouch);
}

function startJoystickTouch(e) {
    let rect = e.currentTarget.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
    joystickRadius = rect.width / 2;
    moveJoystickTouch(e);
}

// Bewegt den sichtbaren Knopf mit dem Finger mit (auf den Radius begrenzt)
// und setzt daraus die Bewegungsrichtung
function moveJoystickTouch(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let dx = touch.clientX - joystickCenterX;
    let dy = touch.clientY -joystickCenterY;
    let distance = Math.min(Math.hypot(dx, dy), joystickRadius);
    let angle = Math.atan2(dy, dx);
    let knobX = Math.cos(angle) * distance;
    let knobY = Math.sin(angle) * distance;
    let knob = document.getElementById('joystick-knob');
    knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    updateJoystickKeys(dx, dy);
}

// Totzone: erst ab 25% Auslenkung zählt eine Richtung als "gedrückt" -
// sonst würde schon ein leichtes Zittern des Fingers ständig hin- und
// herschalten.
function updateJoystickKeys(dx, dy) {
    let deadzone = joystickRadius * 0.25;
    keyboard.RIGHT = dx > deadzone;
    keyboard.LEFT = dx < -deadzone;
    keyboard.DOWN = dy > deadzone;
    keyboard.UP = dy < -deadzone;
}

function endJoystickTouch() {
    document.getElementById('joystick-knob').style.transform = 'translate(-50%, -50%)';
    keyboard.RIGHT = keyboard.LEFT = keyboard.UP = keyboard.DOWN = false;
}

function wireTouchActionButtons() {
    bindTouchButton('touch-fin-slap', 'SPACE');
    bindTouchButton('touch-bubble', 'E');
    bindTouchButton('touch-poison', 'Q');
}

// Simuliert Tasten-Drücken/Loslassen: gleiches keyboard-Feld wie die
// echte Taste, nur per Touch statt per Tastendruck ausgelöst.
function bindTouchButton(elementId, keyboardField) {
    let btn = document.getElementById(elementId);
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keyboard[keyboardField] = true;
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keyboard[keyboardField] = false;
    });
}