import Swiper from "swiper";
import { Navigation, Pagination, EffectFade, A11y } from "swiper/modules";
import { gsap, onEnter, reducedMotion, heroIntroDone } from "../../../js/utils/reveal.js";
import { isSingleSlide } from "../../../js/utils/slider.js";

// --------------------------------------
// Анимации первого экрана (GSAP)
// Текст выезжает снизу по очереди: заголовок → подзаголовок → пункты списка → кнопка → стрелки.
// Фото продукта «проявляется» внутри маски: из размытия, с приближением и сдвигом справа.
// Стартует, когда первый экран в зоне видимости (js/utils/reveal.js); при смене слайдов не повторяется.
// --------------------------------------

// Элементы текста слайда в порядке появления (пункты списка — по одному)
function textItems(slide) {
    return [
        slide.querySelector(".hero-title"),
        slide.querySelector(".hero-subtitle"),
        ...slide.querySelectorAll(".hero-list li"),
        slide.querySelector(".hero-button")
    ].filter(Boolean);
}

// Ждём загрузку фото (lozad), но не дольше timeout — анимация не должна зависать
function imageReady(img, timeout = 1200) {
    return new Promise((resolve) => {
        if (!img || (img.complete && img.naturalWidth && img.dataset.loaded === "true")) return resolve();
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        setTimeout(done, timeout);
    });
}

// Без прозрачности: фото отрисовывается сразу после загрузки (под прелоадером), и Google
// засчитывает LCP в этот момент. Если начинать с opacity: 0, LCP сдвинется на конец прелоадера.
const PICTURE_FROM = { xPercent: 10, scale: 1.18, filter: "blur(16px) brightness(1.35)" };

// Появление первого экрана: timeline на паузе (элементы сразу в стартовом состоянии),
// фото — отдельно, когда загрузится. Возвращает функцию запуска.
function buildIntro(root, slide) {
    const controls = root.querySelectorAll(".hero-arrows .slider-arrow, .hero-pagination");
    const wordmark = root.querySelector(".hero-wordmark img");
    const picture = slide.querySelector(".hero-picture img");

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", clearProps: "transform" } });
    // Текст — плавно и равномерно: мягкое замедление (sine) без резкого рывка в начале
    // и «торможения» в конце, одинаковый шаг между элементами
    const items = textItems(slide);
    const TEXT_STAGGER = 0.1;
    tl.fromTo(
        items,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: TEXT_STAGGER, ease: "sine.out" },
        0
    );
    if (controls.length) {
        tl.fromTo(
            controls,
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, stagger: TEXT_STAGGER, ease: "sine.out" },
            items.length * TEXT_STAGGER
        );
    }
    if (wordmark) {
        tl.fromTo(wordmark, { y: -80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2 }, 0.3);
    }
    // Следующий блок («Преимущества») стартует, когда первый экран в основном появился
    tl.call(heroIntroDone, null, 0.9);

    if (picture) gsap.set(picture, PICTURE_FROM);

    return () => {
        tl.play();
        if (!picture) return;
        imageReady(picture).then(() => {
            gsap.to(picture, {
                xPercent: 0,
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 1.3,
                ease: "expo.out",
                clearProps: "transform,filter"
            });
        });
    };
}

export function hero(context = document) {
    const root = context.querySelector("[data-hero]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    const animate = !reducedMotion();
    const slider = root.querySelector(".hero-slider");
    const single = isSingleSlide(root, slider);

    // Стили до анимации прячут элементы (.hero:not(.is-ready)) — снимаем после того, как GSAP выставил стартовые значения
    const firstSlide = root.querySelector(".hero-slide");
    if (animate && firstSlide) {
        const play = buildIntro(root, firstSlide);
        onEnter(root, play);
    } else {
        heroIntroDone();
    }
    root.classList.add("is-ready");

    if (single) return;

    const swiper = new Swiper(slider, {
        modules: [Navigation, Pagination, EffectFade, A11y],
        effect: "fade",
        fadeEffect: { crossFade: true },
        loop: true,
        speed: 600,
        navigation: {
            prevEl: root.querySelector(".hero-prev"),
            nextEl: root.querySelector(".hero-next")
        },
        pagination: {
            el: root.querySelector(".hero-pagination"),
            clickable: true
        },
        a11y: {
            prevSlideMessage: "Предыдущий слайд",
            nextSlideMessage: "Следующий слайд",
            paginationBulletMessage: "Перейти к слайду {{index}}"
        }
    });

    root.addEventListener("destroy", () => swiper.destroy(), { once: true });
}
