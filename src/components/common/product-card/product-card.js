// Карточка товара. На десктопе с мышью раскрывается по наведению (только CSS).
// На устройствах без ховера (и уже 1024px) карточка не раскрывается — клик по ней
// шлёт событие "product-card:open" (detail: { card }) для модального окна товара,
// которое будет сделано позже. Кнопка «Купить» внутри работает как обычная ссылка.
const tapMode = window.matchMedia("(hover: none), (width < 1024px)");

export function productCard(context = document) {
    context.querySelectorAll(".product-card").forEach((card) => {
        if (card.dataset.init === "true") return;
        card.dataset.init = "true";

        const controller = new AbortController();
        const { signal } = controller;

        card.addEventListener(
            "click",
            (event) => {
                if (!tapMode.matches || event.target.closest(".buy")) return;
                card.dispatchEvent(new CustomEvent("product-card:open", { bubbles: true, detail: { card } }));
            },
            { signal }
        );

        card.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
