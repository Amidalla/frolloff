import { onScrollDirection } from "../../../js/utils/scroll-direction.js";

// --------------------------------------
// Шапка: над первым экраном прозрачная (.is-sticky нет).
// После прокрутки: при прокрутке вниз — прилипшая с тёмным фоном (.is-sticky),
// при прокрутке вверх — уезжает вверх (.is-hidden). У самого верха страницы видна всегда.
// --------------------------------------

export function header(context = document) {
    const root = context.querySelector("header.header");
    if (!root || root.dataset.init === "true") return;

    root.dataset.init = "true";

    const controller = new AbortController();
    const { signal } = controller;

    onScrollDirection(
        ({ y, direction }) => {
            const nearTop = y <= root.offsetHeight;
            root.classList.toggle("is-sticky", y > 0);
            root.classList.toggle("is-hidden", !nearTop && direction === "up");
        },
        { signal }
    );

    root.addEventListener("destroy", () => controller.abort(), { once: true });
}
