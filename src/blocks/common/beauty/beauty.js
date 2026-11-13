import { gsap, onEnter, reducedMotion, addHeaderReveal, addDropReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Красота начинается изнутри» (GSAP)
// Шапка секции — как на bip-it (метка → заголовок → текст поднимаются снизу),
// следом всплывает композиция со стиками. Карточки — отдельно, когда их сетка в экране:
// по очереди выплывают сверху из лёгкого размытия.
// Лист, тени и стики двигаются за мышью (data-attract, js/utils/attract.js) — их x/y здесь не трогаем.
// --------------------------------------

export function beauty(context = document) {
    const root = context.querySelector("[data-beauty]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const visual = root.querySelector(".beauty-visual");
    const cardsWrap = root.querySelector(".beauty-cards");
    const cards = root.querySelectorAll(".benefit-card");

    const intro = gsap.timeline({ paused: true });
    addHeaderReveal(intro, root.querySelector(".beauty-header"), 0);
    if (visual) {
        intro.fromTo(
            visual,
            { y: 80, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out", clearProps: "transform" },
            0.35
        );
    }

    const cardsTl = addDropReveal(gsap.timeline({ paused: true }), cards);

    root.classList.add("is-ready");

    onEnter(root, () => intro.play());
    if (cardsWrap) onEnter(cardsWrap, () => cardsTl.play());
}
