// Аккордеон: открыт может быть один пункт, высота ответа анимируется.
// Закрытый ответ скрыт атрибутом hidden (не читается скринридером и не фокусируется).
export function accordion(context = document) {
    const roots = context.querySelectorAll('[data-accordion="component"]');
    if (!roots.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    roots.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const controller = new AbortController();
        const { signal } = controller;

        const items = root.querySelectorAll("[data-accordion-item]");
        if (!items.length) return;

        const parts = (item) => ({ panel: item.querySelector(".panel"), collapse: item.querySelector(".collapse") });

        // После анимации снимаем фиксированную высоту, чтобы ответ подстраивался под ширину экрана
        const onEnd = (item, open) => {
            const { collapse } = parts(item);
            collapse.style.height = "";
            if (!open) collapse.hidden = true;
        };

        const animate = (item, open) => {
            const { panel, collapse } = parts(item);
            item.classList.toggle("is-open", open);
            panel.setAttribute("aria-expanded", String(open));

            if (reduceMotion.matches) {
                collapse.hidden = !open;
                return;
            }

            collapse.hidden = false;
            const from = open ? 0 : collapse.offsetHeight;
            const to = open ? collapse.scrollHeight : 0;
            collapse.style.height = `${from}px`;
            collapse.getBoundingClientRect();
            collapse.style.height = `${to}px`;

            // Завершаем по transitionend, а если его не будет (переход отключён, вкладка в фоне) — по таймеру
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                if (item.classList.contains("is-open") === open) onEnd(item, open);
            };
            const duration = parseFloat(getComputedStyle(collapse).transitionDuration) * 1000 || 0;
            collapse.addEventListener("transitionend", (event) => event.target === collapse && finish(), {
                once: true,
                signal
            });
            setTimeout(finish, duration + 50);
        };

        items.forEach((item) => {
            parts(item).panel.addEventListener(
                "click",
                () => {
                    const open = !item.classList.contains("is-open");
                    items.forEach((other) => {
                        if (other !== item && other.classList.contains("is-open")) animate(other, false);
                    });
                    animate(item, open);
                },
                { signal }
            );
        });

        root.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
