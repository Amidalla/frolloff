import { openModal } from "../../../components/general/modal/modal.js";
import { gsap, onEnter, reducedMotion, addRiseReveal } from "../../../js/utils/reveal.js";

// --------------------------------------
// Появление «Попробуйте курс» (GSAP), как на bip-it
// Слева метка → заголовок → текст → «Где купить» поднимаются снизу; кнопки маркетплейсов
// подъезжают снизу одна за другой, следом «30 стиков в упаковке». Форма поднимается целиком.
// Лист-контур проявляется и двигается за мышью (data-attract) — его x/y здесь не трогаем.
// --------------------------------------

function initAnimation(section) {
    if (section.dataset.animInit === "true") return;
    section.dataset.animInit = "true";

    if (reducedMotion()) {
        section.classList.add("is-ready");
        return;
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    // Всё — ещё и из лёгкого размытия
    const blur = { blur: 8 };
    addRiseReveal(
        tl,
        section.querySelectorAll(".order-label, .order-title, .order-text, .order-markets-title"),
        0,
        blur
    );
    tl.fromTo(
        section.querySelectorAll(".order-markets li"),
        { y: 80, autoAlpha: 0, filter: "blur(8px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.1, clearProps: "transform,filter" },
        0.45
    );
    addRiseReveal(tl, section.querySelectorAll(".order-note"), 0.75, blur);

    const form = section.querySelector(".order-form");
    if (form) {
        tl.fromTo(
            form,
            { y: 60, autoAlpha: 0, filter: "blur(8px)" },
            { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.9, clearProps: "transform,filter" },
            0.3
        );
    }

    const leaf = section.querySelector(".order-leaf");
    if (leaf) tl.fromTo(leaf, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.3);

    section.classList.add("is-ready");
    onEnter(section, () => tl.play());
}

// Форма заказа: после успешной проверки (form.js, data-validate="submit") показываем
// модалку «Ваша заявка принята!» и очищаем форму. В Битриксе здесь будет отправка
// на сервер (fetch) и показ модалки по ответу.
export function order(context = document) {
    const section = context.querySelector("[data-order]");
    if (section) initAnimation(section);

    const form = context.querySelector(".order-form");
    if (!form || form.dataset.orderInit === "true") return;
    form.dataset.orderInit = "true";

    const controller = new AbortController();

    form.addEventListener(
        "submit",
        (event) => {
            if (event.defaultPrevented) return; // form.js нашёл ошибки
            event.preventDefault();
            form.reset();
            form.querySelectorAll(".valid").forEach((el) => el.classList.remove("valid"));
            openModal("modal-order-success");
        },
        { signal: controller.signal }
    );

    form.addEventListener("destroy", () => controller.abort(), { once: true });
}
