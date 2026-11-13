import { gsap, onEnter, reducedMotion, addRiseReveal, addListReveal, LIST_STAGGER } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Что внутри» (GSAP)
// Заголовок — как на bip-it (снизу с проявлением), водяной знак проявляется.
// Столбцы: подзаголовок, затем пункты быстро друг за другом снизу. Второй столбец стартует
// по той же схеме одновременно с 6-м пунктом первого. Если столбцы друг под другом (мобильный) —
// каждый столбец запускается сам, когда попадает в экран.
// --------------------------------------

const ITEM_STAGGER = LIST_STAGGER; // интервал между пунктами
const ITEMS_DELAY = 0.15; // пункты после подзаголовка столбца
const SECOND_COLUMN_AFTER = 6; // второй столбец стартует вместе с этим пунктом первого

// Анимация одного столбца с позиции at
const BLUR = 8; // появление из лёгкого размытия

function addColumn(tl, group, at) {
    tl.fromTo(
        group.querySelector(".composition-group-title"),
        { y: 40, autoAlpha: 0, filter: `blur(${BLUR}px)` },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "transform,filter" },
        at
    );
    return addListReveal(tl, group.querySelectorAll(".composition-item"), at + ITEMS_DELAY, { blur: BLUR });
}

export function composition(context = document) {
    const root = context.querySelector("[data-composition]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const [first, second] = root.querySelectorAll(".composition-group");
    const wordmark = root.querySelector(".composition-wordmark");
    // Столбцы рядом — на одной высоте (на мобильном второй под первым)
    const sideBySide = first && second && Math.abs(first.offsetTop - second.offsetTop) < 10;

    const tl = addRiseReveal(gsap.timeline({ paused: true }), root.querySelectorAll(".composition-title"), 0, {
        blur: BLUR
    });
    if (wordmark) tl.fromTo(wordmark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0.2);

    const firstStart = 0.3;
    if (first) addColumn(tl, first, firstStart);

    let secondTl = null;
    if (second) {
        if (sideBySide) {
            // Первый пункт второго столбца — ровно вместе с 6-м пунктом первого (подзаголовок — чуть раньше)
            addColumn(tl, second, firstStart + (SECOND_COLUMN_AFTER - 1) * ITEM_STAGGER);
        } else {
            secondTl = addColumn(gsap.timeline({ paused: true }), second, 0);
        }
    }

    root.classList.add("is-ready");

    onEnter(root, () => tl.play());
    if (secondTl) onEnter(second, () => secondTl.play());
}
