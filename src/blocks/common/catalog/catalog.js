import Swiper from "swiper";
import { Navigation, A11y } from "swiper/modules";
import { isSingleSlide } from "../../../js/utils/slider.js";
import { gsap, onEnter, reducedMotion, addRiseReveal, addDropReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Выбирайте то, что ближе» (GSAP), как на bip-it
// Заголовок секции поднимается снизу. У каждой группы свой триггер: золотой подзаголовок снизу,
// затем карточки по очереди выплывают сверху из лёгкого размытия и прозрачности, следом стрелки.
// --------------------------------------

function initAnimation(section) {
    if (section.dataset.animInit === "true") return;
    section.dataset.animInit = "true";

    if (reducedMotion()) {
        section.classList.add("is-ready");
        return;
    }

    const titleTl = addRiseReveal(gsap.timeline({ paused: true }), section.querySelectorAll(".catalog-title"));
    onEnter(section, () => titleTl.play());

    section.querySelectorAll(".catalog-group").forEach((group) => {
        const tl = gsap.timeline({ paused: true });
        addRiseReveal(tl, group.querySelectorAll(".catalog-group-title"), 0);
        addDropReveal(tl, group.querySelectorAll(".product-card"), 0.2);
        const arrows = group.querySelectorAll(".catalog-arrows .slider-arrow");
        if (arrows.length) {
            tl.fromTo(
                arrows,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
                0.6
            );
        }
        onEnter(group, () => tl.play());
    });

    section.classList.add("is-ready");
}

// Слайдер группы каталога: 4 карточки на десктопе, 2 на планшете и мобильном.
// При 4 товарах и меньше Swiper не запускается — группа стоит сеткой без стрелок.
// Отступ между карточками берём из CSS (--catalog-gap), чтобы совпадал с сеткой групп.
export function catalog(context = document) {
    const section = context.querySelector("[data-catalog]");
    if (section) initAnimation(section);

    context.querySelectorAll("[data-catalog-slider]").forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";
        if (isSingleSlide(root)) return;

        // 4 товара и меньше — листать нечего: сетка без стрелок, Swiper не нужен
        if (root.querySelectorAll(".swiper-slide").length <= 4) {
            root.classList.add("is-static");
            return;
        }

        // column-gap у .catalog-slider = var(--catalog-gap), браузер отдаёт уже вычисленные px
        const gap = () => parseFloat(getComputedStyle(root).columnGap) || 24;

        const swiper = new Swiper(root.querySelector(".swiper"), {
            modules: [Navigation, A11y],
            slidesPerView: 2,
            spaceBetween: gap(),
            speed: 500,
            breakpoints: {
                1024: { slidesPerView: 4 }
            },
            navigation: {
                prevEl: root.querySelector(".catalog-prev"),
                nextEl: root.querySelector(".catalog-next")
            },
            a11y: {
                prevSlideMessage: "Предыдущие товары",
                nextSlideMessage: "Следующие товары"
            },
            on: {
                beforeResize(s) {
                    s.params.spaceBetween = gap();
                }
            }
        });

        root.addEventListener("destroy", () => swiper.destroy(), { once: true });
    });
}
