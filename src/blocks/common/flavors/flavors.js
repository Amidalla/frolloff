import Swiper from "swiper";
import { Navigation, EffectFade, A11y } from "swiper/modules";
import { isSingleSlide } from "../../../js/utils/slider.js";
import { gsap, onEnter, reducedMotion, addHeaderReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// «Выбирайте настроение каждый день»: слайдеры вкусов во вкладках + анимации (GSAP)
// Появление секции (когда она в экране): шапка как на bip-it → вкладки → слайдер проявляется
// из размытия с приближением (как фото первого экрана) → стрелки и кнопка → название и бейдж (после слайда).
// При смене слайда / вкладки: сначала проявляется слайд, потом в нём выезжают название и бейдж.
// Фото в слайдах двигается за мышью (data-attract на img) — Swiper это не затрагивает.
// --------------------------------------

const animate = () => !reducedMotion();

// Порядок: сначала проявляется слайд, потом в нём выезжает название.
const SLIDE_SPEED = 0.5; // скорость смены слайда Swiper, с

// Название и бейдж слайда: скрыты сразу, после delay выезжают снизу с проявлением
function animateHead(slide, delay = 0) {
    if (!slide || !animate()) return null;
    const items = slide.querySelectorAll(".head .name, .head .badge");
    if (!items.length) return null;
    gsap.killTweensOf(items);
    return gsap.fromTo(
        items,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, delay, ease: "power3.out", clearProps: "transform" }
    );
}

// Смена вкладки: слайдер новой вкладки въезжает со стороны переключения
// из размытия и с лёгким приближением (как появление слайдеров на сайте), стрелки проявляются следом
function animatePanel(panel, dir) {
    if (!panel || !animate()) return;
    const swiperEl = panel.querySelector(".swiper");
    const arrows = panel.querySelectorAll(".flavors-arrows .slider-arrow");
    if (swiperEl) {
        gsap.killTweensOf(swiperEl);
        gsap.fromTo(
            swiperEl,
            { x: 80 * dir, scale: 1.04, autoAlpha: 0, filter: "blur(12px)" },
            {
                x: 0,
                scale: 1,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.7,
                ease: "power3.out",
                clearProps: "transform,filter"
            }
        );
    }
    if (arrows.length) {
        gsap.fromTo(arrows, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.3, ease: "power2.out" });
    }
}

// Активный слайд видимой вкладки (если Swiper не запущен — первый слайд)
function activeSlide(panel) {
    if (!panel) return null;
    return panel.querySelector(".swiper-slide-active") || panel.querySelector(".swiper-slide");
}

function initSliders(context) {
    context.querySelectorAll("[data-flavors-slider]").forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";
        if (isSingleSlide(root)) return;

        const swiper = new Swiper(root.querySelector(".swiper"), {
            modules: [Navigation, EffectFade, A11y],
            slidesPerView: 1,
            effect: "fade",
            fadeEffect: { crossFade: true },
            speed: SLIDE_SPEED * 1000,
            // Слайдер во вкладке может быть скрыт — пересчитываем при показе
            observer: true,
            observeParents: true,
            navigation: {
                prevEl: root.querySelector(".flavors-prev"),
                nextEl: root.querySelector(".flavors-next")
            },
            a11y: {
                prevSlideMessage: "Предыдущий вкус",
                nextSlideMessage: "Следующий вкус"
            },
            on: {
                // Название нового слайда прячем сразу и показываем, когда слайд проявился
                slideChange(instance) {
                    animateHead(instance.slides[instance.activeIndex], SLIDE_SPEED);
                }
            }
        });

        root.addEventListener("destroy", () => swiper.destroy(), { once: true });
    });
}

function initAnimation(section) {
    if (section.dataset.animInit === "true") return;
    section.dataset.animInit = "true";

    if (!animate()) {
        section.classList.add("is-ready");
        return;
    }

    const tabsRoot = section.querySelector(".flavors-tabs");
    const panel =
        section.querySelector(".flavors-tabs .panel.is-active") || section.querySelector(".flavors-tabs .panel");
    const swiperEl = panel && panel.querySelector(".swiper");
    const arrows = panel ? panel.querySelectorAll(".flavors-arrows .slider-arrow") : [];
    const head = activeSlide(panel);
    const headItems = head ? head.querySelectorAll(".head .name, .head .badge") : [];

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    addHeaderReveal(tl, section.querySelector(".flavors-header"), 0);
    tl.fromTo(
        section.querySelector(".flavors-tabs .nav-wrap"),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, clearProps: "transform" },
        0.3
    );
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
    if (headItems.length) {
        tl.fromTo(
            headItems,
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, clearProps: "transform" },
            1.1
        );
    }
    tl.fromTo(
        [...arrows, section.querySelector(".flavors-action")].filter(Boolean),
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, clearProps: "transform" },
        0.85
    );

    // Смена вкладки — название и бейдж активного слайда новой вкладки выезжают снизу
    if (tabsRoot) {
        let prevIndex = 0;
        tabsRoot.addEventListener("tabs:change", (event) => {
            const { index, panel } = event.detail;
            const dir = index >= prevIndex ? 1 : -1; // вперёд — новая вкладка приходит справа, назад — слева
            prevIndex = index;
            animatePanel(panel, dir);
            animateHead(activeSlide(panel), 0.3);
        });
    }

    section.classList.add("is-ready");
    onEnter(section, () => tl.play());
}

export function flavors(context = document) {
    initSliders(context);
    const section = context.querySelector("[data-flavors]");
    if (section) initAnimation(section);
}
