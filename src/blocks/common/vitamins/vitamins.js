import Swiper from "swiper";
import { Navigation, EffectFade, A11y } from "swiper/modules";
import { isSingleSlide } from "../../../js/utils/slider.js";
import { gsap, onEnter, reducedMotion, addHeaderReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// «Витамины в ежедневном рационе»: слайдер товаров + появление (GSAP), по аналогии с «Вкусами».
// Когда секция в экране: шапка как на bip-it → слайдер проявляется из размытия с приближением
// (как фото первого экрана) → стрелки и кнопка; лист-контур проявляется.
// Фото слайдов и лист двигаются за мышью (data-attract) — их x/y здесь не трогаем.
// --------------------------------------

function initAnimation(section) {
    if (section.dataset.animInit === "true") return;
    section.dataset.animInit = "true";

    if (reducedMotion()) {
        section.classList.add("is-ready");
        return;
    }

    const swiperEl = section.querySelector(".vitamins-slider .swiper");
    const leaf = section.querySelector(".vitamins-leaf");
    const controls = [
        ...section.querySelectorAll(".vitamins-arrows .slider-arrow"),
        section.querySelector(".vitamins-action")
    ].filter(Boolean);

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    addHeaderReveal(tl, section.querySelector(".vitamins-header"), 0);
    if (leaf) tl.fromTo(leaf, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0.3);
    if (swiperEl) {
        tl.fromTo(
            swiperEl,
            { scale: 1.12, autoAlpha: 0, filter: "blur(16px) brightness(1.2)" },
            {
                scale: 1,
                autoAlpha: 1,
                filter: "blur(0px) brightness(1)",
                duration: 1.3,
                ease: "expo.out",
                clearProps: "transform,filter"
            },
            0.4
        );
    }
    if (controls.length) {
        tl.fromTo(
            controls,
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, clearProps: "transform" },
            0.85
        );
    }

    section.classList.add("is-ready");
    onEnter(section, () => tl.play());
}

// Слайдер товаров «Витамины в ежедневном рационе»
export function vitamins(context = document) {
    const section = context.querySelector("[data-vitamins]");
    if (section) initAnimation(section);

    const root = context.querySelector("[data-vitamins-slider]");
    if (!root || root.dataset.init === "true") return;

    root.dataset.init = "true";
    if (isSingleSlide(root)) return;

    const swiper = new Swiper(root.querySelector(".swiper"), {
        modules: [Navigation, EffectFade, A11y],
        slidesPerView: 1,
        effect: "fade",
        fadeEffect: { crossFade: true },
        speed: 500,
        navigation: {
            prevEl: root.querySelector(".vitamins-prev"),
            nextEl: root.querySelector(".vitamins-next")
        },
        a11y: {
            prevSlideMessage: "Предыдущий товар",
            nextSlideMessage: "Следующий товар"
        }
    });

    root.addEventListener("destroy", () => swiper.destroy(), { once: true });
}
