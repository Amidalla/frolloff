// --------------------------------------
// Выпадающий список поля-select в стиле сайта (form-field.njk, класс .is-select).
// Нативный <select> остаётся полем: он виден, участвует в проверке (form.js) и отправке формы,
// на него ставится фокус. Вместо системного списка (его нельзя стилизовать) на устройствах
// с мышью открывается свой список .field-dropdown; на телефонах — системный выбор (он там удобнее).
// Клавиатура: стрелки / Enter / пробел открывают и выбирают, Esc и Tab закрывают.
// --------------------------------------

const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function formField(context = document) {
    context.querySelectorAll(".form-field.is-select").forEach((field) => {
        if (field.dataset.init === "true") return;
        const select = field.querySelector("select");
        if (!select || !canHover()) return;
        field.dataset.init = "true";

        const controller = new AbortController();
        const { signal } = controller;
        const listId = `${select.id}-list`;

        // Список строится из <option> / <optgroup> селекта
        const list = document.createElement("div");
        list.className = "field-dropdown";
        list.id = listId;
        list.setAttribute("role", "listbox");
        list.setAttribute("aria-labelledby", select.id);
        // Прокручивается внутренний слой: карточка обрезает его по своему скруглению,
        // полоса прокрутки не упирается в углы
        const scroller = document.createElement("div");
        scroller.className = "field-dropdown-scroll";
        list.appendChild(scroller);

        const items = [];
        const addOption = (option, parent) => {
            if (option.disabled && option.value === "") return; // плейсхолдер в список не выводим
            const item = document.createElement("div");
            item.className = "field-option";
            item.setAttribute("role", "option");
            item.id = `${listId}-${items.length}`;
            item.dataset.value = option.value;
            item.textContent = option.textContent;
            parent.appendChild(item);
            items.push(item);
        };
        [...select.children].forEach((child) => {
            if (child.tagName === "OPTGROUP") {
                const group = document.createElement("div");
                group.className = "field-group";
                group.setAttribute("role", "group");
                const title = document.createElement("div");
                title.className = "field-group-title";
                title.textContent = child.label;
                group.setAttribute("aria-label", child.label);
                group.appendChild(title);
                [...child.children].forEach((option) => addOption(option, group));
                scroller.appendChild(group);
            } else {
                addOption(child, scroller);
            }
        });
        field.appendChild(list);

        select.setAttribute("aria-haspopup", "listbox");
        select.setAttribute("aria-controls", listId);
        select.setAttribute("aria-expanded", "false");

        let active = -1;
        const isOpen = () => field.classList.contains("is-open");

        const setActive = (index) => {
            items.forEach((item, i) => item.classList.toggle("is-active", i === index));
            active = index;
            if (index >= 0) {
                select.setAttribute("aria-activedescendant", items[index].id);
                items[index].scrollIntoView({ block: "nearest" });
            } else {
                select.removeAttribute("aria-activedescendant");
            }
        };

        // Если под полем не хватает места в окне — список раскрывается вверх; высота — по доступному месту
        const place = () => {
            const rect = select.getBoundingClientRect();
            const header = document.querySelector(".header");
            const top = header ? header.getBoundingClientRect().bottom : 0;
            const gap = 16;
            const below = window.innerHeight - rect.bottom - gap;
            const above = rect.top - top - gap;
            const wanted = Math.min(scroller.scrollHeight, 320);
            const up = below < wanted && above > below;
            field.classList.toggle("is-up", up);
            scroller.style.maxHeight = `${Math.max(160, Math.min(320, up ? above : below))}px`;
        };

        const open = () => {
            if (isOpen()) return;
            place();
            const current = items.findIndex((item) => item.dataset.value === select.value && select.value !== "");
            items.forEach((item, i) => {
                const selected = i === current;
                item.classList.toggle("is-selected", selected);
                item.setAttribute("aria-selected", String(selected));
            });
            field.classList.add("is-open");
            select.setAttribute("aria-expanded", "true");
            setActive(current >= 0 ? current : 0);
        };

        const close = () => {
            if (!isOpen()) return;
            field.classList.remove("is-open");
            select.setAttribute("aria-expanded", "false");
            setActive(-1);
        };

        const choose = (index) => {
            const item = items[index];
            if (!item) return;
            select.value = item.dataset.value;
            // form.js проверяет поле по change
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
            close();
            select.focus();
        };

        // Мышь: вместо системного списка — свой
        select.addEventListener(
            "mousedown",
            (event) => {
                event.preventDefault();
                select.focus();
                if (isOpen()) close();
                else open();
            },
            { signal }
        );

        select.addEventListener(
            "keydown",
            (event) => {
                const { key } = event;
                if (!isOpen()) {
                    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
                        event.preventDefault();
                        open();
                    }
                    return;
                }
                if (key === "ArrowDown") {
                    event.preventDefault();
                    setActive(Math.min(items.length - 1, active + 1));
                } else if (key === "ArrowUp") {
                    event.preventDefault();
                    setActive(Math.max(0, active - 1));
                } else if (key === "Home" || key === "End") {
                    event.preventDefault();
                    setActive(key === "Home" ? 0 : items.length - 1);
                } else if (key === "Enter" || key === " ") {
                    event.preventDefault();
                    choose(active);
                } else if (key === "Escape") {
                    event.preventDefault();
                    close();
                } else if (key === "Tab") {
                    close();
                }
            },
            { signal }
        );

        list.addEventListener("mousedown", (event) => event.preventDefault(), { signal });
        list.addEventListener(
            "click",
            (event) => {
                const item = event.target.closest(".field-option");
                if (item) choose(items.indexOf(item));
            },
            { signal }
        );
        list.addEventListener(
            "mousemove",
            (event) => {
                const item = event.target.closest(".field-option");
                if (item && items.indexOf(item) !== active) setActive(items.indexOf(item));
            },
            { signal }
        );

        document.addEventListener(
            "mousedown",
            (event) => {
                if (!field.contains(event.target)) close();
            },
            { signal }
        );
        select.addEventListener("blur", close, { signal });

        field.addEventListener("destroy", () => controller.abort(), { once: true });
    });
}
