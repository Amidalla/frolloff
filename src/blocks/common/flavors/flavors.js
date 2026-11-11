import Swiper from "swiper";
import { Navigation, EffectFade, A11y } from "swiper/modules";

// Слайдеры вкусов внутри вкладок (по одному на граммовку)
export function flavors(context = document) {
    const sliders = context.querySelectorAll("[data-flavors-slider]");
    if (!sliders.length) return;

    sliders.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const swiper = new Swiper(root.querySelector(".swiper"), {
            modules: [Navigation, EffectFade, A11y],
            slidesPerView: 1,
            effect: "fade",
            fadeEffect: { crossFade: true },
            speed: 500,
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
            }
        });

        root.addEventListener("destroy", () => swiper.destroy(), { once: true });
    });
}
