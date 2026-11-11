export function accordion(context = document) {
    const roots = context.querySelectorAll('[data-accordion="component"]');
    if (!roots.length) return;

    roots.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const controller = new AbortController();
        const { signal } = controller;

        const items = root.querySelectorAll("[data-accordion-item]");
        if (!items.length) return;

        const collapseItem = (item) => {
            const panel = item.querySelector(".panel");
            const collapse = item.querySelector(".collapse");
            if (collapse && panel) {
                collapse.style.maxHeight = null;
                item.classList.remove("is-open");
                panel.setAttribute("aria-expanded", "false");
            }
        };

        const expandItem = (item) => {
            const panel = item.querySelector(".panel");
            const collapse = item.querySelector(".collapse");
            if (collapse && panel) {
                collapse.style.maxHeight = `${collapse.scrollHeight + 1}px`;
                item.classList.add("is-open");
                panel.setAttribute("aria-expanded", "true");
            }
        };

        const toggleItem = (targetItem) => {
            const isOpen = targetItem.classList.contains("is-open");
            items.forEach(collapseItem);
            if (!isOpen) {
                expandItem(targetItem);
            }
        };

        items.forEach((item) => {
            const panel = item.querySelector(".panel");
            if (panel) {
                panel.addEventListener("click", () => toggleItem(item), { signal });
            }
        });

        // Open first item if aria-expanded is true
        const firstPanel = items[0]?.querySelector(".panel");
        if (firstPanel?.getAttribute("aria-expanded") === "true") {
            expandItem(items[0]);
        }

        root.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
