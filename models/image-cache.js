const imageCache = new Map();

export function getSharedImage(path) {
    let img = imageCache.get(path);
    if (!img) {
        img = new Image();
        img.src = path;
        imageCache.set(path, img);
    }
    return img;
}