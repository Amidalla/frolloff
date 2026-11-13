import { gsap, onEnter, reducedMotion, addHeaderReveal, addRiseReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «О создателе» (GSAP), как на bip-it
// Шапка → текст и «Читать всё» поднимаются снизу; фото проявляется из размытия
// (с приближением от нижнего края — фото стоит на границе секции); лист-контур проявляется.
// Лист двигается за мышью (data-attract) — его x/y здесь не трогаем.
// Фото и лист прижаты к низу секции: при «Читать всё» они плавно уезжают вниз вместе с ним
// (скорость раскрытия текста — в about.scss).
// --------------------------------------

export function about(context = document) {
    const root = context.querySelector("[data-about]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const photo = root.querySelector(".about-photo");
    const leaf = root.querySelector(".about-leaf");

    const tl = gsap.timeline({ paused: true });
    addHeaderReveal(tl, root.querySelector(".about-header"), 0);
    addRiseReveal(tl, root.querySelectorAll(".about-paragraphs, .about-text .read-more-toggle"), 0.3);
    if (photo) {
        tl.fromTo(
            photo,
            { autoAlpha: 0, scale: 1.08, transformOrigin: "50% 100%", filter: "blur(16px) brightness(1.2)" },
            {
                autoAlpha: 1,
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 1.3,
                ease: "expo.out",
                clearProps: "transform,filter"
            },
            0.3
        );
    }
    if (leaf) tl.fromTo(leaf, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0.4);

    root.classList.add("is-ready");
    onEnter(root, () => tl.play());
}
