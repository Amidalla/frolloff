# AGENTS.md

Этот файл содержит руководство для Claude Code (claude.ai/code) при работе с кодом в этом репозитории.

## Запуск проверок и сборки

Линтеры (`npm run lint`, `npm run lint:js`, `npm run lint:scss` и их варианты) и сборку (`npm run build`, `gulp build`) запускайте только по прямому требованию пользователя. Не запускайте их автоматически после внесения изменений.

## Обзор проекта

Проект **froloff** — одностраничный лендинг под 1С-Битрикс. **Позже на его базе клиент хочет полноценный интернет-магазин** — товары и тексты держать в данных, повторяющиеся элементы делать переиспользуемыми компонентами (пригодятся каталогу, карточке товара, корзине). Все секции лендинга подключаются в `src/pages/home.njk`; навигация в шапке, меню и подвале работает по якорям (`#about`, `#services`, `#faq`, `#contacts`). Анимации делаются на GSAP (`gsap` + ScrollTrigger), по секциям (образец — bip-it). **Правило дизайнера: анимация блока стартует только когда сам блок попадает в экран, а не при загрузке страницы.** Общий модуль `src/js/utils/reveal.js`: `onEnter(root, cb)` (ScrollTrigger, `top 80%`, один раз; если страница открыта ниже блока — срабатывает сразу), `reducedMotion()`, `heroIntro` / `heroIntroDone()`, `addRiseReveal(tl, items, at)` — как на bip-it: элементы поднимаются снизу с проявлением друг за другом; `addHeaderReveal(tl, header, at)` — то же для шапки секции (`section-header`) как на bip-it: метка → заголовок → текст поднимаются снизу с проявлением (использовать во всех секциях); `addDropReveal(tl, items, at)` — элементы по очереди выплывают сверху из лёгкого размытия (blur 8px); `addListReveal(tl, items, at)` — пункты списка быстро снизу друг за другом (0.07s, «Что внутри», FAQ). У `addRiseReveal` / `addHeaderReveal` / `addListReveal` есть опция `{ blur: 8 }` — проявление ещё и из лёгкого размытия (используется в «Что внутри», FAQ, «Сертификатах» и форме «Попробуйте курс»). Паттерн блока: timeline на паузе (элементы сразу в стартовом состоянии) → корню класс `.is-ready` (до него CSS прячет элементы `visibility: hidden` под `prefers-reduced-motion: no-preference`, чтобы не мелькали) → `onEnter(root, () => tl.play())`. Готово: первый экран (`hero.js` — текст плавно и равномерно (`sine.out`, 0.9s, шаг 0.1s) выезжает снизу по очереди: заголовок → подзаголовок → пункты списка → кнопка → стрелки; фото проявляется внутри маски из размытия с приближением; при смене слайдов не повторяется) и «Преимущества» (`advantages.js` — ждут `heroIntro`; карточка раскрывается от центра clip-path и поднимается, затем заголовок, иконки «впрыгивают» с поворотом `back.out`, подписи; иконки и подписи — из лёгкого размытия blur 10px), «Красота начинается изнутри» (`beauty.js` — шапка через `addHeaderReveal`, композиция со стиками всплывает снизу; карточки — свой триггер на `.beauty-cards`, по очереди выплывают сверху из blur 8px; лист / тени / стики — `data-attract` 0.03 / 0.06 / 0.06), «Выбирайте настроение» (`flavors.js` — шапка → вкладки → слайдер активной вкладки из размытия с приближением, как фото первого экрана → стрелки и кнопка → название и бейдж; порядок везде «сначала слайд, потом название»: при смене слайда (`slideChange`) название скрывается и выезжает снизу после проявления слайда (0.5s), при смене вкладки (событие `tabs:change`) слайдер новой вкладки въезжает со стороны переключения (вперёд — справа, назад — слева) из размытия с лёгким приближением, стрелки проявляются, название — через 0.3s; фото слайдов — `data-attract` 0.02 на `img`, Swiper это не затрагивает), «Как принимать» (`how-to.js` — шапка через `addHeaderReveal`, шаги с цифрами — свой триггер на `.how-to-steps`, `addDropReveal`), «Умная формула» (`formula.js` — `.formula-head > *` через `addRiseReveal`, лист проявляется; карточки — свой триггер на `.formula-cards`, `addDropReveal`; лист — `data-attract` 0.03), «Что внутри» (`composition.js` — заголовок через `addRiseReveal`, водяной знак проявляется; в столбце подзаголовок, затем пункты быстро снизу друг за другом (0.07s); второй столбец стартует одновременно с 6-м пунктом первого; если столбцы друг под другом — у второго свой триггер), «Витамины» (`vitamins.js` — как «Вкусы»: шапка → слайдер из размытия с приближением → стрелки и кнопка, лист проявляется; фото слайда обёрнуто в `.photo` с `data-attract` 0.02 — у `img` свой `translateX`, лист — 0.03), «О создателе» (`about.js` — шапка → текст и «Читать всё» снизу, фото из размытия с приближением от нижнего края, лист проявляется; лист — `data-attract` 0.03; раскрытие текста в этой секции 0.8s ease-in-out — фото и лист, прижатые к низу секции, плавно уезжают вниз), «Каталог» (`catalog.js` — заголовок через `addRiseReveal`; у каждой группы свой триггер: подзаголовок снизу → карточки `addDropReveal` → стрелки), «Отзывы» (`reviews.js` — метка/заголовок/оценка через `addRiseReveal`, плашка маркетплейсов подъезжает снизу, стики (контейнер `.reviews-visual`) поднимаются, лист проявляется; стики (`img`) — `data-attract` 0.05, лист — 0.03), FAQ (`faq.js` — как «Что внутри»: шапка через `addHeaderReveal`, вопросы через `addListReveal`), «Сертификаты» (`certificates.js` — заголовок через `addHeaderReveal`, слайдер целиком снизу, слайды отдельно не анимируются, стрелки — только прозрачность), «Попробуйте курс» (`order.js` — текст слева через `addRiseReveal`, кнопки маркетплейсов подъезжают снизу друг за другом, «30 стиков» следом, форма поднимается целиком, лист проявляется; лист — `data-attract` 0.03), страница 404 (`not-found.js` — «404 ошибка» из размытия с приближением, подзаголовок/текст/кнопка через `addRiseReveal`; заголовок — `data-attract` 0.03, поэтому после появления сбрасывается только `filter`). При `prefers-reduced-motion: reduce` анимаций нет. **Скорость (Google PageSpeed):** крупное фото первого экрана (`.hero-picture img`) не прятать прозрачностью/`visibility` — оно отрисовывается под прелоадером, и LCP засчитывается сразу после загрузки фото; появление — только `scale`/`filter`/сдвиг. Если начинать с `opacity: 0`, LCP уедет на конец прелоадера. Анимировать только `transform`/`opacity`/`filter` (не размеры и отступы) — так нет сдвигов вёрстки (CLS). Шрифты первого экрана предзагружаются в `meta.njk`. Параллакс `data-attract` считает раз за кадр (rAF). Размытие страницы при уходе прелоадера — только на десктопе с мышью.

Это генератор статических сайтов на основе Gulp, использующий шаблоны Nunjucks, SCSS и JavaScript, собранный с помощью esbuild. Проект использует компонентную архитектуру, где UI элементы организованы в переиспользуемые блоки и компоненты.

## Дизайн-система Froloff

Макеты: 1920 (основной), 1440, 768, 375. Вёрстка должна корректно выглядеть до 360px.

**Брейкпоинты** (`src/scss/core/breakpoints.scss`, `bp.mq(...)` = max-width):
- `desktop-s` (≤1440) — макет 1440; между 1440 и 1920 размеры меняются плавно через `mix.fluid(значение на 1440, значение на 1920)` (значение может и расти, и убывать; результат округляется до целого px)
- `tablet-l` (≤1023.98) — макет 768 (заголовки секций по центру)
- `tablet` (≤767.98) — макет 375
- `mobile-s` (≤359.98) — подстраховка для узких экранов

**Токены** (`variables.scss`): цвета `--color-gold`, `--color-navy`, `--color-ink`, `--color-milk`, `--color-cream`, `--color-bordo`, `--color-green`; градиенты `--gradient-gold`, `--gradient-navy`; `--container-padding` (72 → 36 → 12), `--section-padding` (80 → 60 → 48).

**Типографика** (`mixins.scss` + классы в `typography.scss`): `mix.h1` / `.h1`, `mix.h2` / `.h2`, `mix.h3` / `.h3`, `mix.label` / `.overline`, `mix.subtitle` / `.subtitle-gold`, `mix.text`, `mix.text-lg` / `.text-lg`, `mix.text-gold` / `.text-gold`, список `.list-dots`.

**Текст из админки — `data-editor`:** блоку, текст которого меняет контент-менеджер (визуальный редактор Битрикса — теги без классов), ставим атрибут `data-editor`. Стили — `src/scss/core/editor.scss`: h2 (Cormorant; h1 не оформляется — он один на странице и не из админки), h3 (золотой подзаголовок), h4 (как заголовок карточки), h5/h6, абзацы, `b`/`strong`, `em`, `small`, `mark`, `code`, ссылки (золотые с подчёркиванием), `ul` (золотые точки) и `ol` (золотые цифры) с вложенностью, `blockquote` + `cite`, `hr`, `img`/`figure`/`figcaption`, таблицы (на мобильном прокрутка). Атрибут в `:where()` — специфичность как у тега, поэтому стили блока всегда главнее; размер и цвет основного текста наследуются от блока. Сейчас атрибут стоит: текст «О создателе», ответы FAQ (`accordion .wrap`), текст шапки секции (`section-text`), текст модалок (`modal-text`), уведомление о cookie. Демо всех тегов (светлый и тёмный фон) — `ui-kit.html#editor`.

**Под 1С-Битрикс:** вёрстка переносится в шаблон сайта Битрикса. Повторяющиеся элементы (карточки и т.п.) — отдельные компоненты-макросы, блоки выводят их циклом по массиву данных (в Битриксе — цикл по `$arResult["ITEMS"]` в шаблоне `news.list`). Данные — в `src/data/*.njk`: общие (меню, контакты, CTA) в `site.njk` (`{% from "data/site.njk" import mainNav, contacts, cta %}`), контент главной — в `home.njk`. В Битриксе это инфоблоки и их свойства, меню — `bitrix:menu`, общие тексты и контакты — включаемые области (`bitrix:main.include`). Пути к ассетам относительные (`./assets/...` → `SITE_TEMPLATE_PATH`).

**Шапка и меню:** `blocks/general/header` — фиксированная, прозрачная над первым экраном, после прокрутки фон тёмно-синий (`is-sticky`); прилипшая шапка видна только при прокрутке вниз, при прокрутке вверх уезжает (`is-hidden`, у верха страницы и при открытом меню видна всегда). Направление прокрутки — `src/js/utils/scroll-direction.js` (`onScrollDirection`, rAF, порог 8px). Кнопка `header-cta` — ширина по тексту, без многоточия (если тесно — уменьшать шрифт). **Кнопка «Наверх»:** `components/general/scroll-top` (подключена в `layouts/default.njk`) — логика обратная шапке: видна при прокрутке вверх ниже первого экрана и всегда, когда в экране подвал; по клику плавно наверх; круг 75 → 60 → 48px с тенью, по правому краю контейнера; у подвала останавливается центром на его верхней границе (если граница ушла за верх экрана — снова в нижнем углу). С 1279px вместо меню бургер `menu-open`, меню `components/general/menu` (планшет — панель справа 416px, мобильный — сверху на всю ширину) + `.overlay`.

**Подвал:** `blocks/general/footer` — данные из `site.njk` (`footerNav`, `contacts`, `company`), колонки ссылок — компонент `navigation-bottom` (заголовок + список).

**Первый экран:** `blocks/common/hero` — слайдер Swiper (fade), слайд — макрос `hero-slide.njk`, данные `heroSlides` в `src/data/home.njk`. Фото продуктов — ленивый `img` с `data-srcset` (800/1200/2400), края обрезаются CSS-масками `hero-mask-fade.svg` + `hero-mask-shape.svg` из макета.

**Преимущества:** `blocks/common/advantages` — карточка наезжает на первый экран (десктоп), пункт — компонент `components/common/advantage-item` (иконка + надпись на иконке + текст), данные `advantages` в `src/data/home.njk`.

**Красота начинается изнутри:** `blocks/common/beauty` (якорь `#benefits`) — шапка секции + композиция со стиками (лист SVG + CSS-тени + PNG, позиции для каждого макета в `$visual-layouts`) + карточки — компонент `components/common/benefit-card` (круглое фото 300×300, заголовок, золотой lead + текст), данные `beauty` в `src/data/home.njk`.

**Вкусы:** `blocks/common/flavors` (якорь `#flavors`) — шапка секции + табы по граммовке (`components/general/tabs`), в каждой вкладке слайдер Swiper; слайд — компонент `components/common/flavor-slide` (название, бейдж, фото; ширина названия и бейджа ограничена местом до упаковки в центре фото — длинное название переносится на 2 строки), данные `flavors` в `src/data/home.njk`. Стрелки — `sliderArrow(variant="product")`: золотая = активная, светлая = неактивная (крайний слайд); на планшете/мобильном всегда светлые.

**Как принимать:** `blocks/common/how-to` (якорь `#how-to`) — шапка секции + список шагов `<ol>`; шаг — компонент `components/common/how-to-step` (цифра-SVG + заголовок + текст), данные `howTo` в `src/data/home.njk`. Высота цифры = `--number-ratio` (высота SVG / 100) × `--how-to-number-size` (100 → 73 → 49 → 36), пропорции цифр сохраняются на всех разрешениях.

**Умная формула для суставов:** `blocks/common/formula` (якорь `#formula`, тёмный фон) — шапка по центру (заголовок, текст, золотой подзаголовок «Рекомендация по приему», строка дозировки) + карточки 4 в ряд → 2×2 (≤1023) → 1 колонка (≤767); карточка — компонент `components/common/effect-card` (иконка-SVG, срок, текст), данные `formula` в `src/data/home.njk`. Лист-контур справа снизу — только на десктопе, за карточками.

**Что внутри:** `blocks/common/composition` (якорь `#composition`) — заголовок + две колонки (нутрицевтики | аминокислоты) с золотой линией между ними (`::before` правой колонки) и вертикальным логотипом-водяным знаком справа (скрыт ≤1279); 768 — две колонки без линии, мобильный — друг под другом. Пункт — компонент `components/common/composition-item` (`variant="gold|navy"`: круг CSS + галочка SVG, название + дозировка), данные `composition` в `src/data/home.njk`.

**Витамины:** `blocks/common/vitamins` (якорь `#vitamins`) — шапка секции + слайдер Swiper (fade) с фото товаров + кнопка «Где купить» поверх отражения; слайд — компонент `components/common/vitamin-slide` (PNG без фона, ширина — `--vitamin-image-width`, сдвиг влево из-за капсул), данные `vitamins` в `src/data/home.njk`. Стрелки — как во «Вкусах» (`sliderArrow(variant="product")`). Лист-контур слева снизу — общий файл `assets/images/system/leaf-outline.svg` (он же в «Умной формуле»).

**О создателе:** `blocks/common/about` (якорь `#about`) — шапка (1920 слева, с 1440 по центру) + текст с «Читать всё» + фото PNG без фона, стоящее на нижней границе секции (мобильный — под текстом). Фото своё под каждый макет (`images`: xl 1920 / l 1440 / m 768 / s 375, классы на `img`), лишние скрыты `display: none` — lozad их не грузит, за фото лист-контур. В свёрнутом виде видно 4 абзаца (≤1023 — 3), остальное раскрывает общий компонент `components/general/read-more` (`data-read-more` / `data-read-more-content` / `data-read-more-toggle`, плавная анимация высоты). Данные `about` в `src/data/home.njk`.

**Каталог «Выбирайте то, что ближе»:** `blocks/common/catalog` (якорь `#catalog`) — заголовок + группы (золотой подзаголовок + слайдер Swiper: 4 карточки, ≤1023 — 2; отступ из `--catalog-gap` через `column-gap`). Если в группе 4 товара и меньше — класс `is-static`: Swiper не запускается, сетка 4 / 2 в ряд, стрелок нет (стрелки выводятся только при 5+ товарах; в Битриксе — то же условие по `count($arResult["ITEMS"])`). Стрелки `light` по краям контейнера (≤1023 — под слайдером). Карточка — компонент `components/common/product-card` (`theme="bordo|navy|gold"`, `kind` box|jar): название, граммовка, фото PNG без фона (`assets/images/content/products/`). Раскрытие — только на десктопе с мышью (`hover: hover` и ≥1024) по наведению и `:focus-within` (миксин `open-state`): `.inner` вырастает вверх/вниз, заливается цветом темы, фото уменьшается, появляются описание и кнопка «Купить на маркетплейсах». На устройствах без ховера карточка не раскрывается — клик шлёт событие `product-card:open`, по нему (и по кнопке «Купить на маркетплейсах» на десктопе) открывается модалка «Где купить» с ссылками товара (`item.markets` → `data-ozon` / `data-wb` / `data-ym` на карточке). Размеры карточки — CSS-переменные `--pc-*` по брейкпоинтам. Данные `catalog` в `src/data/home.njk`.

**Отзывы:** `blocks/common/reviews` (якорь `#reviews`, тёмный фон) — метка «Отзывы» (только десктоп), заголовок, золотая оценка, плашка со ссылками «Отзывы на» + логотипы Ozon / WB / Я.Маркет (≤1023 — столбиком, ≤767 — только логотипы в ряд), композиция стиков — одна PNG `reviews-sticks.png` (десктоп — справа от края секции, 768 — рядом с плашкой, 375 — скрыта). Данные `reviews` в `src/data/home.njk`.

**FAQ «Отвечаем на главное»:** `blocks/common/faq` (якорь `#faq`) — `section milk bordered`, шапка секции по центру + общий компонент `components/general/accordion` (макрос `accordion(items=[{name, content}], openFirst, id)`): золотая рамка, иконка — CSS-круг с золотой заливкой отдельным слоем + встроенный SVG-плюс, у открытого пункта контурный круг и плюс повёрнут в крестик. Открыт один пункт; закрытый ответ — `hidden`, высота анимируется (с запасным таймером, если `transitionend` не придёт). Данные `faq` в `src/data/home.njk`.

**Сертификаты:** `blocks/common/certificates` (якорь `#certificates`) — `section cream bordered`, заголовок по центру + слайдер Swiper (4 карточки, ≤767 — 2; отступ из `--certificates-gap` через `column-gap`), карточка — ссылка `.certificate-card` на полное изображение, по клику открывается галерея Fancybox (`data-fancybox="certificates"`, `Hash: false`). Стрелки `light` по краям контейнера (≤767 — под слайдером). Данные `certificates` в `src/data/home.njk`.

**Заказ «Попробуйте курс»:** `blocks/common/order` (якорь `#order`) — слева метка, заголовок, текст, кнопки-ссылки маркетплейсов, «30 стиков в упаковке» с золотой галочкой (SVG + `url(#gradient-gold)`); справа форма `.form.order-form` (`data-validate="submit"` — кнопка всегда активна, ошибки при отправке, фокус на первое неверное поле). Поле — общий компонент `components/general/form-field` (`formField(label, name, type, placeholder, mask, options)`: рамка-пилюля, подпись на верхней рамке с фоном `--form-field-bg`; `options` — нативный select со стрелкой, поддерживает группы `{group, items}`; на устройствах с мышью `form-field.js` вместо системного списка открывает свой `.field-dropdown` в стиле сайта — молочная карточка с золотой рамкой, золотые подписи групп; клавиатура и проверка формы работают через тот же `<select>`; на телефонах — системный выбор; если внизу не хватает места в окне, список раскрывается вверх (`.is-up`). Список рисуется поверх соседних секций, поэтому у секции с формой нет `overflow: hidden` — декор обрезает своя обёртка `.order-decor`; при переносе в Битрикс — не ставить `overflow: hidden` на секцию/обёртки формы), согласие — `consent-checkbox` (30px, золотая галочка, параметр `error`). Телефон — маска IMask (`mask="phone"`). ≤1023 — всё по центру, форма 351px под текстом. Данные `order` в `src/data/home.njk`.

**Страница 404:** `src/pages/404.njk` → `404.html` (макет только 1920, остальные размеры — по пропорциям) — блок `blocks/common/not-found`: экран на всю высоту, тёмный градиент + плитка-узор из листиков `assets/images/system/leaf-pattern.svg` (прозрачность 10% зашита в SVG), «404 ошибка» — Cormorant SC 400 (подключено в `fonts.scss`), кнопка `gold` «На главную». Страница задаёт `hideFooter = true` (layout не выводит подвал) и `linkBase = "./home.html"` — шапка и меню добавляют его к якорным ссылкам (`./home.html#faq` и т.п.); на главной `linkBase` не задан. В Битриксе — `404.php`.

**Модальные окна:** общий компонент `components/general/modal` (макрос `modal(id, title, text)` + `{% call %}` для своего содержимого; `openModal(id)` из `modal.js`, триггер `data-modal="id"`). Открываются через Fancybox (inline, `src: "#id"`, `mainClass: "modal-fancybox"`, свой крестик `data-fancybox-close`): молочная карточка 690px (≤767 — 345px), 86px от верха (мобильный — 40px), оверлей `rgb(12 35 72 / 80%)` + blur. В разметке страницы окно скрыто (`.modal:not(.f-html)`). Окна подключены в `layouts/default.njk`: `components/common/modal-shop` — «Выберите, где хотите купить товар» (ссылки подставляет `modal-shop.js` из карточки товара; кнопка «Где купить» `data-shop-open` во «Вкусах» и «Витаминах» берёт `data-ozon` / `data-wb` / `data-ym` активного слайда видимой вкладки, данные — `slide.markets`), `components/common/modal-order-success` — «Ваша заявка принята!» (открывает `blocks/common/order/order.js` после успешной проверки формы, форма очищается; в Битриксе — после ответа сервера). Тексты и маркетплейсы — `modals`, `marketplaces` в `src/data/site.njk`.

**Картинки:** все изображения (и первый слайд херо) — с ленивой загрузкой через компонент `components/general/image` (lozad: `.lazy` + `data-src`/`data-srcset`, `width`/`height` обязательны для фото). Без `fetchpriority`/`loading="eager"`. Исключение — логотипы в шапке, подвале и прелоадере.

**Прелоадер:** общий компонент `components/general/preloader` (макрос `preloader(text)`), подключён в `layouts/default.njk` первым в `<body class="is-loading">` (без JS прячется через `<noscript>`). Figma: 1920 — `2preloader`, 375 — `modal preloader`: тёмный градиент + узор `leaf-pattern.svg`, золотой логотип `assets/images/system/logo-gold.svg` (504 → 235), слоган Cormorant SC 400 (52 → 20), проценты (110 → 48), размеры между макетами через `clamp(…vw…)`. Анимация (`preloader.js`, запускается сразу, не ждёт DOMContentLoaded): между логотипом и слоганом невидимая «линия» (маски `overflow: hidden`) — логотип выезжает вверх из-под неё, слоган съезжает вниз сверху. Проценты — по реальной загрузке (шрифты, `window.load`, фото первого экрана), плавно догоняют прогресс; страховка 6 с. Тайминги короткие, чтобы прелоадер не «висел» после загрузки: появление ~0.8 с, уход ~0.7 с сразу после 100% (без паузы). На 100% — уход через расфокус: логотип, слоган и проценты не уезжают, а слегка приближаются и тают в размытии, фон (`.preloader-bg`) растворяется, страница под ним видна размытой (`backdrop-filter` у корня) и плавно становится резкой; снимается `body.is-loading` и вызывается `pageReadyDone()` — только после этого стартуют анимации секций (`onEnter` в `reveal.js` ждёт `pageReady`).

**Ховеры:** все переходы на ховере — только `transition: <свойство> var(--transition)` (0.3s ease, задаётся в `variables.scss`), без своих длительностей. Градиенты и `url()`-обводки не анимируются — для плавного ховера их кладём отдельным слоем (`::before`/`::after`, вторая SVG-линия) и меняем `opacity`.

**Чёткость (пиксельная сетка):** контейнер округляет отступ до целого пикселя (`round()` в `.container`), `mix.fluid()` всегда отдаёт целые px. Круги и рамки иконок — CSS-рамкой (border), тонкие линии внутри — встроенным SVG (не CSS-масками), размеры только целые. Общие градиенты для SVG — `components/general/svg-defs` (`url(#gradient-gold)`).

**Общие элементы:**
- Секция: `<section class="section cream|milk|dark bordered">` + `.container`
- Шапка секции: макрос `blocks/general/section/section-header.njk` (label, title, subtitle, text, align)
- Кнопка: `button(text, variant="gold|blue|border", size="l|m|s")`
- Стрелка слайдера: `components/general/slider-arrow` — `sliderArrow(direction="prev|next", variant="light|gold|banner", size="l|m|s")`
- Пагинация Swiper: `.swiper-pagination` (на светлом фоне + класс `on-light`, вне слайдера — `static`)
- Один слайд — стрелок и пагинации нет: каждый слайдер перед `new Swiper` вызывает `isSingleSlide(root, slider)` из `src/js/utils/slider.js` (ставит корню класс `.slider-single`, CSS в `globals.scss` прячет внутри него `.slider-arrow` и `.swiper-pagination`; Swiper в этом случае не запускается)
- Табы: `components/general/tabs` (при смене вкладки корень шлёт событие `tabs:change` с `detail: { index, panel }`; параметр `animate=true` — плавная смена как во «Вкусах»: панель въезжает со стороны переключения из размытия с приближением, включён в UI kit; во «Вкусах» не включён — там своя анимация в `flavors.js`); карточка: `.card` (+ `milk`, `shadow`)
- Параллакс от мыши (притяжение к курсору, как у логотипа в подвале thecosine.com): атрибут `data-attract="0.3"` (сила — доля размера элемента) + необязательный `data-attract-y` (своя сила по вертикали для высоких элементов), модуль `src/js/utils/attract.js` (`gsap.quickTo`, 0.6s, `power3`; только мышь, без `prefers-reduced-motion`). Если GSAP анимирует у элемента x/y (появление) — `data-attract` ставится на обёртку. Сейчас: вертикальная надпись FROLOFF на первом экране (`.hero-wordmark`), лист, тени и стики в «Красоте», фото во «Вкусах», лист в «Умной формуле», фото и лист в «Витаминах», вертикальная надпись FROLOFF в «Что внутри» (0.1 / по вертикали 0.02), лист в «О создателе», стики и лист в «Отзывах», лист в «Попробуйте курс». Для картинок — параметр `data={ attract: "0.06" }` макроса `components/general/image`.
- Демо всех элементов: `src/pages/ui-kit.njk` → `ui-kit.html`

## Команды разработки

### Запуск сервера разработки
```sh
npm start
# или
gulp
```
Запускает сервер BrowserSync на http://localhost:3000 с живой перезагрузкой. Скомпилированные файлы попадают в папку `temp/`.

### Сборка для продакшна
```sh
npm run build
# или
gulp build
```
Компилирует оптимизированные ресурсы в папку `build/` с минифицированными CSS/JS и оптимизированными изображениями.

### Очистка директорий сборки
```sh
gulp clean
```
Удаляет папки `temp/` и `build/`.

### Линтинг кода
```sh
npm run lint
```
Запускает проверки ESLint (JavaScript) и Stylelint (SCSS).

```sh
npm run lint:js
```
Проверяет JavaScript файлы с помощью ESLint.

```sh
npm run lint:js:fix
```
Автоматически исправляет проблемы линтинга JavaScript.

```sh
npm run lint:scss
```
Проверяет SCSS файлы с помощью Stylelint.

```sh
npm run lint:scss:fix
```
Автоматически исправляет проблемы линтинга SCSS.

### Форматирование кода
```sh
npm run format
```
Проверяет форматирование кода для HTML, SCSS, JS и JSON файлов с помощью Prettier.

```sh
npm run format:fix
```
Автоматически исправляет проблемы форматирования.

### Комплексные команды
```sh
npm run check
```
Запускает все проверки (lint + format) одной командой.

```sh
npm run fix
```
Автоматически исправляет все проблемы (lint:fix + format:fix) одной командой.

### Анализ бандла
```sh
npm run analyze
```
Показывает размер минифицированного JavaScript бандла в KB.

### Дополнительные команды
```sh
npm run validate
```
Валидирует HTML файлы в директории `build/` с помощью W3C валидатора. Сначала запустите `npm run build`.

```sh
npm run compress
```
Сжимает исходные изображения в `src/assets/images/` (заменяет оригиналы с более высоким качеством, чем продакшн-сборка).

## Архитектура

### Система сборки (gulpfile.js)

Конвейер Gulp имеет отдельные задачи для разработки и продакшна:

**Задачи разработки** (вывод в `temp/`):
- `html` - Компиляция шаблонов Nunjucks без минификации
- `styles` - Компиляция SCSS с sourcemaps, вывод как `bundle.css`
- `scripts` - Сборка JS с esbuild и sourcemaps, вывод как `bundle.js`
- `assets` - Копирование ресурсов без оптимизации
- `serve` - Запуск сервера BrowserSync с отслеживанием файлов

**Задачи продакшна** (вывод в `build/`):
- `htmlProd` - Компиляция шаблонов и замена ссылок на бандлы версиями с `.min`
- `stylesProd` - Компиляция SCSS с autoprefixer и cssnano, вывод как `bundle.min.css`
- `scriptsProd` - Сборка и минификация JS, вывод как `bundle.min.js`
- `assetsProd` - Копирование и оптимизация изображений с помощью mozjpeg и pngquant

### Компонентная архитектура

**Блоки** (`src/blocks/`) - Крупные структурные секции страницы:
- `general/` - Переиспользуемые блоки, такие как header, footer, section
- `common/` - Секции лендинга (создаются по макету)

**Компоненты** (`src/components/`) - Небольшие переиспользуемые UI элементы:
- `general/` - Переиспользуемые компоненты, такие как button, title, menu, form, tabs, accordion
- `common/` - Уникальные компоненты проекта: контакты, copyright, popup-окна

Каждый блок/компонент следует этой структуре:
```
component-name/
├── component-name.njk   # Шаблон Nunjucks
├── component-name.scss  # Стили
└── component-name.js    # JavaScript (при необходимости)
```

### Система шаблонов (Nunjucks)

**Макеты** (`src/layouts/`):
- `default.njk` - Основной макет с header, footer и блоком контента

**Страницы** (`src/pages/`):
- Каждый файл `.njk` становится HTML страницей
- Страницы расширяют макеты и включают блоки/компоненты
- Используйте `{% extends "layouts/default.njk" %}` и `{% block content %}`

**Подключение шаблонов**:
- Блоки/компоненты: `{% include "blocks/general/header/header.njk" %}`
- Метаданные в макетах: `{% include "blocks/general/meta/meta.njk" %}`

### Система стилей

**Точка входа**: `src/scss/index.scss`

SCSS организован в:
- `core/` - Переменные, миксины, шрифты, глобальные стили, точки останова
- Стили компонентов импортируются из `src/blocks/` и `src/components/`
- Стили сторонних библиотек из `node_modules/`

Компилятор Sass использует `includePaths` для разрешения импортов из:
- `src/blocks`
- `src/components`
- `src/scss/core`

### Система JavaScript

**Точка входа**: `src/js/index.js`

#### Архитектура инициализации

Проект использует централизованный паттерн инициализации компонентов:

```js
import lozad from "lozad";
import { menu } from "../components/general/menu/menu.js";
import { tabs } from "../components/general/tabs/tabs.js";

const components = [menu, tabs, /* другие компоненты */];

function init(context = document) {
    components.forEach((fn) => fn(context));
}

document.addEventListener("DOMContentLoaded", () => {
    lozad(".lazy", { rootMargin: "200px 200px", threshold: 0.1, enableAutoReload: true }).observe();
    init();
});

window.reinit = init; // Для переинициализации после AJAX
```

**Ключевые особенности:**
- Массив `components` содержит все функции инициализации компонентов
- Функция `init(context)` позволяет переинициализировать компоненты в определённом контексте
- `window.reinit` доступен глобально для переинициализации после динамических изменений DOM

#### Паттерн компонента JavaScript

Каждый компонент экспортирует функцию с параметром `context`:

```js
export function componentName(context = document) {
    const root = context.querySelector('[data-dropdown="component"]');
    if (!root || root.dataset.init === "true") return;

    root.dataset.init = "true";

    const controller = new AbortController();
    const { signal } = controller;

    // Логика компонента...

    // Очистка при удалении элемента
    root.addEventListener("destroy", () => controller.abort(), { once: true });
}
```

**Обязательные элементы:**
- Проверка `root.dataset.init === "true"` предотвращает двойную инициализацию
- `AbortController` для управления слушателями событий
- Событие `destroy` для очистки при удалении элемента из DOM

**Утилитарные функции**: `src/js/utils/`
- Директория для общих утилитарных функций (помощники DOM, делегирование событий, debounce/throttle и т.д.)

esbuild собирает все в один IIFE бандл для браузера.

### Контроль качества кода

Проект использует три комплементарных инструмента для контроля качества кода:

#### ESLint (JavaScript)

**Конфигурация**: `eslint.config.js` (формат ESLint 9+ flat config)

ESLint настроен с:
- Поддержкой ES модулей (`sourceType: "module"`)
- Глобальными переменными браузера и Node.js
- Рекомендуемыми правилами JavaScript
- Интеграцией **eslint-config-prettier** (отключает конфликтующие правила стиля)
- Авто-игнорированием паттернов для `node_modules/`, `temp/`, `build/` и `*.min.js`

Основные применяемые правила (только логика, без правил стиля):
- `no-var` - Необходимо использовать `let`/`const` вместо `var`
- `prefer-const` - Использовать `const` для переменных, которые не переназначаются
- `prefer-arrow-callback` - Предпочитать стрелочные функции для коллбэков
- `prefer-template` - Предпочитать шаблонные литералы вместо конкатенации строк

**Примечание:** Все стилистические правила (отступы, кавычки, точки с запятой, пробелы) обрабатываются Prettier.

#### Stylelint (SCSS/CSS)

**Конфигурация**: `.stylelintrc.json`

Stylelint настроен с:
- `stylelint-config-standard-scss` - Стандартные правила SCSS
- `stylelint-config-recess-order` - Автоматическая сортировка CSS свойств (аналогично стилю Bootstrap)
- Интеграцией **stylelint-config-prettier-scss** (отключает конфликтующие правила стиля)
- Авто-игнорированием паттернов для `node_modules/`, `temp/`, `build/` и `*.min.css`

Возможности:
- Валидация синтаксиса SCSS
- Автоматическая сортировка свойств (position → display → box-model → typography → visual → и т.д.)
- Обнаружение дублирующихся селекторов и недопустимых правил
- Валидация цветов, единиц измерения и значений
- Поддержка автоисправления для большинства проблем

Основные отключенные правила для гибкости:
- `selector-class-pattern` - Без принудительного использования BEM
- `scss/dollar-variable-pattern` - Без ограничений на именование переменных
- `no-descending-specificity` - Позволяет гибкую специфичность

#### Prettier (Форматировщик кода)

**Конфигурация**: `.prettierrc.json` | **Игнорирование**: `.prettierignore`

Prettier настроен с:
- Отступами в 4 пробела (соответствует настройкам ESLint)
- Двойными кавычками
- Точками с запятой всегда
- Шириной строки: 120 символов
- Окончаниями строк LF
- **Форматирует**: HTML, SCSS, JS, JSON
- **Исключает**: файлы `.njk` (шаблоны Nunjucks не форматируются)

Интеграция:
- `eslint-config-prettier` отключает все правила стиля ESLint
- `stylelint-config-prettier-scss` отключает все правила стиля Stylelint
- **Нет конфликтов** между инструментами - Prettier обрабатывает все форматирование, линтеры - качество кода

**Важно:** Всегда запускайте `npm run format:fix` перед коммитом для обеспечения единообразного стиля кода.

## Общие библиотеки

Только то, что реально используется на сайте (лишнее из шаблона-основы удалено 2026-11-13):
- **GSAP** (+ ScrollTrigger) — анимации появления, прелоадер, параллакс (`js/utils/reveal.js`, `js/utils/attract.js`)
- **Lozad.js** — ленивая загрузка картинок `.lazy` (инициализируется в `index.js`)
- **Swiper** — слайдеры (модули Navigation, Pagination, EffectFade, A11y; в CSS подключены только их стили)
- **@fancyapps/ui** — модальные окна и галерея сертификатов
- **imask** — маска телефона в форме заказа (`components/general/input/input.js`, `data-mask="phone"`)

Второй проход чистки (2026-11-13): удалены компоненты `checkbox` (используется `consent-checkbox`) и `text` (заменён атрибутом `data-editor`), `blocks/general/section/section.njk`, `scss/core/popup.scss`, стили `.lazy-loader`, сетка `.grid.col-2` / `.actions` в `form.scss`, `button.full`, варианты `consent-checkbox.white` / `.variant`, неиспользуемые переменные шаблона (`--color-1/3/4/6/8/9/10`, `--color-gray*`, `--color-primary-dark`, `--color-secondary`, `--color-red`).

Удалено как неиспользуемое: nice-select2 (выбор вкуса — нативный select в `form-field`), старые попапы «Обратный звонок» / «Обратная связь» и их окна «успешно», `utils/popup.js`, toast, варианты форм `form*.njk`, компоненты select, textarea, input-file, input (разметка и стили; `input.js` с маской оставлен), files, heading, map, ya-maps, newsletter-form, table, title, стили Swiper grid / free-mode. Перед добавлением новой библиотеки — проверить, что без неё никак: каждый килобайт JS влияет на PageSpeed.

## Добавление новых компонентов

1. Создайте директорию компонента в `src/components/general/` или `src/blocks/general/`
2. Создайте файлы `.njk`, `.scss` и `.js` (при необходимости)
3. Импортируйте SCSS в `src/scss/index.scss`
4. Если компонент нуждается в JS логике:
   - Экспортируйте функцию `componentName(context = document)` из `.js`
   - Импортируйте и добавьте в массив `components` в `src/js/index.js`
5. Подключите компонент на страницах/в макетах, используя `{% from %}` и вызов макроса

## Отслеживание файлов

Gulp отслеживает эти паттерны в режиме разработки:
- `src/**/*.njk` - Запускает задачу `html`
- `src/**/*.scss` - Запускает задачу `styles`
- `src/**/*.js` - Запускает задачу `scripts`
- `src/assets/**/*.*` - Запускает задачу `assets`

## Руководство по разработке компонентов

Этот раздел описывает стандартные паттерны и стиль кода для создания новых компонентов на основе существующих компонентов, таких как `button` и `textarea`.

### Структура файлов

Каждый компонент должен иметь:
```
component-name/
├── component-name.njk   # Шаблон Nunjucks (обязательно)
├── component-name.scss  # Стили (обязательно)
└── component-name.js    # JavaScript (опционально, только при необходимости)
```

### Структура шаблона Nunjucks (.njk)

**Важно:** Все компоненты должны использовать **макросы Nunjucks** для лучшей переиспользуемости и чистой области видимости. НЕ добавляйте комментарии документации внутри файлов компонентов.

#### 1. Определение макроса

Определите компонент как макрос с параметрами:

```njk
{% macro render(
    text="",
    variant="primary",
    size="md",
    disabled=false,
    class="",
    data={},
    aria={}
) %}
```

#### 2. Значения по умолчанию

Значения по умолчанию определены в параметрах макроса. Дополнительные значения по умолчанию внутри макроса:

```njk
{% set componentClasses = "component-name " + variant + " " + size %}
{% if class %}{% set componentClasses = componentClasses + " " + class %}{% endif %}
```

#### 3. Построение имен классов

Создавайте CSS классы условно:

```njk
{% set componentClasses = "component-name " + variant %}
{% if component.modifier %}{% set componentClasses = componentClasses + " " + modifier %}{% endif %}
{% if component.class %}{% set componentClasses = componentClasses + " " + component.class %}{% endif %}
```

**Паттерн:** Базовый класс + вариант/размер + модификаторы + пользовательские классы

#### 4. HTML элемент

Отрендерьте элемент с условными атрибутами:

```njk
<element
    class="{{ componentClasses }}"
    {% if component.id %}id="{{ component.id }}"{% endif %}
    {% if component.name %}name="{{ component.name }}"{% endif %}
    {% if component.disabled %}disabled{% endif %}
    {% if component.data %}
        {% for key, val in component.data %}
            data-{{ key | replace("_", "-") }}="{{ val }}"
        {% endfor %}
    {% endif %}
    {% if component.aria %}
        {% for key, val in component.aria %}
            aria-{{ key | replace("_", "-") }}="{{ val }}"
        {% endfor %}
    {% endif %}
>
    {% if component.content %}{{ component.content }}{% endif %}
</element>
```

**Ключевые паттерны:**
- Используйте `{% if %}` для опциональных атрибутов
- Всегда поддерживайте атрибуты `data` и `aria` через циклы
- Конвертируйте подчеркивания в дефисы в ключах data/aria: `replace("_", "-")`
- Сохраняйте чистое форматирование с правильными отступами

#### 5. Условная логика

Исключайте определенные модификаторы из конкретных вариантов:

```njk
{% set buttonClasses = "button " + variant %}
{% if variant != "link" %}
    {% set buttonClasses = buttonClasses + " " + size + " " + shape %}
{% endif %}
{% endmacro %}
```

**Использование на страницах:**
```njk
{% from "components/general/button/button.njk" import render as button %}

{{ button(text="Нажми меня", variant="primary", size="lg") }}
{{ button(text="Вторичная", variant="secondary") }}
```

**Размещение импорта:** Всегда размещайте импорты макросов в **верхней части файла**, перед любым другим кодом (аналогично импортам JavaScript/CSS).

### Структура SCSS

#### 1. Заголовок файла

```scss
@use "core/breakpoints" as bp;
@use "core/mixins" as mix;
```

#### 2. CSS кастомные свойства

Определите специфичные для компонента переменные, используя CSS кастомные свойства:

```scss
.component-name {
    // Переменные компонента
    --component-border-radius: 6px;
    --component-font-size-sm: 0.75rem;
    --component-font-size-md: 0.875rem;
    --component-font-size-lg: 0.875rem;
    --component-padding-sm: 0.625rem;
    --component-padding-md: 0.75rem;
    --component-padding-lg: 1rem;

    // Базовые стили
    display: block;
    // ... другие базовые стили
}
```

**Преимущества:**
- Легко переопределить
- Читаемые имена переменных
- Область видимости компонента

#### 3. Базовые стили

Сначала определите базовые стили:

```scss
.component-name {
    // Сначала переменные

    // Базовые стили
    position: relative;
    display: block;
    font-family: var(--font-family-primary);
    font-size: var(--component-font-size-md);
    // ... другие стили
    transition: all 0.2s ease-in-out;
```

#### 4. Состояния

Группируйте интерактивные состояния вместе:

```scss
    // Состояние фокуса
    &:focus,
    &:focus-visible {
        outline: 2px solid var(--color-primary);
    }

    // Состояние наведения
    &:hover:not(:disabled) {
        border-color: var(--color-black);
    }

    // Отключенное состояние
    &:disabled,
    &.disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    // Активное состояние
    &:active:not(:disabled) {
        transform: translateY(1px);
    }
```

**Важно:** Всегда используйте `:not(:disabled)` для состояний hover/active

#### 5. Секция вариантов

Группируйте варианты с заголовком комментария:

```scss
    // --------------------------------------
    // Варианты
    // --------------------------------------

    &.primary {
        color: var(--color-white);
        background-color: var(--color-primary);

        &:hover:not(:disabled) {
            background-color: var(--color-primary-dark);
        }
    }

    &.secondary {
        // ...
    }
```

#### 6. Секция размеров

Группируйте размеры с заголовком комментария:

```scss
    // --------------------------------------
    // Размеры
    // --------------------------------------

    &.sm {
        padding: var(--component-padding-sm);
        font-size: var(--component-font-size-sm);
    }

    &.md {
        padding: var(--component-padding-md);
        font-size: var(--component-font-size-md);
    }

    &.lg {
        padding: var(--component-padding-lg);
        font-size: var(--component-font-size-lg);
    }
```

#### 7. Модификаторы

Дополнительные модификаторы идут после основных вариантов:

```scss
    &.error {
        border-color: var(--color-red);

        &:focus {
            border-color: var(--color-red);
        }

        &:hover {
            border-color: var(--color-red) !important;
        }
    }
```

### Правила стиля кода

#### Nunjucks

- **Без BEM нотации** - Используйте простые имена классов с модификаторами
- **Встроенные условия** - Держите простые условия на одной строке:
  ```njk
  {% if component.id %}id="{{ component.id }}"{% endif %}
  ```
- **Многострочные циклы for** - Форматируйте циклы с правильными отступами
- **Комментарии** - Используйте `{# #}` для блоков документации

#### SCSS

- **БЕЗ BEM нотации** - Избегайте синтаксиса `__element` и `--modifier`
- **Используйте вложенность** - Вкладывайте связанные селекторы вместо BEM:
  ```scss
  .component {
      .header {
          .title { }
      }
  }
  ```
- **Разделители секций** - Используйте разделители комментариев:
  ```scss
  // --------------------------------------
  // Название секции
  // --------------------------------------
  ```
- **Цепочки состояний** - Объединяйте состояния для специфичности:
  ```scss
  &:hover:not(:disabled):not(.disabled) { }
  ```
- **CSS переменные** - Используйте CSS кастомные свойства с префиксом имени компонента:
  ```scss
  --button-padding-md: 0.75rem;
  ```

### Соглашения об именовании параметров

**Общие параметры, которые должны поддерживать все компоненты:**
- `id` - Атрибут ID элемента
- `class` - Дополнительные CSS классы
- `name` - Имя элемента формы
- `disabled` - Отключенное состояние (булево)
- `data` - Объект data атрибутов
- `aria` - Объект aria атрибутов

**Именование размеров/вариантов:**
- `size: "sm|md|lg"` - Маленький, средний, большой
- `variant` - Варианты компонента (например, "primary", "secondary")

**Булевые флаги:**
- Используйте простые булевые имена: `disabled`, `readonly`, `required`, `error`
- НЕ: `isDisabled`, `hasError`


### Чеклист интеграции

При добавлении нового компонента:

1. ✅ Создать директорию компонента: `src/components/general/component-name/`
2. ✅ Создать шаблон `.njk` как **макрос** (без комментариев документации внутри)
   ```njk
   {% macro render(param1="default", param2="default") %}
       {# Реализация компонента #}
   {% endmacro %}
   ```
3. ✅ Создать файл `.scss` с правильной структурой (использовать имя компонента как базовый класс)
4. ✅ Создать файл `.js`, если компонент нуждается в логике
5. ✅ Импортировать SCSS в `src/scss/index.scss`:
   ```scss
   @use "../components/general/component-name/component-name";
   ```
6. ✅ Импортировать и добавить в массив компонентов в `src/js/index.js` (при необходимости):
   ```js
   import { componentName } from "../components/general/component-name/component-name.js";

   const components = [menu, tabs, componentName]; // Добавить в массив
   ```
7. ✅ Добавить поддержку ARIA атрибутов для доступности
8. ✅ По прямому требованию пользователя запустить линтеры: `npm run lint` и исправить все проблемы
9. ✅ Отформатировать код: `npm run format:fix` для обеспечения единообразного форматирования
