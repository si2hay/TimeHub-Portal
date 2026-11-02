```markdown
# TimeHub-Portal — AI Guide (Read this first)

> ⚠️ **ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ:** Данное руководство может содержать устаревшую информацию. Проект активно развивается, файлы и архитектура могут меняться. Перед написанием любого кода или внесением изменений необходимо запросить у пользователя актуальную структуру проекта и текущие версии файлов для сверки. Не полагайтесь слепо на этот текст — всегда проверяйте исходный код.

> **ВНИМАНИЕ ДЛЯ ИИ-АССИСТЕНТА:** Вы — Senior Frontend разработчик, задача которого — поддерживать и развивать проект **TimeHub-Portal**. Необходимо писать чистый, надежный код, не ломать существующую архитектуру и строго следовать правилам ниже.

---

## 🛑 ПРАВИЛО №1: Как начинать работу в новом чате

Прежде чем писать код, давать советы или менять файлы, **необходимо запросить у пользователя актуальную структуру проекта и исходный код**.

Нельзя додумывать файлы, которых нет перед глазами. Отправьте пользователю следующий запрос:

*"Привет! Чтобы я не сломал проект, скинь мне, пожалуйста, актуальную структуру файлов. Открой терминал в корне проекта и введи команду: `find . -not -path '*/.*' -not -path '*/node_modules/*'`"*

Если задача касается конкретных модулей (например, настройки, стейт, билдер, data-manager), необходимо также запросить их актуальное содержимое текстом. Только после получения кода можно приступать к работе.

---

## 1. Обзор проекта

**TimeHub-Portal** — учебный SPA-портал для студента. Изначально создан для Газпром колледжа Волгограда (группа 26 АТП-2Бо), но теперь позиционируется как **универсальная платформа для любого учебного заведения**. Любой студент может собрать свое расписание в Конструкторе, отправить его в Telegram-группу, и админ добавит его на сайт.

### Функционал
- **Расписание пар** с учётом чётной/нечётной недели и замен.
- **Таймер** до конца/начала пары с адаптивным полноэкранным режимом.
- **Погода** в Волгограде с советами по одежде.
- **Заметки + чек-лист** с синхронизацией в Telegram CloudStorage.
- **Стрик (огонёк)** — счётчик дней подряд с визуальной эволюцией (оранжевый → красный → синий → фиолетовый → золотой).
- **Справочник** (библиотеки, консультации, калькулятор оценок).
- **12+ тем оформления**, 7 шрифтов, настройка размера текста, установка своих обоев (картинка/видео).
- **Офлайн-режим** через Service Worker.
- **Установка как PWA** на Android и ПК.
- **Работа как Telegram Mini App** (бот `@timehub_portal_bot`).
- **Конструктор** для добавления расписаний любых групп (файл `.js`) и замен (файл `data.json`).

### Технологический стек
- Чистый **Vanilla JS (ES6 Modules)**. Запрещено использовать React, Vue, jQuery, TypeScript или сборщики (Webpack/Vite).
- **HTML5 + CSS3** (CSS-переменные, Grid, Flexbox, анимации).
- **Хостинг:** GitHub Pages (чистая статика, без бэкенда).
- **Интеграция:** Telegram Web App API + CloudStorage.
- **Хранение:** `localStorage` (локальные настройки) + `Telegram CloudStorage` (заметки, чек-лист, стрик).

### Ссылки
- **Репозиторий:** `https://github.com/si2hay/TimeHub-Portal`
- **Сайт:** `https://si2hay.github.io/TimeHub-Portal/`
- **Конструктор:** `https://si2hay.github.io/TimeHub-Portal/builder.html`
- **Бот:** `https://t.me/timehub_portal_bot/portal`
- **Локальный путь:** `/home/si2hay/Documents/TimeHub-Portal/`

---

## 2. Быстрый старт

### Локальный запуск
1. Открыть папку в VS Code / VSCodium.
2. Установить расширение **Live Server**.
3. ПКМ по `index.html` → **Open with Live Server** (порт 5500).
4. Для Конструктора: ПКМ по `builder.html` → **Open with Live Server**.

### Деплой на GitHub Pages
```bash
git add .
git commit -m "описание изменений"
git push origin master
```

**Важно про Git-хук:** В проекте настроен `.git/hooks/pre-commit`, который автоматически меняет `CACHE_NAME` в `sw.js` на текущий timestamp (`timehub-v<unixtime>`). Это сбрасывает кэш у пользователей при каждом пуше. Пользователю не нужно менять версию вручную.

### Service Worker и авто-обновление
`pwa.js` использует `updateViaCache: 'none'` — браузер всегда проверяет `sw.js` на сервере. Каждые 60 секунд вызывается `registration.update()`. При активации нового воркера страница автоматически перезагружается через событие `controllerchange`.

---

## 3. Полная архитектура файлов

```text
├── index.html              # Точка входа SPA (telegram-web-app.js + Google Fonts)
├── builder.html            # Конструктор (2 режима: Расписание / Замены)
├── manifest.json           # PWA манифест (иконки, цвета, название)
├── sw.js                   # Service Worker (офлайн-режим, авто-обновление)
├── README.md               # Документация для GitHub
├── AI_GUIDE.md             # Этот файл
├── .nojekyll               # Отключает Jekyll на GitHub Pages (иначе папки с _ игнорируются)
│
├── assets/
│   ├── css/
│   │   ├── style.css       # Все базовые стили (скелетоны, масштабирование, стрик, модалки)
│   │   ├── themes.css      # CSS-переменные для всех тем (dark, dota, minecraft, ocean и т.д.)
│   │   ├── radial.css      # Стили для радиального меню дней недели
│   │   └── builder.css     # Стили Конструктора
│   │
│   ├── fonts/
│   │   ├── MinecraftRus.ttf / .woff2   # Шрифт по умолчанию
│   │   └── Tsap-Tsarap.ttf / .woff2    # Альтернативный шрифт
│   │
│   ├── icons/              # (зарезервировано, сейчас пусто)
│   ├── img/                # (зарезервировано)
│   │
│   └── js/
│       ├── main.js         # Точка входа: сборка UI, Telegram-фишки, applyBackground
│       ├── config.js       # Константы (SEMESTER_START_DATE, VERSION, DEFAULT_SETTINGS)
│       ├── state.js        # Singleton (стейт, стрик, шина событий)
│       ├── telegram-storage.js # Обёртка над localStorage и TG CloudStorage
│       ├── storage.js      # (устарел, оставлен для совместимости)
│       ├── themes.js       # applyTheme, applyFont, applyTextScale, initThemes
│       ├── particles.js    # Анимация частиц на фоне (Canvas)
│       ├── pwa.js          # Регистрация SW + авто-обновление + promptInstall
│       ├── data-manager.js # Склейка расписания и замен (из JSON, ТОЛЬКО на сегодня)
│       ├── builder.js      # Логика Конструктора + транслитерация + автоподстановка
│       ├── debug.js        # Отладочный режим (см. ниже)
│       ├── router.js       # (зарезервировано)
│       ├── utils.js        # Утилиты (timeToMinutes, formatTimeLeft)
│       │
│       └── ui/
│           ├── header.js           # Шапка (лого, дата, стрик, шестерёнка)
│           ├── controls.js         # Панель недели/группы + виджет погоды
│           ├── timer.js            # Таймер пар (обычный + полноэкранный режим)
│           ├── schedule.js         # Карточки расписания (использует skeleton.js)
│           ├── skeleton.js         # Заглушки загрузки (shimmer)
│           ├── weather.js          # (может не использоваться, погода внутри controls.js)
│           ├── reference.js        # Справочник (аккордеон)
│           ├── notes.js            # Заметки + чек-лист (облако)
│           ├── footer.js           # Подвал (дисклеймер, контакты)
│           ├── settings.js         # Модалка настроек (темы, шрифты, QR, версия)
│           ├── full-schedule.js    # Модалка расписания на неделю
│           └── radial-day-picker.js # Радиальное меню дней недели
│
├── data/
│   ├── bells.js            # Звонки (course1 для 1 курса, course2plus для 2+)
│   ├── teachers.js         # (возможно, устарел, база преподавателей в dictionary.js)
│   ├── groups.js           # (устарел, группы берутся из расписаний)
│   ├── dictionary.js       # Словарь (Предмет → Учителя + Кабинеты) для Билдера
│   │
│   ├── schedule/
│   │   ├── manifest.json   # Список всех файлов расписаний
│   │   ├── index.js        # Агрегатор (читает manifest.json через fetch + import())
│   │   ├── 26ATP-1Bo.js    # Расписание группы 26 АТП-1Бо
│   │   ├── 26ATP-2Bo.js    # Расписание группы 26 АТП-2Бо (основная)
│   │   └── 26ATP-3Bo.js    # Расписание группы 26 АТП-3Бо
│   │
│   └── substitutions/
│       └── data.json       # ⚠️ ВАЖНО: Замены теперь хранятся ТОЛЬКО в JSON!
│
└── screenshots/            # Скриншоты для README
    ├── main.png
    ├── timer.png
    ├── themes.png
    ├── settings.png
    ├── notes.png
    └── builder.png
```

---

## 4. Ключевые архитектурные изменения (Версия 1.3+)

### 🚨 Система замен переведена на JSON

**ВНИМАНИЕ:** Файла `data/substitutions/index.js` больше НЕТ. Если вы видите его в старых коммитах — он устарел и удалён.

Все замены теперь хранятся в **`data/substitutions/data.json`**:

```json
{
  "2026-11-02": {
    "26 АТП-2Бо": {
      "4": { "subject": "Физика", "room": "2-107", "teacher": "Бондарь А.С." }
    }
  },
  "2026-11-03": {
    "26 АТП-2Бо": {
      "2": { "subject": "Информатика", "room": "2-213", "teacher": "Ушакова Е.П." }
    }
  }
}
```

**Правила:**
- Ключ верхнего уровня — дата в формате `YYYY-MM-DD` (ISO-формат). Это позволяет сравнивать даты лексикографически: `"2026-11-03" < "2026-11-04"` возвращает `true`.
- Ключ второго уровня — название группы (кириллица с пробелами).
- Ключ третьего уровня — номер пары (строка, например `"4"`).
- Значение — объект `{ subject, room, teacher }`.
- Если `subject` пустой (`""`) — пара автоматически удаляется из расписания на этот день.
- Если пары не было в базовом расписании, но она есть в замене — она добавляется.

**Загрузка замен в `data-manager.js`:**
1. Проверяется флаг `isToday` (совпадает ли выбранный `week` и `day` с текущей датой).
2. Если `isToday === false` — замены НЕ применяются (иначе они бы применялись ко всем дням).
3. Если `isToday === true` — идёт `fetch()` к `data.json` с обходом кэша через `?t=Date.now()`.
4. Весь `fetch` обёрнут в `try/catch` (если файла нет — сайт не падает, просто показывает базовое расписание).

### 🛠 Обновленный Конструктор (`builder.js`)

- Имеет **два режима** (переключатель в левой панели):
  - `schedule` — генерация файла группы (`.js`).
  - `substitution` — генерация замен (`.json`).
- **Транслитерация:** функция `transliterate()` переводит `26 АТП-2Бо` → `26ATP-2Bo` (для имени файла). Функция `formatGroupName()` переводит `26ATP-2Bo` → `26 АТП-2Бо` (для ключа внутри файла).
- **Автоподстановка:** при выборе предмета из словаря (`DICTIONARY`), если поля «Кабинет» и «Преподаватель» пустые — они автоматически заполняются первым вариантом. Поля подсвечиваются зелёным классом `.autofilled` (анимация `fill-flash` в `builder.css`).
- **Авто-очистка замен:** при генерации новых замен скрипт скачивает текущий `data.json`, удаляет все даты, которые меньше сегодняшней (`dateKey < todayStr`), добавляет новые и выдаёт пользователю готовый файл на скачивание.
- **Ограничения:**
  - Максимум **7 пар** в день (`nextPairNum > 7` → `alert`).
  - Проверка на дубликаты номеров пар (`isDuplicate`) — если номер занят, ищется первый свободный.
- **Модалка:** после генерации открывается окно с двумя вкладками: «Код файла» и «Строка для manifest.json». В режиме замены кнопка меняется на «💾 Скачать data.json».

### 📱 QR-код и Поделиться (`ui/settings.js`)

Функция `openQRCodeModal()`:
- **Внутри Telegram** (`window.Telegram?.WebApp?.initData`) генерирует QR-код на короткую ссылку бота: `https://t.me/timehub_portal_bot/portal`. Это нужно, чтобы код сканировался (длинная URL с параметрами Telegram делала QR слишком плотным).
- **В обычном браузере** генерирует QR-код на `window.location.origin + pathname` (чистая ссылка на GitHub Pages).
- Использует библиотеку `qr-code-styling@1.5.0` через `esm.sh` (динамический импорт).
- Цвет QR подстраивается под тему через `ensureDarkEnough()` (затемняет слишком светлые акценты).
- Логотип в центре QR — SVG-логотип проекта.

### 🔥 Стрик (Огонек) и Шапка (`state.js` + `ui/header.js`)

- **`state.js`:** `initStreak()` сравнивает `lastVisit` с текущей датой. Если разница 1 день → `count++`, иначе `count = 1`. Сохраняет в облако.
- **`ui/header.js`:**
  - При клике на логотип открывается меню с огоньком (`#streak-dropdown`).
  - Цвет зависит от `count`: 10+ (красный), 30+ (синий), 60+ (фиолетовый), 100+ (золотой).
  - **Секретки:** 5 кликов по логотипу → тема `matrix`, 10 кликов → `nothing`.
- **Z-index:** В `style.css` прописаны жёсткие `z-index`: `.app-header` (`z-index: 100`), `.header-logo` (`z-index: 101`), `.streak-dropdown` (`z-index: 9999`). Без этого огонек перекрывается панелью расписания на ПК.

---

## 5. Правила хранения данных (КРИТИЧЕСКИ ВАЖНО)

### 5.1. Локальные данные (только на устройстве)

| Ключ | Что хранит | Синхронизация |
|------|-----------|---------------|
| `timehub_settings` | Тема, шрифт, группа, обои (URL, darkness, blur), textScale, liquidGlass, particles, weatherApi, course | ❌ НЕТ |
| `timehub_builder_state` | Состояние Конструктора (`{ mode, groupName, week, day, subDate, schedule }`) | ❌ НЕТ |

**Правило:** Настройки на телефоне и ПК могут отличаться. Это фича, не баг.

### 5.2. Облачные данные (Telegram CloudStorage)

| Ключ | Что хранит | Синхронизация |
|------|-----------|---------------|
| `timehub_notes` | Текст заметок (строка) | ✅ ДА |
| `timehub_checklist` | JSON-массив `[{ text, done }]` | ✅ ДА |
| `timehub_streak` | `{ count: number, lastVisit: "YYYY-MM-DD" }` | ✅ ДА |

### 5.3. Модуль `telegram-storage.js`

- Инициализация: при загрузке проверяет `window.Telegram?.WebApp`. Если есть — вызывает `tg.ready()` и `tg.expand()` (разворот на весь экран).
- `smartStorage.getItem(key)` — сначала пытается взять из облака TG. Если пусто или ошибка — читает из `localStorage`.
- `smartStorage.setItem(key, value)` — сначала пишет в `localStorage`, затем (если в TG) дублирует в облако.
- **Лимит Telegram CloudStorage:** 4000 символов на ключ (проверка: `value.length > 4000` → `console.warn`, сохранение только локально).
- Все методы **асинхронные** (возвращают `Promise`). Всегда используйте `await`.

### 5.4. Ограничения синхронизации

- Синхронизация заметок/чек-листа/стрика работает **только между клиентами Telegram** (Телефон, ПК, Веб).
- В обычном браузере — только `localStorage` (данные не уходят на сервер).
- При загрузке сайт сначала показывает локальные данные, а затем (если в TG) обновляет их облачными.

---

## 6. Ключевые модули — подробный разбор

### 6.1. `main.js` — Точка входа

- Импортирует все UI-компоненты и вызывает их функции: `createHeader()`, `createControls()`, `createTimer()`, `createSchedule()`, `createReference()`, `createNotes()`, `createFooter()`, `createRadialDayPicker()`.
- **Фильтр ошибок:** `window.addEventListener('error', ...)` — игнорирует `Script error` (внутренние ошибки Telegram WebView).
- **Telegram-фишки:**
  - `tg.BackButton.onClick()` — закрывает последнюю модалку.
  - `setInterval` каждые 500 мс — показывает/скрывает нативную кнопку «Назад» в зависимости от наличия `.modal-overlay`.
  - `checkFocus()` на `focusin`/`focusout` — включает `enableClosingConfirmation()`, если фокус в `TEXTAREA`/`INPUT` (защита от случайного свайпа при вводе текста).
- **`applyBackground()`** — применяет обои из настроек:
  - Если `bgUrl` пустой — скрывает контейнер, ставит стандартный фон.
  - Если задан — показывает `#custom-bg-container`, применяет `opacity` (затемнение) и `blur` (размытие).
  - Поддерживает видео (`.mp4`, `.webm`, `.ogg`) и картинки.
  - Подписка: `state.on('change:settings', applyBackground)`.

### 6.2. `state.js` — Singleton

- `state.get(key)` — получить значение.
- `state.set(key, value)` — установить и оповестить подписчиков через `emit(`change:${key}`)`.
- `state.on(event, callback)` — подписаться на событие.
- `state.emit(event, data)` — вызвать событие.
- `state.determineWeek()` — вычислить текущую неделю от `SEMESTER_START_DATE` (26.10.2026).
- `state.initStreak()` — проверить и обновить стрик (см. раздел 4).
- **ВНИМАНИЕ:** Метода `state.getNow()` НЕТ. Используйте обычный `new Date()`.

### 6.3. `config.js` — Константы

```javascript
export const CONFIG = {
    APP_NAME: "TimeHub-Portal",
    VERSION: "1.1.0",
    SEMESTER_START_DATE: new Date("2026-10-26T00:00:00"),
    DEFAULT_SETTINGS: {
        theme: "dark",
        font: "minecraft",
        particles: true,
        liquidGlass: true,
        pulse: true,
        weatherApi: "open-meteo",
        group: "26 АТП-2Бо",
        course: 1,
        textScale: 1
    }
};
```

`VERSION` выводится в самом низу модалки настроек (`TimeHub-Portal • v1.1.0`).

### 6.4. `themes.js` — Применение тем/шрифтов/масштаба

- `applyTheme(name)` — сбрасывает классы `body`, добавляет `theme-{name}`, вызывает `applyFont(currentFont)`, сохраняет в `state.set('settings', ...)`.
- `applyFont(name)` — удаляет все классы шрифтов, добавляет `font-{name}`. Доступные: `minecraft`, `tsap`, `inter`, `roboto`, `rubik`, `play`, `montserrat`.
- `applyTextScale(scale)` — ставит CSS-переменную `--text-scale` на `document.documentElement`.
- `initThemes()` — применяет всё при старте из сохранённых настроек.

### 6.5. `data-manager.js` — Склейка данных

Главная функция: `getLessonsForDay(week, day, group)`.

**Алгоритм:**
1. Получить базовое расписание из `ALL_SCHEDULES[group]` (week1 или week2).
2. Проверить `isToday` (совпадает ли `week` с текущей неделей и `day` с текущим днём).
3. Если `isToday === true` — сделать `fetch()` к `data.json` с `?t=Date.now()`.
4. Применить замены: если `subject === ""` — удалить пару, иначе — заменить.
5. Отсортировать по номеру пары.
6. Применить `customTimes` (кастомное время для конкретных пар).
7. Вернуть массив пар.

**Возвращает `null`, если группы нет в `ALL_SCHEDULES`.**

### 6.6. `data/schedule/index.js` — Агрегатор

```javascript
let ALL_SCHEDULES = {};
const response = await fetch(new URL('./manifest.json', import.meta.url));
const manifest = await response.json();
const modules = await Promise.all(manifest.files.map(file => import(`./${file}`)));
modules.forEach(mod => {
    const exportKey = Object.keys(mod)[0];
    if (exportKey && mod[exportKey]) {
        ALL_SCHEDULES = { ...ALL_SCHEDULES, ...mod[exportKey] };
    }
});
export { ALL_SCHEDULES };
```

**Как работает:** читает `manifest.json`, для каждого файла делает динамический `import()`, объединяет все `SCHEDULE_*` объекты в один `ALL_SCHEDULES`.

### 6.7. `ui/skeleton.js` — Скелетоны загрузки

- `renderScheduleSkeleton()` — возвращает HTML с 3 псевдо-карточками.
- Класс `.shimmer` (в `style.css`) — анимация переливающегося градиента.
- Вызывается в `ui/schedule.js` перед загрузкой данных: `container.innerHTML = renderScheduleSkeleton()`.

### 6.8. `ui/notes.js` — Заметки и чек-лист

- **HTML:** `.notes-grid` (2 колонки на ПК, 1 на телефоне через media query).
- **Чек-лист:** массив `tasks`, рендерится в `.checklist`. При изменении — `saveTasks()` (через `smartStorage`).
- **Текст заметок:** `textarea` с debounce-сохранением (500 мс). Статус «Сохранение...» → «Сохранено!».
- **Флаг `isLoaded`:** блокирует сохранение, пока данные не загрузились из облака (иначе пустой массив перезапишет облако).
- **XSS-защита:** регулярка `replace(/[^a-zA-Zа-яА-Я0-9\s.,!?\-]/g, '')`.

### 6.9. `ui/settings.js` — Настройки

- Модалка со всеми настройками: темы, шрифты, размер текста, обои (URL или файл), эффекты, погода, PWA-установка, QR-код, связь с автором.
- **QR-код:** `openQRCodeModal()` — генерирует QR через `qr-code-styling@1.5.0` (динамический импорт с `esm.sh`). Внутри TG — короткая ссылка на бота, в браузере — на GitHub Pages.
- **Плашка версии:** в самом низу модалки (`v${CONFIG.VERSION}`).
- **Обработчики:** все клики по кнопкам сохраняют настройки через `state.set('settings', ...)`.

### 6.10. `ui/header.js` — Шапка и стрик

- Логотип, дата, шестерёнка.
- **Стрик:** клик по логотипу открывает `#streak-dropdown`. Цвет огонька зависит от `count`.
- **Секретки:** 5 кликов → `matrix`, 10 кликов → `nothing`.

### 6.11. `builder.js` — Конструктор

Подробно описан в разделе 4.2.

### 6.12. `pwa.js` — Service Worker и установка

- `initPWA()`:
  - Слушает `beforeinstallprompt` → сохраняет `deferredPrompt`, меняет текст кнопки установки.
  - Слушает `appinstalled` → меняет текст на «✅ Приложение установлено».
  - Регистрирует `sw.js` с `updateViaCache: 'none'`.
  - Слушает `updatefound` → если новый воркер установлен и есть старый → отправляет `SKIP_WAITING`.
  - Каждые 60 секунд вызывает `registration.update()`.
  - Слушает `controllerchange` → перезагружает страницу (один раз).
- `promptInstall()` — вызывает `deferredPrompt.prompt()`. Если `deferredPrompt === null` — показывает `alert` с инструкцией по ручной установке.

### 6.13. `sw.js` — Service Worker

- Стратегия: **Network First** (сначала сеть, потом кэш).
- **`install`:** вызывает `skipWaiting()`, кэширует `ASSETS` (основные файлы).
- **`activate`:** удаляет старые кэши (`cacheName !== CACHE_NAME`), вызывает `clients.claim()`.
- **`message`:** обрабатывает `SKIP_WAITING` (принудительная активация нового воркера).
- **`fetch`:** игнорирует запросы к `telegram.org`, `open-meteo.com`, `wttr.in`, `esm.sh`, `fonts.googleapis.com`, `fonts.gstatic.com` (чтобы не кэшировать API). Для остальных — Network First.
- **`CACHE_NAME`:** автоматически меняется Git-хуком при каждом коммите.

---

## 7. Форматы данных

### 7.1. `data/bells.js`

```javascript
export const BELLS = {
    course1: [
        { pair: 1, start: "08:30", end: "10:05" },
        { pair: 2, start: "10:15", end: "12:15" },
        { pair: 3, start: "12:25", end: "14:00" },
        { pair: 4, start: "14:10", end: "15:45" },
        { pair: 5, start: "16:15", end: "17:50" }
    ],
    course2plus: [
        { pair: 1, start: "09:10", end: "10:40" },
        // ...
    ]
};
```

- `course1` — для групп на **26**.
- `course2plus` — для **25/24/23**.
- Время в формате `"HH:MM"`.
- Пара = 95 минут (45 + 5 + 45).

### 7.2. `data/schedule/[группа].js`

```javascript
export const SCHEDULE_26ATP_2Bo = {
    "26 АТП-2Бо": {
        week1: {
            1: [
                { pair: 1, subject: "Разговоры о важном", room: "2-110", teacher: "Куратор" },
                { pair: 2, subject: "Литература", room: "320общ", teacher: "Невзорова М.С." },
                // ...
            ],
            2: [], 3: [], 4: [], 5: []
        },
        week2: {
            // ...
        },
        customTimes: [
            [1, 1, 1, "09:20", "10:05"]  // [week, day, pair, start, end]
        ]
    }
};
```

- Ключ — название группы (может быть с пробелами/кириллицей).
- `week1` / `week2` — дни от 1 (Пн) до 5 (Пт).
- `customTimes`: `[week, day, pair, start, end]`.

### 7.3. `data/schedule/manifest.json`

```json
{ "files": ["26ATP-1Bo.js", "26ATP-2Bo.js", "26ATP-3Bo.js"] }
```

- Без файла в манифесте расписание не загрузится.
- При добавлении группы — добавить её файл в массив `files`.

### 7.4. `data/substitutions/data.json`

```json
{
  "2026-11-02": {
    "26 АТП-2Бо": {
      "4": { "subject": "Физика", "room": "2-107", "teacher": "Бондарь А.С." }
    }
  }
}
```

- Формат даты: `YYYY-MM-DD`.
- Если `subject === ""` — пара удаляется.
- Замены применяются только на сегодня (см. `data-manager.js`).

### 7.5. `data/dictionary.js`

```javascript
export const DICTIONARY = {
    "Математика": {
        teachers: ["Зайцева Н.Н.", "Клочкова Н.В.", "Степанова Т.С."],
        rooms: ["2-213", "2-212", "2-308"]
    },
    "Информатика": {
        teachers: ["Ушакова Е.П.", "Ушакова Е.П. / Резникова О.С."],
        rooms: ["212", "212 / 2-204"]
    },
    "кл.час": {
        teachers: [],
        rooms: []
    }
};

export const ALL_TEACHERS = [...new Set(Object.values(DICTIONARY).flatMap(d => d.teachers))].sort();
export const ALL_ROOMS = [...new Set(Object.values(DICTIONARY).flatMap(d => d.rooms))].sort();
export const ALL_SUBJECTS = Object.keys(DICTIONARY).sort();
```

- Подгруппы через ` / `.
- Пустые массивы (например, у `кл.час`) — чтобы автоподстановка не заполняла поля.

---

## 8. Логика расчётов

### Вычисление недели
```javascript
determineWeek() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = CONFIG.SEMESTER_START_DATE;
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24));
    return (Math.floor(diffDays / 7) % 2) + 1;
}
```

- 28 октября 2026 → 1-я неделя.
- 02 ноября 2026 → 2-я неделя.

### Определение курса
```javascript
const isSecondYear = group.startsWith('25');
const bells = isSecondYear ? BELLS.course2plus : BELLS.course1;
```

### Таймер
- Пара = 95 минут (45 минут первая полупара + 5 минут перемена + 45 минут вторая полупара).
- Если фактическая длительность ≤ 45 минут — таймер не ищет перемену внутри.
- Прогресс-бар показывает оставшееся время до конца текущего отрезка.

---

## 9. CSS-переменные и стили

```css
--bg-color, --bg-gradient, --surface-color
--text-main, --text-muted
--accent-color, --accent-hover
--border-color, --glass-bg, --glass-border, --glass-blur
--shadow, --border-radius
--font-family, --text-scale, --transition-speed
```

Все цвета — только через переменные. Хардкод `#ff0000` запрещён.

**Добавление новой темы:**
1. В `themes.css` — `body.theme-mytheme { ... }` со всеми переменными.
2. В `ui/settings.js` — добавить `{ id: 'mytheme', name: 'Моя тема' }` в массив `THEMES`.

---

## 10. Рецепты частых задач

### Добавить группу
1. Сгенерировать файл в Билдере (режим «Расписание»).
2. Положить в `data/schedule/`.
3. Добавить имя файла в `data/schedule/manifest.json`.
4. `git push`.

### Добавить замену
1. В Билдере выбрать режим «Замены».
2. Выбрать дату, добавить только изменённые пары.
3. Нажать «Скачать data.json».
4. Заменить старый файл `data/substitutions/data.json` новым.
5. `git push`.

### Изменить звонки
1. Открыть `data/bells.js`.
2. Отредактировать `course1` / `course2plus`.

### Добавить преподавателя/кабинет
1. Открыть `data/dictionary.js`.
2. Добавить в массив `teachers` или `rooms`.

### Сменить дату старта семестра
1. Открыть `config.js`.
2. Изменить `SEMESTER_START_DATE`.

### Добавить тему
1. В `themes.css` — `body.theme-mytheme { ... }`.
2. В `ui/settings.js` — в массив `THEMES`.

### Добавить шрифт
1. Закинуть `.woff2` и `.ttf` в `assets/fonts/`.
2. В `index.html` — Google Fonts (или `@font-face` в `style.css`).
3. В `themes.js` — обработка в `applyFont()`.
4. В `ui/settings.js` — кнопка с `data-font`.

---

## 11. Правила стиля и антипаттерны

### ✅ Делать
- Писать комментарии на русском языке к сложной логике.
- Использовать `new Date()` (метода `state.getNow()` НЕТ).
- Изменения стейта — через `state.set()`.
- DOM — через `document.createElement()`.
- Цвета — через CSS-переменные.
- Асинхронные операции с облаком — через `await`.
- Перед коммитом убедиться, что `CACHE_NAME` обновится (хук сделает это сам).

### ❌ Не делать
- Не использовать фреймворки (React/Vue) и сборщики.
- Не использовать `innerHTML` для пользовательских данных (только `textContent`).
- **Не создавать файл `data/substitutions/index.js`**. Только `data.json`.
- Не удалять `z-index` у шапки и меню стрика (иначе огонек будет перекрыт).
- Не хардкодить цвета.
- Не писать код «вслепую» без актуальных файлов.

---

## 12. Известные баги и их фиксы

| Симптом | Причина | Решение |
|---------|---------|---------|
| Старая версия сайта | Не обновлён `CACHE_NAME` | Git-хук делает это автоматически |
| Настройки не синхронизируются | Так и должно быть | Фича, не баг |
| Таймер вылезает за экран | `transform: scale()` | Использовать `clamp()` и `vw` |
| Ошибка `Script error` в TG | Внутренняя ошибка WebView | Игнорируется в `main.js` |
| Стрик не растёт | `lastVisit` не совпадает | Проверить `initStreak()` |
| Замены не отображаются | Ошибка в `data.json` | Проверить валидность JSON и дату `YYYY-MM-DD` |
| Замены показываются на все дни | Ошибка в `data-manager.js` | Проверить проверку `isToday` |
| Чек-лист на ПК с полосой прокрутки | `max-height` и `overflow-y` в CSS | Убрать, чтобы тянулся вместе с заметками |
| QR-код не сканируется в TG | Длинная ссылка с параметрами | Использовать короткую ссылку `https://t.me/timehub_portal_bot/portal` |
| Огонек перекрывается панелью | Нет `z-index` у шапки | Проверить `z-index: 100` у `.app-header` |
| `state.getNow is not a function` | Метода нет в `state.js` | Использовать `new Date()` |

---

## 13. Устаревшие и зарезервированные файлы

- `data/teachers.js` — возможно, устарел (база преподавателей теперь в `dictionary.js`).
- `data/groups.js` — устарел (группы берутся из расписаний).
- `assets/js/storage.js` — устарел, оставлен для совместимости.
- `assets/js/router.js` — зарезервирован (SPA-роутер не реализован).
- `assets/js/debug.js` — отладочный режим (см. код).

---

## 14. Служебные файлы

- **`.nojekyll`** — отключает Jekyll на GitHub Pages (иначе папки с `_` игнорируются).
- **`manifest.json`** — PWA-манифест (иконки, цвета, название, display: standalone).
- **`screenshots/`** — скриншоты для README.
- **`.git/hooks/pre-commit`** — Git-хук, обновляет `CACHE_NAME` в `sw.js` перед каждым коммитом.

---

## 15. Telegram Mini App — особенности

- **Скрипт:** `https://telegram.org/js/telegram-web-app.js` подключается в `<head>` `index.html` с `crossorigin="anonymous"`.
- **`initData`:** при загрузке проверяется `window.Telegram?.WebApp?.initData`. Если пусто — это обычный браузер.
- **`tg.ready()` и `tg.expand()`** — вызываются в `telegram-storage.js` при инициализации.
- **Нативная кнопка «Назад»:** `tg.BackButton` — закрывает модалки. Управляется из `main.js`.
- **Защита от закрытия:** `tg.enableClosingConfirmation()` — при фокусе в `INPUT`/`TEXTAREA`.
- **Кнопка меню:** настраивается в BotFather (`/setmenubutton`), открывает `https://si2hay.github.io/TimeHub-Portal/`.

---

## 16. Контакты

- **Telegram-группа:** `https://t.me/+sq9RDqa2I2A3M2Iy`
- **Почта:** `gemg944@gmail.com`
- **GitHub:** `https://github.com/si2hay`
```