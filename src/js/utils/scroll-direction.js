// --------------------------------------
// Направление прокрутки (один раз за кадр, rAF).
// Колбэк получает { y, direction }: direction — "down" | "up" | null (пока сдвиг меньше порога).
// Порог убирает дрожание на мелких сдвигах (тачпады, инерция на телефонах).
// Используют шапка (стики только при прокрутке вниз) и кнопка «Наверх» (наоборот).
// --------------------------------------

const THRESHOLD = 8;

export function onScrollDirection(callback, { signal } = {}) {
    let lastY = window.scrollY;
    let direction = null;
    let ticking = false;

    const update = () => {
        ticking = false;
        const y = Math.max(window.scrollY, 0);
        const delta = y - lastY;
        if (Math.abs(delta) >= THRESHOLD) {
            direction = delta > 0 ? "down" : "up";
            lastY = y;
        }
        callback({ y, direction });
    };

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        },
        { passive: true, signal }
    );

    update();
}
