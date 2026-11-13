import { gsap, onEnter, reducedMotion, addHeaderReveal, addListReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Отвечаем на главное» (GSAP) — как «Что внутри»:
// шапка как на bip-it (метка → заголовок снизу), затем вопросы быстро снизу друг за другом.
// --------------------------------------

export function faq(context = document) {
    const root = context.querySelector("[data-faq]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const tl = gsap.timeline({ paused: true });
    // Шапка и вопросы — ещё и из лёгкого размытия
    addHeaderReveal(tl, root.querySelector(".faq-header"), 0, { blur: 8 });
    addListReveal(tl, root.querySelectorAll(".faq-list [data-accordion-item]"), 0.3, { blur: 8 });

    root.classList.add("is-ready");
    onEnter(root, () => tl.play());
}
