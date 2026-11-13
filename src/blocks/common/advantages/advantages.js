import { gsap, onEnter, reducedMotion, heroIntro } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Преимуществ» (GSAP)
// Карточка раскрывается от центра к краям (clip-path) и поднимается снизу,
// затем выезжает заголовок, иконки по очереди «впрыгивают» с поворотом, следом подписи;
// иконки и подписи проявляются из лёгкого размытия (blur 10px, у фото первого экрана — 16px).
// Стартует, когда блок в зоне видимости и первый экран уже появился (он под карточкой).
// --------------------------------------

export function advantages(context = document) {
    const root = context.querySelector("[data-advantages]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    if (reducedMotion()) {
        root.classList.add("is-ready");
        return;
    }

    const card = root.querySelector(".advantages-card");
    const title = root.querySelector(".advantages-title");
    const icons = root.querySelectorAll(".advantage-item .icon");
    const texts = root.querySelectorAll(".advantage-item .text");

    // Радиус карточки свой на каждом брейкпоинте — clip-path повторяет его, чтобы углы не «ломались».
    // Маска выходит за края на SHADOW px: тень карточки видна всё время раскрытия,
    // и в конце (когда clip-path снимается) ничего не «прыгает».
    const radius = getComputedStyle(card).borderTopLeftRadius;
    const SHADOW = 40;

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    tl.fromTo(
        card,
        { y: 90, autoAlpha: 0, clipPath: `inset(-${SHADOW}px 46% -${SHADOW}px 46% round ${radius})` },
        {
            y: 0,
            autoAlpha: 1,
            clipPath: `inset(-${SHADOW}px -${SHADOW}px -${SHADOW}px -${SHADOW}px round ${radius})`,
            duration: 1.2,
            // Равномерная скорость без рывка в начале и долгого торможения в конце
            ease: "sine.inOut",
            clearProps: "transform,clipPath"
        },
        0
    )
        .fromTo(title, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, clearProps: "transform" }, 0.3)
        .fromTo(
            icons,
            { scale: 0, rotation: -120, autoAlpha: 0, filter: "blur(10px)" },
            {
                scale: 1,
                rotation: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.8)",
                clearProps: "transform,filter"
            },
            0.45
        )
        .fromTo(
            texts,
            { y: 24, autoAlpha: 0, filter: "blur(10px)" },
            { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, stagger: 0.1, clearProps: "transform,filter" },
            0.6
        );

    root.classList.add("is-ready");

    // Если на странице есть первый экран — ждём его появления, иначе стартуем сразу
    const waitHero = document.querySelector("[data-hero]") ? heroIntro : Promise.resolve();
    onEnter(root, () => waitHero.then(() => tl.play()));
}
