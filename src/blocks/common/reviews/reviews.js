import { gsap, onEnter, reducedMotion, addRiseReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Отзывы» (GSAP), как на bip-it
// Метка → заголовок → оценка поднимаются снизу; плашка с маркетплейсами подъезжает снизу;
// стики поднимаются и проявляются вместе с ней; лист проявляется.
// Стики (img внутри .reviews-visual) и лист двигаются за мышью (data-attract) —
// появление анимирует контейнер .reviews-visual, x/y картинки здесь не трогаем.
// --------------------------------------

export function reviews(context = document) {
    const root = context.querySelector("[data-reviews]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const links = root.querySelector(".reviews-links");
    const visual = root.querySelector(".reviews-visual");
    const leaf = root.querySelector(".reviews-leaf");

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    addRiseReveal(tl, root.querySelectorAll(".reviews-head > *"), 0, { blur: 8 });
    if (links) {
        tl.fromTo(
            links,
            { y: 100, autoAlpha: 0, filter: "blur(8px)" },
            { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1, clearProps: "transform,filter" },
            0.35
        );
    }
    if (visual) {
        tl.fromTo(
            visual,
            { y: 80, autoAlpha: 0, filter: "blur(8px)" },
            { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1, clearProps: "transform,filter" },
            0.45
        );
    }
    if (leaf) tl.fromTo(leaf, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.3);

    root.classList.add("is-ready");
    onEnter(root, () => tl.play());
}
