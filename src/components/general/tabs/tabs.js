export function tabs(context = document) {
    const roots = context.querySelectorAll('[data-component="tabs"]');
    if (!roots.length) return;

    roots.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const controller = new AbortController();
        const { signal } = controller;

        const navItems = root.querySelectorAll("[data-tabs-nav]");
        const panels = root.querySelectorAll("[data-tabs-panel]");

        if (!navItems.length || !panels.length) return;

        const activateTab = (index) => {
            navItems.forEach((item, i) => {
                const isActive = i === index;
                item.classList.toggle("is-active", isActive);
                item.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            panels.forEach((panel, i) => {
                const isActive = i === index;
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
            });
        };

        navItems.forEach((item, index) => {
            item.addEventListener(
                "click",
                () => {
                    activateTab(index);
                },
                { signal }
            );

            item.addEventListener(
                "keydown",
                (e) => {
                    let newIndex;

                    if (e.key === "ArrowRight") {
                        newIndex = (index + 1) % navItems.length;
                    } else if (e.key === "ArrowLeft") {
                        newIndex = (index - 1 + navItems.length) % navItems.length;
                    } else if (e.key === "Home") {
                        newIndex = 0;
                    } else if (e.key === "End") {
                        newIndex = navItems.length - 1;
                    } else {
                        return;
                    }

                    e.preventDefault();
                    navItems[newIndex].focus();
                    activateTab(newIndex);
                },
                { signal }
            );
        });

        root.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
