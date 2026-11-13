import Swiper from "swiper";
import { Navigation, A11y } from "swiper/modules";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import { isSingleSlide } from "../../../js/utils/slider.js";
import { gsap, onEnter, reducedMotion, addHeaderReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Сертификаты» (GSAP), как на bip-it: заголовок снизу, затем слайдер целиком
// поднимается и проявляется (слайды по отдельности не анимируются), стрелки проявляются
// (у них свой transform для центрирования — анимируем только прозрачность).
// --------------------------------------

function initAnimation(section) {
    if (section.dataset.animInit === "true") return;
    section.dataset.animInit = "true";

    if (reducedMotion()) {
        section.classList.add("is-ready");
        return;
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    // Заголовок и слайдер — ещё и из лёгкого размытия
    addHeaderReveal(tl, section.querySelector(".certificates-header"), 0, { blur: 8 });
    const swiperEl = section.querySelector(".certificates-slider .swiper");
    if (swiperEl) {
        tl.fromTo(
            swiperEl,
            { y: 60, autoAlpha: 0, filter: "blur(8px)" },
            { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.9, clearProps: "transform,filter" },
            0.25
        );
    }
    const arrows = section.querySelectorAll(".certificates-arrows .slider-arrow");
    if (arrows.length) tl.fromTo(arrows, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.6);

    section.classList.add("is-ready");
    onEnter(section, () => tl.play());
}

// Слайдер сертификатов: 4 карточки (≤767 — 2); документ открывается в галерее Fancybox.
// Отступ между карточками берём из CSS (--certificates-gap через column-gap).
export function certificates(context = document) {
    const section = context.querySelector("[data-certificates]");
    if (section) initAnimation(section);

    const root = context.querySelector("[data-certificates-slider]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    // Hash: false — не дописывать #certificates-N в адрес страницы
    Fancybox.bind(root, '[data-fancybox="certificates"]', {
        Hash: false,
        Carousel: { infinite: false }
    });

    if (isSingleSlide(root)) return;

    const gap = () => parseFloat(getComputedStyle(root).columnGap) || 12;

    const swiper = new Swiper(root.querySelector(".swiper"), {
        modules: [Navigation, A11y],
        slidesPerView: 2,
        spaceBetween: gap(),
        speed: 500,
        breakpoints: {
            768: { slidesPerView: 4 }
        },
        navigation: {
            prevEl: root.querySelector(".certificates-prev"),
            nextEl: root.querySelector(".certificates-next")
        },
        a11y: {
            prevSlideMessage: "Предыдущие сертификаты",
            nextSlideMessage: "Следующие сертификаты"
        },
        on: {
            beforeResize(s) {
                s.params.spaceBetween = gap();
            }
        }
    });

    root.addEventListener(
        "destroy",
        () => {
            swiper.destroy();
            Fancybox.unbind(root);
        },
        { once: true }
    );
}
