import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------
// Общие правила анимаций появления (GSAP + ScrollTrigger)
// Правило дизайнера: анимация блока стартует, только когда сам блок попадает в экран,
// а не при загрузке страницы. Каждый блок: строит timeline на паузе (элементы в стартовом
// состоянии), ставит корню .is-ready и вызывает onEnter(root, () => tl.play()).
// --------------------------------------

export { gsap, ScrollTrigger };

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Страница готова — прелоадер ушёл (components/general/preloader). До этого анимации секций
// не стартуют, даже если блок уже в экране: иначе они отыграли бы под прелоадером.
let resolvePageReady;
export const pageReady = new Promise((resolve) => {
    resolvePageReady = resolve;
});
export const pageReadyDone = () => resolvePageReady();

// Колбэк один раз, когда верх блока дошёл до start (по умолчанию — 80% высоты экрана)
// и страница готова (прелоадер ушёл). Если страница открыта уже ниже блока (якорь, обновление),
// колбэк срабатывает сразу после ухода прелоадера.
export function onEnter(trigger, callback, { start = "top 80%" } = {}) {
    return ScrollTrigger.create({ trigger, start, once: true, onEnter: () => pageReady.then(callback) });
}

// Первый экран сообщает, что его появление в основном отыграло — следующий блок
// («Преимущества», он наезжает на первый экран) ждёт этого, а не стартует одновременно.
let resolveHeroIntro;
export const heroIntro = new Promise((resolve) => {
    resolveHeroIntro = resolve;
});
export const heroIntroDone = () => resolveHeroIntro();

// Необязательное размытие для появлений: { blur: 8 } — элементы проявляются ещё и из размытия
const blurFrom = (blur) => (blur ? { filter: `blur(${blur}px)` } : {});
const blurTo = (blur) => (blur ? { filter: "blur(0px)" } : {});
const clearWith = (blur) => (blur ? "transform,filter" : "transform");

// Как на bip-it: элементы поднимаются снизу с проявлением, друг за другом. Добавляет твины в timeline с позиции at.
export function addRiseReveal(tl, items, at = 0, { blur = 0 } = {}) {
    if (!items || !items.length) return tl;
    return tl.fromTo(
        items,
        { y: 60, autoAlpha: 0, ...blurFrom(blur) },
        {
            y: 0,
            autoAlpha: 1,
            ...blurTo(blur),
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            clearProps: clearWith(blur)
        },
        at
    );
}

// Шапка секции (section-header.njk: метка, заголовок, подзаголовок, текст) — через addRiseReveal
export function addHeaderReveal(tl, header, at = 0, options = {}) {
    if (!header) return tl;
    return addRiseReveal(
        tl,
        header.querySelectorAll(".section-label, .section-title, .section-subtitle, .section-text"),
        at,
        options
    );
}

// Элементы по очереди выплывают сверху из лёгкого размытия (карточки «Красоты», шаги «Как принимать»).
export function addDropReveal(tl, items, at = 0) {
    if (!items || !items.length) return tl;
    return tl.fromTo(
        items,
        { y: -60, autoAlpha: 0, filter: "blur(8px)" },
        {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "transform,filter"
        },
        at
    );
}

// Пункты списка быстро снизу друг за другом («Что внутри», FAQ).
export const LIST_STAGGER = 0.07;
export function addListReveal(tl, items, at = 0, { blur = 0 } = {}) {
    if (!items || !items.length) return tl;
    return tl.fromTo(
        items,
        { y: 30, autoAlpha: 0, ...blurFrom(blur) },
        {
            y: 0,
            autoAlpha: 1,
            ...blurTo(blur),
            duration: 0.5,
            stagger: LIST_STAGGER,
            ease: "power2.out",
            clearProps: clearWith(blur)
        },
        at
    );
}
