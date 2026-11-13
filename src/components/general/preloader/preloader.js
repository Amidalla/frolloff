import { gsap, reducedMotion, pageReadyDone } from "../../../js/utils/reveal.js";

// --------------------------------------
// Прелоадер: появление, проценты по реальной загрузке, уход.
// Появление: логотип выезжает вверх из-под невидимой линии, слоган съезжает вниз над ней.
// Проценты: шрифты + все файлы страницы (window load) + фото первого экрана (lazy, lozad).
// На 100% (и не раньше, чем отыграло появление) — уход через расфокус (см. leave: логотип и слоган
// не уезжают, а тают в размытии); pageReadyDone() запускает анимации секций (reveal.js), снимается body.is-loading.
// Запускается сразу при подключении скрипта (bundle в конце body), не дожидаясь DOMContentLoaded.
// --------------------------------------

const MAX_WAIT = 6000; // страховка: дольше прелоадер не держим

function heroImageLoaded(timeout = 8000) {
    return new Promise((resolve) => {
        const img = document.querySelector(".hero-picture img");
        if (!img) return resolve();
        if (img.dataset.loaded === "true" && img.complete) return resolve();
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        setTimeout(done, timeout);
    });
}

function windowLoaded() {
    return new Promise((resolve) => {
        if (document.readyState === "complete") return resolve();
        window.addEventListener("load", () => resolve(), { once: true });
    });
}

export function preloader() {
    const root = document.querySelector("[data-preloader]");
    if (!root) {
        pageReadyDone();
        return;
    }
    if (root.dataset.init === "true") return;
    root.dataset.init = "true";

    const logo = root.querySelector(".preloader-logo");
    const text = root.querySelector(".preloader-text");
    const percentEl = root.querySelector("[data-preloader-percent]");
    const motion = !reducedMotion();

    // --- Появление ---
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (motion) {
        // Коротко (~0.8s): прелоадер ждёт окончания появления, затягивать его нельзя
        intro.fromTo(logo, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 0.7 }, 0);
        if (text) intro.fromTo(text, { y: 0, yPercent: -100 }, { yPercent: 0, duration: 0.7 }, 0.1);
        intro.fromTo(percentEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.2);
    }
    const introDone = new Promise((resolve) => {
        if (!intro.duration()) return resolve();
        intro.eventCallback("onComplete", resolve);
    });

    // --- Проценты: плавно догоняют фактический прогресс ---
    const counter = { value: 0 };
    const render = () => {
        percentEl.textContent = `${Math.round(counter.value)}%`;
    };
    let target = 0;
    const setTarget = (value, duration = 0.4) => {
        target = Math.max(target, Math.min(100, value));
        return gsap.to(counter, { value: target, duration, ease: "power1.out", overwrite: true, onUpdate: render });
    };
    render();
    setTarget(5);

    const tasks = [document.fonts ? document.fonts.ready : Promise.resolve(), windowLoaded(), heroImageLoaded()];
    let done = 0;
    tasks.forEach((task) =>
        task.then(() => {
            done += 1;
            setTarget(5 + (95 * done) / tasks.length);
        })
    );

    const loaded = Promise.race([Promise.all(tasks), new Promise((resolve) => setTimeout(resolve, MAX_WAIT))]);

    // --- Уход ---
    // Уход «через расфокус»: содержимое (логотип, слоган, проценты) не уезжает, а слегка приближается,
    // размывается и тает; фон растворяется, и страница под ним сначала видна размытой
    // (backdrop-filter у корня) и плавно становится резкой.
    const leave = () => {
        const inner = root.querySelector(".preloader-inner");
        const bg = root.querySelector(".preloader-bg");
        const finish = () => {
            root.classList.add("is-hidden");
            root.setAttribute("aria-hidden", "true");
        };
        const ready = () => {
            document.body.classList.remove("is-loading");
            pageReadyDone();
        };

        if (!motion) {
            gsap.to(root, { autoAlpha: 0, duration: 0.4, onComplete: finish });
            ready();
            return;
        }

        // Полноэкранный backdrop-filter тяжёлый для телефонов — там страница просто проявляется
        const blurPage = window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

        // Уход ~0.7s: всё начинается почти сразу, без пауз
        const outro = gsap.timeline({ onComplete: finish });
        outro
            .to(inner, { scale: 1.06, autoAlpha: 0, filter: "blur(14px)", duration: 0.45, ease: "power2.in" }, 0)
            .to(bg, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 0.1);
        if (blurPage) {
            outro.fromTo(
                root,
                { backdropFilter: "blur(24px)" },
                { backdropFilter: "blur(0px)", duration: 0.6, ease: "power2.out" },
                0.15
            );
        }
        outro
            // Секции начинают анимироваться, пока страница проявляется из размытия
            .call(ready, null, 0.15);
    };

    // Как только загрузилось и появление отыграло — сразу 100% и уход (без лишних пауз)
    Promise.all([loaded, introDone]).then(() => {
        if (counter.value >= 99.5) {
            counter.value = 100;
            render();
            leave();
        } else {
            setTarget(100, 0.25).eventCallback("onComplete", leave);
        }
    });
}
