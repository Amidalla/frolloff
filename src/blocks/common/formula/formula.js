import { gsap, onEnter, reducedMotion, addRiseReveal, addDropReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Умная формула для суставов» (GSAP)
// Шапка (заголовок → текст → «Рекомендация по приему» → дозировка) — как на bip-it, снизу;
// лист-контур проявляется (двигается за мышью — data-attract, его x/y здесь не трогаем).
// Карточки — свой триггер на списке: по очереди выплывают сверху из лёгкого размытия.
// --------------------------------------

export function formula(context = document) {
    const root = context.querySelector("[data-formula]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const list = root.querySelector(".formula-cards");
    const leaf = root.querySelector(".formula-leaf");

    const headTl = addRiseReveal(gsap.timeline({ paused: true }), root.querySelectorAll(".formula-head > *"));
    if (leaf) headTl.fromTo(leaf, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0.3);

    const cardsTl = addDropReveal(gsap.timeline({ paused: true }), root.querySelectorAll(".effect-card"));

    root.classList.add("is-ready");

    onEnter(root, () => headTl.play());
    if (list) onEnter(list, () => cardsTl.play());
}
