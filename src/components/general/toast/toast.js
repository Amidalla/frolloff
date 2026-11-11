let container = null;

function getContainer() {
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Показать toast-уведомление
 * @param {string} message - Текст уведомления
 * @param {object} options - Настройки
 * @param {"default"|"success"|"error"} options.type - Тип уведомления
 * @param {number} options.duration - Длительность показа в мс
 */
export function showToast(message, { type = "default", duration = 3000 } = {}) {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;

    getContainer().appendChild(el);

    setTimeout(() => {
        el.classList.add("is-hiding");
        el.addEventListener("animationend", () => el.remove());
    }, duration);
}
