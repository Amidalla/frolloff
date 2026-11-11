import Swiper from "swiper";
import { Navigation, Pagination, EffectFade, A11y } from "swiper/modules";

export function hero(context = document) {
    const root = context.querySelector("[data-hero]");
    if (!root || root.dataset.init === "true") return;
    root.dataset.init = "true";

    const slider = root.querySelector(".hero-slider");
    const slidesCount = slider.querySelectorAll(".swiper-slide").length;
    if (slidesCount < 2) return;

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
