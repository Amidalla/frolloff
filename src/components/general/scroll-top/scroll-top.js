import { onScrollDirection } from "../../../js/utils/scroll-direction.js";

// --------------------------------------
// Кнопка «Наверх»: видна при прокрутке вверх (когда шапка спрятана), при прокрутке вниз
// и в первом экране — скрыта. По клику — плавная прокрутка в начало страницы.
// --------------------------------------

export function scrollTop(context = document) {
    const root = context.querySelector("[data-scroll-top]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    const controller = new AbortController();
    const { signal } = controller;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const footer = document.querySelector("footer.footer");

    // Как в макете: у подвала кнопка останавливается на его верхней границе (центр — на линии)
    // и дальше едет вместе с ней. Отступ снизу берём из CSS (--scroll-top-offset).
    const place = () => {
        if (!footer) return;
        const style = getComputedStyle(root);
        const offset = parseFloat(style.getPropertyValue("--scroll-top-offset")) || 0;
        const size = root.offsetHeight;
        const lift = Math.round(window.innerHeight - footer.getBoundingClientRect().top - size / 2);
        // Подвал выше экрана (мобильный): когда граница уходит за верх экрана, кнопка
        // возвращается в нижний угол — иначе уехала бы вместе с границей
        const max = window.innerHeight - size - offset;
        root.style.bottom = lift > offset && lift <= max ? `${lift}px` : "";
    };

    onScrollDirection(
        ({ y, direction }) => {
            // Докрутили до подвала — кнопка видна при любом направлении прокрутки
            const atFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
            root.classList.toggle("is-visible", atFooter || (y > window.innerHeight && direction === "up"));
            place();
        },
        { signal }
    );
    window.addEventListener("resize", place, { passive: true, signal });

    root.addEventListener(
        "click",
        () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" }),
        { signal }
    );

    root.addEventListener("destroy", () => controller.abort(), { once: true });
}
