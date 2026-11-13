import { gsap } from "gsap";

// Плавная смена вкладки (параметр animate макроса → data-tabs-animate), как во «Вкусах»:
// содержимое новой вкладки въезжает со стороны переключения (вперёд — справа, назад — слева)
// из размытия с лёгким приближением. Во «Вкусах» своя анимация (flavors.js), там animate не включён.
function animatePanel(panel, dir) {
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf(panel);
    gsap.fromTo(
        panel,
        { x: 80 * dir, scale: 1.04, autoAlpha: 0, filter: "blur(12px)" },
        {
            x: 0,
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform,filter"
        }
    );
}

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

        const animate = root.hasAttribute("data-tabs-animate");
        let current = [...navItems].findIndex((item) => item.classList.contains("is-active"));

        const activateTab = (index) => {
            const changed = index !== current;
            const dir = index > current ? 1 : -1;
            current = index;

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

            if (animate && changed) animatePanel(panels[index], dir);

            // Блоки могут реагировать на смену вкладки (например, анимация во «Вкусах»)
            root.dispatchEvent(new CustomEvent("tabs:change", { detail: { index, panel: panels[index] } }));
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
