import { gsap, onEnter, reducedMotion, addHeaderReveal, addDropReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Как принимать» (GSAP)
// Шапка секции — как на bip-it (метка → заголовок → текст поднимаются снизу).
// Шаги с цифрами — свой триггер на списке: по очереди выплывают сверху из лёгкого размытия.
// --------------------------------------

export function howTo(context = document) {
    const root = context.querySelector("[data-how-to]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const list = root.querySelector(".how-to-steps");
    const headerTl = addHeaderReveal(gsap.timeline({ paused: true }), root.querySelector(".how-to-header"));
    const stepsTl = addDropReveal(gsap.timeline({ paused: true }), root.querySelectorAll(".how-to-step"));

    root.classList.add("is-ready");

    onEnter(root, () => headerTl.play());
    if (list) onEnter(list, () => stepsTl.play());
}
