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

function handleGameOver() {
    overlay.showGameOver();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_OVER);
}

function handleWinBanner() {
    overlay.showWinBanner();
    AudioHub.playOne(AudioHub.LEVEL_SUCCESS);
}

function handleWinFinal() {
    overlay.showWinFinal();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_WIN);
}

function handleLevelComplete() {
    currentLevel++;
    init();
}

function restartGame() {
    init();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.MUSIC);
}

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

function showGameAfterFadeOut() {
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('canvas').style.display = "block";
    document.getElementById('game-controls').classList.remove("hidden");
    document.getElementById('touch-controls').classList.remove("hidden");
    AudioHub.playIfNotRunning(AudioHub.MUSIC);
    init();
}

function showPopupSection(sectionId) {
    ["popup-controls", "popup-credits", "popup-music"].forEach((id) => {
        document.getElementById(id).classList.toggle("hidden", id !== sectionId);
    });
    document.getElementById("popup").classList.remove("hidden");
}

function isTouchDevice() {
    return window.matchMedia("(hover: none)").matches;
}

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

function wireGameControlButtons() {
    document.getElementById("mute-btn").addEventListener("click", handleMusicToggle);
    document.getElementById("pause-btn").addEventListener("click", togglePauseMenu);
}

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