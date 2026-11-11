export function inputFile(context = document) {
    const roots = context.querySelectorAll(".input-file");
    if (!roots.length) return;

    roots.forEach((root) => {
        if (root.dataset.init === "true") return;
        root.dataset.init = "true";

        const input = root.querySelector('input[type="file"]');
        const textEl = root.querySelector(".text");
        const errorEl = root.querySelector(".error");

        if (!input || !textEl) return;

        const placeholder = textEl.dataset.placeholder || "Прикрепить файл";
        const hint = textEl.dataset.hint || "";
        const maxSizeKB = parseInt(input.dataset.maxSize, 10) || 200;
        const maxSizeBytes = maxSizeKB * 1024;
        const errorSize = input.dataset.errorSize || "Файл слишком большой";
        const errorType = input.dataset.errorType || "Недопустимый формат файла";
        const accept = input.getAttribute("accept");

        const controller = new AbortController();
        const { signal } = controller;

        const showError = (message) => {
            if (errorEl) errorEl.textContent = message;
            root.classList.add("error");
            root.classList.remove("has-file");
            input.value = "";
            textEl.innerHTML = `${placeholder}${hint ? ` <small>${hint}</small>` : ""}`;
        };

        const clearError = () => {
            if (errorEl) errorEl.textContent = "";
            root.classList.remove("error");
        };

        const getFileExtension = (filename) => {
            return filename.split(".").pop().toLowerCase();
        };

        const isExtensionAllowed = (filename) => {
            if (!accept) return true;
            const extensions = accept.split(",").map((ext) => ext.trim().replace(".", "").toLowerCase());
            const fileExt = getFileExtension(filename);
            return extensions.includes(fileExt);
        };

        const handleChange = () => {
            clearError();

            if (input.files && input.files.length > 0) {
                const file = input.files[0];

                // Check file size
                if (file.size > maxSizeBytes) {
                    showError(errorSize);
                    return;
                }

                // Check file extension
                if (!isExtensionAllowed(file.name)) {
                    showError(errorType);
                    return;
                }

                textEl.innerHTML = file.name;
                root.classList.add("has-file");
            } else {
                textEl.innerHTML = `${placeholder}${hint ? ` <small>${hint}</small>` : ""}`;
                root.classList.remove("has-file");
            }
        };

        input.addEventListener("change", handleChange, { signal });

        root.addEventListener(
            "destroy",
            () => {
                controller.abort();
            },
            { once: true }
        );
    });
}
