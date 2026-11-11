import { bind as niceSelectBind } from "nice-select2";

export function select(context = document) {
    const roots = context.querySelectorAll(".select");
    if (!roots.length) return;

    roots.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const controller = new AbortController();
        // const { signal } = controller;

        // Initialize NiceSelect on all selects
        const selects = root.querySelectorAll(".select select");
        const niceSelectInstances = [];

        selects.forEach((select) => {
            const placeholder = root.dataset.placeholder || "";
            const instance = niceSelectBind(select, {
                searchable: false,
                placeholder: placeholder
            });
            niceSelectInstances.push(instance);
        });

        // Cleanup
        root.addEventListener(
            "destroy",
            () => {
                controller.abort();
                niceSelectInstances.forEach((instance) => instance.destroy());
            },
            { once: true }
        );
    });
}
