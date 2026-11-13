import lozad from "lozad";
import { menu } from "../components/general/menu/menu.js";
import { form } from "../components/general/form/form.js";
import { input } from "../components/general/input/input.js";
import { tabs } from "../components/general/tabs/tabs.js";
import { accordion } from "../components/general/accordion/accordion.js";
import { consentNotice } from "../components/general/consent-notice/consent-notice.js";
import { navigationMobile } from "../components/general/navigation-mobile/navigation-mobile.js";
import { header } from "../blocks/general/header/header.js";
import { hero } from "../blocks/common/hero/hero.js";
import { advantages } from "../blocks/common/advantages/advantages.js";
import { beauty } from "../blocks/common/beauty/beauty.js";
import { flavors } from "../blocks/common/flavors/flavors.js";
import { howTo } from "../blocks/common/how-to/how-to.js";
import { formula } from "../blocks/common/formula/formula.js";
import { composition } from "../blocks/common/composition/composition.js";
import { about } from "../blocks/common/about/about.js";
import { reviews } from "../blocks/common/reviews/reviews.js";
import { faq } from "../blocks/common/faq/faq.js";
import { notFound } from "../blocks/common/not-found/not-found.js";
import { vitamins } from "../blocks/common/vitamins/vitamins.js";
import { readMore } from "../components/general/read-more/read-more.js";
import { catalog } from "../blocks/common/catalog/catalog.js";
import { productCard } from "../components/common/product-card/product-card.js";
import { certificates } from "../blocks/common/certificates/certificates.js";
import { order } from "../blocks/common/order/order.js";
import { modal } from "../components/general/modal/modal.js";
import { modalShop } from "../components/common/modal-shop/modal-shop.js";
import { attract } from "./utils/attract.js";
import { preloader } from "../components/general/preloader/preloader.js";
import { formField } from "../components/general/form-field/form-field.js";
import { scrollTop } from "../components/general/scroll-top/scroll-top.js";

const components = [
    menu,
    form,
    input,
    tabs,
    accordion,
    consentNotice,
    navigationMobile,
    header,
    hero,
    advantages,
    beauty,
    flavors,
    howTo,
    formula,
    composition,
    about,
    reviews,
    faq,
    notFound,
    vitamins,
    readMore,
    catalog,
    productCard,
    certificates,
    order,
    modal,
    modalShop,
    attract,
    formField,
    scrollTop
];

function init(context = document) {
    components.forEach((fn) => fn(context));
}

// Прелоадер — сразу (скрипт подключён в конце body, разметка уже есть), не ждём DOMContentLoaded
preloader();

document.addEventListener("DOMContentLoaded", () => {
    // global services
    lozad(".lazy", {
        rootMargin: "1200px 1200px",
        threshold: 0.1,
        enableAutoReload: true
    }).observe();

    // UI components
    init();
});

window.reinit = (context = document) => {
    init(context);
};
