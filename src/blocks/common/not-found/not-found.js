import { gsap, onEnter, reducedMotion, addRiseReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление страницы 404 (GSAP) — в общем стиле сайта:
// «404 ошибка» проявляется из размытия с лёгким приближением (как фото первого экрана),
// подзаголовок, текст и кнопка поднимаются снизу друг за другом (как на bip-it).
// Заголовок двигается за мышью (data-attract) — поэтому transform после появления не сбрасываем
// (clearProps только filter), иначе сотрётся сдвиг от курсора.
// --------------------------------------

export function notFound(context = document) {
    const root = context.querySelector("[data-not-found]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
        root.querySelector(".not-found-title"),
        { autoAlpha: 0, scale: 1.12, filter: "blur(16px) brightness(1.2)" },
        {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            duration: 1.3,
            ease: "expo.out",
            clearProps: "filter"
        },
        0
    );
    addRiseReveal(tl, root.querySelectorAll(".not-found-subtitle, .not-found-text, .not-found-button"), 0.4);

    root.classList.add("is-ready");
    onEnter(root, () => tl.play());
}
