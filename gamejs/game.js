import { Keyboard } from '../models/core/keyboard.class.js';
import { World } from "../models/world/world.class.js";
import { GameOverlay } from "../models/ui/game-overlay.class.js"
import { AudioHub } from '../models/audio/audio-hub.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let currentLevel = 1;

let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickRadius = 0;

let shopPausedWorld = false;

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

/**
 * Resets the UI, creates a fresh World instance for the current level and
 * starts the game loop. Called on game start, level transitions and restarts.
 * @param {Object} [carryOver=null] - Stats carried over from the previous level (coins, poisons, experience, life). Omitted for a fresh game start or restart.
 */
function init(carryOver = null) {
    canvas = document.getElementById('canvas');
    overlay.reset();
    resetPauseMenu();
    resetKeyboard();
    
    world = new World(canvas, keyboard, buildWorldCallbacks(), currentLevel, carryOver);
}

/**
 * Resets pause menu.
 */
function resetPauseMenu() {
    document.getElementById("pause-menu").classList.add("hidden");
}

/**
 * Builds the callback object passed to World, so it can notify game.js
 * about game-over, win and level-complete events without depending on it.
 * @returns {Object} The callback map for the World instance.
 */
function buildWorldCallbacks() {
    return{
        onGameOver: handleGameOver,
        onWinBanner: handleWinBanner,
        onWinFinal: handleWinFinal,
        onLevelComplete: handleLevelComplete,
    };
}

/**
 * Handles game over.
 */
function handleGameOver() {
    overlay.showGameOver();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_OVER);
}

/**
 * Handles win banner.
 */
function handleWinBanner() {
    overlay.showWinBanner();
    AudioHub.playOne(AudioHub.LEVEL_SUCCESS);
}

/**
 * Handles win final.
 */
function handleWinFinal() {
    overlay.showWinFinal();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.GAME_WIN);
}

/**
 * Handles level complete.
 */
function handleLevelComplete() {
    let carryOver = world.getCarryOverState();
    currentLevel++;
    init(carryOver);
}

/**
 * Restarts game.
 */
function restartGame() {
    init();
    AudioHub.stopAll();
    AudioHub.playOne(AudioHub.MUSIC);
}

/**
 * Returns to menu.
 */
function backToMenu() {
    location.reload();
}

/**
 * Resets keyboard.
 */
function resetKeyboard() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.E = false;
    keyboard.Q = false;
}

/**
 * Starts game.
 */
function startGame() {
    const startScreen = document.getElementById("start-screen");
    startScreen.classList.add("fade-out");
    setTimeout(showGameAfterFadeOut, 800);
}

/**
 * Shows game after fade out.
 */
function showGameAfterFadeOut() {
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('canvas').style.display = "block";
    document.getElementById('game-controls').classList.remove("hidden");
    document.getElementById('touch-controls').classList.remove("hidden");
    AudioHub.playIfNotRunning(AudioHub.MUSIC);
    init();
}

/**
 * Shows popup section.
 * @param {string} sectionId - ID of the popup section to show.
 */
function showPopupSection(sectionId) {
    ["popup-controls", "popup-credits", "popup-music", "popup-shop"].forEach((id) => {
        document.getElementById(id).classList.toggle("hidden", id !== sectionId);
    });
    document.getElementById("popup").classList.remove("hidden");
}

/**
 * Checks whether touch device.
 * @returns {boolean} True if the condition holds, false otherwise.
 */
function isTouchDevice() {
    return window.matchMedia("(hover: none)").matches;
}

/**
 * Updates controls popup for device.
 */
function updateControlsPopupForDevice() {
    let touch = isTouchDevice();
    document.getElementById("controls-keyboard").classList.toggle("hidden", touch);
    document.getElementById("controls-touch").classList.toggle("hidden", !touch);
}

/**
 * Opens controls.
 */
function openControls() {
    showPopupSection("popup-controls");
    updateControlsPopupForDevice();
}

/**
 * Opens credits.
 */
function openCredits() {
    showPopupSection("popup-credits")
}

/**
 * Opens music settings.
 */
function openMusicSettings() {
    showPopupSection("popup-music");
}

/**
 * Opens the shop popup. Pauses the running game while shopping, unless it
 * was already paused (e.g. opened from the pause menu), in which case
 * closing the shop won't resume it either.
 */
function openShop() {
    if (!world || world.gameEnded) return;
    if (!world.paused) {
        world.pause();
        shopPausedWorld = true;
    }
    refreshShopUI();
    showPopupSection("popup-shop");
}

/**
 * Refreshes the shop's coin balance display and disables buy buttons the
 * player can't currently afford.
 */
function refreshShopUI() {
    if (!world) return;
    document.getElementById("shop-coin-count").textContent = world.collectedCoins;
    document.getElementById("buy-life-btn").disabled = world.collectedCoins < 25;
    document.getElementById("buy-poison-btn").disabled = world.collectedCoins < 15;
}

/**
 * Spends 25 coins to heal the character by 50% (capped at full health) and
 * updates the coin/health bars accordingly.
 */
function buyLife() {
    if (!world || world.collectedCoins < 25) return;
    world.collectedCoins -= 25;
    world.character.energy = Math.min(100, world.character.energy + 50);
    world.coinBar.setPercentage((world.collectedCoins / world.totalCoins) * 100, world.coinBar.IMAGES_COINBAR, world.collectedCoins);
    world.healthBar.setPercentage(world.character.energy, world.healthBar.IMAGES_HEALTHBAR);
    AudioHub.playOne(AudioHub.COIN_COLLECTED);
    refreshShopUI();
}

/**
 * Spends 15 coins for 5 extra poison shots and updates the coin/poison bars
 * accordingly. Raises totalPoisons alongside so the poison bar's percentage
 * stays meaningful instead of exceeding 100%.
 */
function buyPoisons() {
    if (!world || world.collectedCoins < 15) return;
    world.collectedCoins -= 15;
    world.collectedPoisons += 5;
    world.totalPoisons += 5;
    world.coinBar.setPercentage((world.collectedCoins / world.totalCoins) * 100, world.coinBar.IMAGES_COINBAR, world.collectedCoins);
    world.posionBar.setPercentage((world.collectedPoisons / world.totalPoisons) * 100, [], world.collectedPoisons);
    AudioHub.playOne(AudioHub.POTIN_COLLECTED);
    refreshShopUI();
}

/**
 * Handles music toggle.
 */
function handleMusicToggle() {
    let isPlaying = AudioHub.toggleMusic();
    updateMusicUI(isPlaying);
}

/**
 * Updates music ui.
 * @param {boolean} isPlaying - Whether music is currently playing.
 */
function updateMusicUI(isPlaying){
    document.getElementById('music-toggle-btn').innerHTML = isPlaying 
    ? '<img class="btn-icon" src="./assets/icons/Volume-Level-High--Streamline-Core.svg" alt="Volume Icon"> Musik AN'
    : '<img class="btn-icon" src="./assets/icons/Volume-Off--Streamline-Core.svg" alt="Volume Icon"> Musik AUS'; 
    document.getElementById('mute-icon').src = isPlaying
        ? './assets/icons/Volume-Level-High--Streamline-Core.svg'
        : './assets/icons/Volume-Mute--Streamline-Core.svg';
}

/**
 * Closes popup.
 */
function closePopup(){
    document.getElementById("popup").classList.add("hidden");
    if (shopPausedWorld && world) {
        world.resume();
        shopPausedWorld = false;
    }
}

/**
 * Toggles pause menu.
 */
function togglePauseMenu() {
    if (!world || world.gameEnded) return;
    let isOpen = !document.getElementById('pause-menu').classList.contains("hidden");
    isOpen ? closePauseMenu() : openPauseMenu();
}

/**
 * Opens pause menu.
 */
function openPauseMenu() {
    document.getElementById("pause-menu").classList.remove("hidden");
    world.pause();
    AudioHub.stopOne(AudioHub.MOVE);
}

/**
 * Closes pause menu.
 */
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

/**
 * Sets movement key.
 * @param {Event} e - The triggered DOM/touch event.
 * @param {boolean} isPressed - Whether the key is being pressed (true) or released (false).
 */
function setMovementKey(e, isPressed) {
    let field = MOVEMENT_KEY_MAP[e.key.toLowerCase()];
    if (field) keyboard[field] = isPressed;
}

/**
 * Checks whether the shared popup (controls/credits/music/shop) is
 * currently open, regardless of which section is showing inside it.
 * @returns {boolean} True if the popup is visible.
 */
function isPopupOpen() {
    return !document.getElementById("popup").classList.contains("hidden");
}

/**
 * Handles global keydown.
 * @param {Event} e - The triggered DOM/touch event.
 */
function handleGlobalKeydown(e) {
    if (e.key === 'Escape') {
        isPopupOpen() ? closePopup() : togglePauseMenu();
        return;
    }
    if (e.key.toLowerCase() === 'p') {
        togglePauseMenu();
    }
    if (e.key.toLowerCase() === 'f') {
        openShop();
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

/**
 * Initializes event listeners.
 */
function initEventListeners(){
    wireStartMenuButtons();
    wireGameControlButtons();
    wirePauseMenuButtons();
    wireMusicPopupControls();
    wireShopButtons();
    document.getElementById("close-popup").addEventListener("click", closePopup);
    AudioHub.applyVolumes();
    updateMusicUI(AudioHub.loadMuteState());
    resetPauseMenu();
    initJoystick();
    wireTouchActionButtons();
    disableTouchControlsContextMenu();
}

/**
 * Wires up start menu buttons.
 */
function wireStartMenuButtons() {
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("controls-btn").addEventListener("click", openControls);
    document.getElementById("credits-btn").addEventListener("click", openCredits);
    document.getElementById("music-btn").addEventListener("click", openMusicSettings);
}

/**
 * Wires up game control buttons.
 */
function wireGameControlButtons() {
    document.getElementById("mute-btn").addEventListener("click", handleMusicToggle);
    document.getElementById("fullscreen-btn").addEventListener("click", toggleFullscreen);
    document.getElementById("shop-btn").addEventListener("click", openShop);
    document.getElementById("pause-btn").addEventListener("click", togglePauseMenu);
    document.addEventListener("fullscreenchange", updateFullscreenUI);
    document.addEventListener("webkitfullscreenchange", updateFullscreenUI);
    document.getElementById("game-controls").addEventListener("click", blurClickedIconButton);
}

/**
 * Removes keyboard focus from a clicked game-control icon button
 * (mute/fullscreen/shop/pause). Without this, a focused button would also
 * react to the Space key, which conflicts with Space being the fin-slap
 * attack key during gameplay.
 * @param {Event} e - The triggered DOM/touch event.
 */
function blurClickedIconButton(e) {
    e.target.closest(".icon-btn")?.blur();
}

/**
 * Wires up the shop's buy buttons.
 */
function wireShopButtons() {
    document.getElementById("buy-life-btn").addEventListener("click", buyLife);
    document.getElementById("buy-poison-btn").addEventListener("click", buyPoisons);
}

/**
 * Wires up pause menu buttons.
 */
function wirePauseMenuButtons() {
    document.getElementById("resume-btn").addEventListener("click", closePauseMenu);
    document.getElementById("pause-controls-btn").addEventListener("click", openControls);
    document.getElementById("pause-music-btn").addEventListener("click", openMusicSettings);
    document.getElementById("pause-credits-btn").addEventListener("click", openCredits);
}

/**
 * Wires up music popup controls.
 */
function wireMusicPopupControls() {
    document.getElementById("music-toggle-btn").addEventListener("click", handleMusicToggle);
    document.getElementById("volume-master").addEventListener("input", (e) => AudioHub.setMasterVolume(e.target.value));
    document.getElementById("volume-music").addEventListener("input", (e) => AudioHub.setMusicVolume(e.target.value));
    document.getElementById("volume-sfx").addEventListener("input", (e) => AudioHub.setSfxVolume(e.target.value));
}

/**
 * Initializes joystick.
 */
function initJoystick() {
    let base = document.getElementById('joystick-base');
    base.addEventListener('touchstart', startJoystickTouch);
    base.addEventListener('touchmove', moveJoystickTouch);
    base.addEventListener('touchend', endJoystickTouch);
}

/**
 * Toggles fullscreen.
 */
function toggleFullscreen() {
    let wrapper = document.querySelector(".game-wrapper");
    let isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFullscreen) {
        (wrapper.requestFullscreen || wrapper.webkitRequestFullscreen)?.call(wrapper);
    } else {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
}

/**
 * Updates fullscreen UI.
 */
function updateFullscreenUI() {
    let isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    document.getElementById("fullscreen-icon").src = isFullscreen
        ? "./assets/icons/Arrow-Shrink--Streamline-Core.svg"
        : "./assets/icons/Arrow-Expand--Streamline-Core.svg";
}

/**
 * Starts joystick touch.
 * @param {Event} e - The triggered DOM/touch event.
 */
function startJoystickTouch(e) {
    let rect = e.currentTarget.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
    joystickRadius = rect.width / 2;
    moveJoystickTouch(e);
}

/**
 * Moves joystick touch.
 * @param {Event} e - The triggered DOM/touch event.
 */
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

/**
 * Updates joystick keys.
 * @param {number} dx - Horizontal distance or offset.
 * @param {number} dy - Vertical distance or offset.
 */
function updateJoystickKeys(dx, dy) {
    let deadzone = joystickRadius * 0.25;
    keyboard.RIGHT = dx > deadzone;
    keyboard.LEFT = dx < -deadzone;
    keyboard.DOWN = dy > deadzone;
    keyboard.UP = dy < -deadzone;
}

/**
 * Ends joystick touch.
 */
function endJoystickTouch() {
    document.getElementById('joystick-knob').style.transform = 'translate(-50%, -50%)';
    keyboard.RIGHT = keyboard.LEFT = keyboard.UP = keyboard.DOWN = false;
}

/**
 * Wires up touch action buttons.
 */
function wireTouchActionButtons() {
    bindTouchButton('touch-fin-slap', 'SPACE');
    bindTouchButton('touch-bubble', 'E');
    bindTouchButton('touch-poison', 'Q');
}

/**
 * Binds touch button.
 * @param {string} elementId - ID of the target DOM element.
 * @param {string} keyboardField - Name of the Keyboard field to update.
 */
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

/**
 * Disables touch controls context menu.
 */
function disableTouchControlsContextMenu() {
    document.getElementById('touch-controls').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}