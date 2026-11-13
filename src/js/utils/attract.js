import { gsap } from "gsap";

// --------------------------------------
// Притяжение к курсору (параллакс от мыши, как у логотипа в подвале thecosine.com)
// Разметка: data-attract="0.33" — сила по обеим осям, доля размера элемента;
//           data-attract-y="0.05" — своя сила по вертикали (для высоких/узких элементов).
// Смещение курсора от центра элемента делится на половину экрана и ограничивается [-1, 1],
// элемент сдвигается на это значение × свой размер × силу и догоняет его за 0.6s (gsap.quickTo).
// Работает только на устройствах с мышью и без prefers-reduced-motion.
// Не вешать на элемент, у которого GSAP анимирует x/y — оборачивать во внешний контейнер.
// --------------------------------------

const items = [];
let listening = false;

// Координаты мыши запоминаем, а считаем раз за кадр: getBoundingClientRect на каждое событие
// mousemove заставлял бы браузер лишний раз пересчитывать раскладку
let pointer = null;
let frame = 0;

function onMove(event) {
    pointer = { clientX: event.clientX, clientY: event.clientY };
    if (!frame) frame = requestAnimationFrame(update);
}

function update() {
    frame = 0;
    if (!pointer) return;
    const event = pointer;
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;

    items.forEach((item) => {
        if (!item.el.isConnected) return;
        const rect = item.el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / halfW;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / halfH;

        item.x(gsap.utils.clamp(-1, 1, dx) * rect.width * item.strengthX);
        item.y(gsap.utils.clamp(-1, 1, dy) * rect.height * item.strengthY);
    });
}

export function attract(context = document) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduced) return;

    context.querySelectorAll("[data-attract]").forEach((el) => {
        if (el.dataset.attractInit === "true") return;
        el.dataset.attractInit = "true";

        const strength = parseFloat(el.dataset.attract) || 0;
        const item = {
            el,
            strengthX: strength,
            strengthY: el.dataset.attractY !== undefined ? parseFloat(el.dataset.attractY) || 0 : strength,
            x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }),
            y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" })
        };
        items.push(item);

        el.addEventListener(
            "destroy",
            () => {
                items.splice(items.indexOf(item), 1);
                gsap.killTweensOf(el);
            },
            { once: true }
        );
    });

    if (items.length && !listening) {
        listening = true;
        window.addEventListener("mousemove", onMove, { passive: true });
    }
}
