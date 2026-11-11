import lozad from "lozad";
import { menu } from "../components/general/menu/menu.js";
import { form } from "../components/general/form/form.js";
import { input } from "../components/general/input/input.js";
import { select } from "../components/general/select/select.js";
import { inputFile } from "../components/general/input-file/input-file.js";
import { tabs } from "../components/general/tabs/tabs.js";
import { accordion } from "../components/general/accordion/accordion.js";
import { consentNotice } from "../components/general/consent-notice/consent-notice.js";
import { navigationMobile } from "../components/general/navigation-mobile/navigation-mobile.js";
import { popupCallback } from "../components/common/popup-callback/popup-callback.js";
import { popupFeedback } from "../components/common/popup-feedback/popup-feedback.js";
import { header } from "../blocks/general/header/header.js";
import { showToast } from "../components/general/toast/toast.js";
import { showPopup } from "./utils/popup.js";

const components = [
    menu,
    form,
    input,
    select,
    inputFile,
    tabs,
    accordion,
    consentNotice,
    navigationMobile,
    popupCallback,
    popupFeedback,
    header
];

function init(context = document) {
    components.forEach((fn) => fn(context));
}

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

window.showToast = showToast;
window.showPopup = showPopup;

window.reinit = (context = document) => {
    init(context);
};
