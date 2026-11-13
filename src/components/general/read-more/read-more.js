// «Читать всё»: плавно раскрывает/сворачивает скрытую часть текста.
// Разметка:
//   <div data-read-more>
//       <div data-read-more-content id="...">…</div>
//       <button data-read-more-toggle data-text-open="Читать всё" data-text-close="Свернуть" aria-controls="..." aria-expanded="false">Читать всё</button>
//   </div>
// Что скрыто в свёрнутом виде — решает CSS блока (селектор :not(.is-open)).
export function readMore(context = document) {
    context.querySelectorAll("[data-read-more]").forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const content = root.querySelector("[data-read-more-content]");
        const toggle = root.querySelector("[data-read-more-toggle]");
        if (!content || !toggle) return;

        const controller = new AbortController();
        const { signal } = controller;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        // Высота содержимого в нужном состоянии (без анимации)
        const measure = (open) => {
            const wasOpen = root.classList.contains("is-open");
            const prevHeight = content.style.height;
            root.classList.toggle("is-open", open);
            content.style.height = "";
            const height = content.offsetHeight;
            root.classList.toggle("is-open", wasOpen);
            content.style.height = prevHeight;
            return height;
        };

        const finish = () => {
            content.style.height = "";
            content.style.overflow = "";
            root.classList.remove("is-animating");
        };

        const setOpen = (open) => {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.textContent = open ? toggle.dataset.textClose : toggle.dataset.textOpen;

            if (reduceMotion.matches) {
                root.classList.toggle("is-open", open);
                finish();
                return;
            }

            const from = content.offsetHeight;
            const to = measure(open);

            // При раскрытии показываем текст сразу, при сворачивании — прячем после анимации
            if (open) root.classList.add("is-open");
            root.classList.add("is-animating");
            content.style.overflow = "hidden";
            content.style.height = `${from}px`;
            content.getBoundingClientRect();
            content.style.height = `${to}px`;

            content.addEventListener(
                "transitionend",
                (event) => {
                    if (event.target !== content) return;
                    if (!open) root.classList.remove("is-open");
                    finish();
                },
                { once: true, signal }
            );
        };

        toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"), { signal });

        root.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
