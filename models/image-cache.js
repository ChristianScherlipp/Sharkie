const imageCache = new Map();

/**
 * Gets a shared, cached Image for a given path so the same file isn't
 * loaded into memory multiple times when several objects use it.
 * @param {string} path - Path to the image file.
 * @returns {HTMLImageElement} The cached (or newly created) image.
 */
export function getSharedImage(path) {
    let img = imageCache.get(path);
    if (!img) {
        img = new Image();
        img.src = path;
        imageCache.set(path, img);
    }
    return img;
}