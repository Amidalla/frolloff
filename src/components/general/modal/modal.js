import { Fancybox } from "@fancyapps/ui/dist/fancybox/";

// Открыть модальное окно по id (разметка — макрос components/general/modal).
// Крестик внутри окна — свой (data-fancybox-close), встроенный у Fancybox отключён.
export function openModal(id, options = {}) {
    if (!document.getElementById(id)) return;

    Fancybox.close();
    Fancybox.show([{ src: `#${id}`, type: "inline" }], {
        mainClass: "modal-fancybox",
        closeButton: false,
        dragToClose: false,
        Hash: false,
        ...options
    });
}

// Кнопки/ссылки с data-modal="id" открывают модалку
export function modal(context = document) {
    context.querySelectorAll("[data-modal]").forEach((trigger) => {
        if (trigger.dataset.init === "true") return;
        trigger.dataset.init = "true";

        const controller = new AbortController();
        trigger.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                openModal(trigger.dataset.modal);
            },
            { signal: controller.signal }
        );

        trigger.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
