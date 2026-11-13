import { openModal } from "../../general/modal/modal.js";

// Модалка «Где купить»:
// — на десктопе открывается кнопкой «Купить на маркетплейсах» в раскрытой карточке товара;
// — на устройствах без ховера — тапом по карточке (событие product-card:open из product-card.js).
// — кнопкой «Где купить» ([data-shop-open]) под слайдерами вкусов и витаминов — ссылки активного слайда.
// Ссылки на маркетплейсы берутся из data-ozon / data-wb / data-ym карточки.
let ready = false;

function openFor(card) {
    const root = document.getElementById("modal-shop");
    if (!root) return;

    root.querySelectorAll("[data-market]").forEach((link) => {
        link.href = (card && card.dataset[link.dataset.market]) || "#";
    });
    openModal("modal-shop");
}

export function modalShop() {
    if (ready || !document.getElementById("modal-shop")) return;
    ready = true;

    document.addEventListener("product-card:open", (event) => openFor(event.detail.card));

    document.addEventListener("click", (event) => {
        const buy = event.target.closest(".product-card .buy");
        if (buy) {
            event.preventDefault();
            openFor(buy.closest(".product-card"));
            return;
        }

        // Кнопка «Где купить» под слайдером (вкусы, витамины) — ссылки текущего слайда
        const trigger = event.target.closest("[data-shop-open]");
        if (!trigger) return;
        event.preventDefault();
        openFor(currentSlide(trigger.closest("section") || document));
    });
}

// Активный слайд в видимой вкладке секции (у неактивной вкладки панель hidden, offsetParent = null)
function currentSlide(section) {
    const visible = (el) => el.offsetParent !== null;
    const slides = [...section.querySelectorAll(".swiper-slide[data-ozon]")].filter(visible);
    return slides.find((slide) => slide.classList.contains("swiper-slide-active")) || slides[0] || null;
}
