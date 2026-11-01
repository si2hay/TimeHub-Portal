```markdown
# TimeHub-Portal — AI Guide (Read this first)

> ⚠️ **ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ:** Данное руководство может содержать устаревшую информацию. Проект активно развивается, файлы и архитектура могут меняться. Перед написанием любого кода или внесением изменений необходимо запросить у пользователя актуальную структуру проекта и текущие версии файлов для сверки. Не полагайтесь слепо на этот текст — всегда проверяйте исходный код.

> **ВНИМАНИЕ ДЛЯ ИИ-АССИСТЕНТА:** Вы — Senior Frontend разработчик, задача которого — поддерживать и развивать проект **TimeHub-Portal**. Необходимо писать чистый, надежный код, не ломать существующую архитектуру и строго следовать правилам ниже.

## 🛑 ПРАВИЛО №1: Как начинать работу в новом чате
Прежде чем писать код, давать советы или менять файлы, **необходимо запросить у пользователя актуальную структуру проекта и исходный код**.
Нельзя додумывать файлы, которых нет перед глазами. Отправьте пользователю следующий запрос:
*"Привет! Чтобы я не сломал проект, скинь мне, пожалуйста, актуальную структуру файлов. Открой терминал в корне проекта и введи команду: `find . -not -path '*/.*' -not -path '*/node_modules/*'`"*

Если задача касается конкретных модулей (например, настройки или стейт), необходимо также запросить их актуальное содержимое текстом.

---

## 1. Обзор проекта

**TimeHub-Portal** — учебный SPA-портал для студента Газпром колледжа Волгограда (группа 26 АТП-2Бо).

**Функционал:**
- Расписание пар (учёт чётной/нечётной недели, замены).
- Таймер до конца/начала пары.
- Погода в Волгограде.
- Заметки + чек-лист (синхронизация в Telegram).
- Стрик (огонёк) — счётчик дней подряд.
- Справочник (библиотеки, консультации, калькулятор оценок).
- 12+ тем, 7 шрифтов, настройка размера текста.
- Офлайн-режим (Service Worker).
- Установка как PWA.
- Работа как Telegram Mini App.

**Технологии:**
- Чистый **Vanilla JS (ES6 Modules)**. Запрещено использовать React, Vue, jQuery, TypeScript или сборщики (Webpack/Vite).
- HTML5 + CSS3 (переменные, Grid, Flexbox, анимации).
- Хостинг: GitHub Pages (без бэкенда).
- Интеграция: Telegram Web App API + CloudStorage.

**Репозиторий:** `https://github.com/si2hay/TimeHub-Portal`
**Локальный путь:** `/home/si2hay/Documents/TimeHub-Portal/`

---

## 2. Быстрый старт

### Локальный запуск
1. Открыть папку в VS Code.
2. Установить расширение **Live Server**.
3. ПКМ по `index.html` → **Open with Live Server**.
4. Для Конструктора: ПКМ по `builder.html` → **Open with Live Server**.
5. Порт по умолчанию: `5500`.

### Деплой
```bash
git add .
git commit -m "описание изменений"
git push origin master
```
GitHub Pages пересоберёт сайт за 1-2 минуты.

**Ссылки после деплоя:**
- Сайт: `https://si2hay.github.io/TimeHub-Portal/`
- Конструктор: `https://si2hay.github.io/TimeHub-Portal/builder.html`
- Telegram-бот: `https://t.me/timehub_portal_bot/portal`

---

## 3. Полная архитектура файлов

```text
├── index.html              # Точка входа SPA (telegram-web-app.js + Google Fonts)
├── builder.html            # Конструктор (2 шага: скачать → отправить в ТГ)
├── manifest.json           # PWA манифест
├── sw.js                   # Service Worker (офлайн-режим)
├── README.md
├── AI_GUIDE.md             # Этот файл
├── .nojekyll               # Для GitHub Pages
│
├── assets/
│   ├── css/
│   │   ├── style.css       # Все стили (базовые, компоненты, скелетоны)
│   │   ├── themes.css      # CSS-переменные для тем
│   │   ├── radial.css      # Радиальное меню дней недели
│   │   └── builder.css     # Стили Конструктора
│   │
│   ├── fonts/              # .ttf и .woff2 (MinecraftRus, Tsap-Tsarap)
│   ├── icons/              # (зарезервировано)
│   └── img/                # Картинки
│
├── assets/js/
│   ├── main.js             # Сборка UI-компонентов
│   ├── config.js           # Константы (SEMESTER_START_DATE)
│   ├── state.js            # Singleton (стейт, стрик, шина событий)
│   ├── telegram-storage.js # Обёртка localStorage + TG CloudStorage
│   ├── storage.js          # (устарел, оставлен для совместимости)
│   ├── themes.js           # Применение тем/шрифтов/масштаба
│   ├── particles.js        # Анимация частиц (Canvas)
│   ├── pwa.js              # Регистрация Service Worker
│   ├── data-manager.js     # Склейка расписания и замен
│   ├── builder.js          # Логика Конструктора + транслитерация
│   ├── debug.js            # Отладка
│   ├── router.js           # (зарезервировано)
│   ├── utils.js            # Утилиты (timeToMinutes)
│   │
│   └── ui/
│       ├── header.js       # Шапка (лого, дата, стрик)
│       ├── controls.js     # Панель недели/группы + погода
│       ├── timer.js        # Таймер пар
│       ├── schedule.js     # Карточки расписания (skeleton.js)
│       ├── skeleton.js     # Заглушки загрузки (shimmer)
│       ├── weather.js      # Погода
│       ├── reference.js    # Справочник (аккордеон)
│       ├── notes.js        # Заметки + чек-лист (облако)
│       ├── footer.js       # Подвал
│       ├── settings.js     # Модалка настроек (темы, шрифты, обои, QR)
│       ├── full-schedule.js # Расписание на неделю
│       └── radial-day-picker.js
│
└── data/
    ├── bells.js            # Звонки (1 и 2+ курсы)
    ├── teachers.js         # База преподавателей
    ├── groups.js           # (устарел)
    ├── dictionary.js       # Словарь (Предмет → Учителя + Кабинеты)
    │
    ├── schedule/
    │   ├── manifest.json   # Список файлов расписаний
    │   ├── index.js        # Агрегатор
    │   ├── 26ATP-1Bo.js
    │   ├── 26ATP-2Bo.js
    │   ├── 26ATP-3Bo.js
    │   └── 26ATP.js
    │
    └── substitutions/
        └── index.js        # Замены по датам
```

---

## 4. Архитектура модулей

### Принцип работы
1. `index.html` подключает `main.js`.
2. `main.js` вызывает функции UI-компонентов (`createHeader()`, `createSchedule()`).
3. Компоненты возвращают DOM-элементы, которые вставляются в `#app`.
4. Компоненты читают `state.get(...)` и подписываются на `state.on('change:...')`.
5. Данные хранятся в `localStorage` и/или `Telegram CloudStorage`.

### Ключевые модули
- **`state.js`**: `state.get()`, `state.set()`, `state.on()`, `state.determineWeek()`, `state.initStreak()`.
- **`config.js`**: `CONFIG.SEMESTER_START_DATE`, `CONFIG.DEFAULT_SETTINGS`.
- **`data-manager.js`**: `getLessonsForDay(week, day, group)`.
- **`themes.js`**: `applyTheme()`, `applyFont()`, `applyTextScale()`, `initThemes()`.

---

## 5. Правила хранения данных (КРИТИЧЕСКИ ВАЖНО)

### 5.1. Локальные данные (только на устройстве)
| Ключ | Что хранит | Синхронизация |
|------|-----------|---------------|
| `timehub_settings` | Тема, шрифт, группа, обои, масштаб | ❌ НЕТ |
| `timehub_builder_state` | Состояние Конструктора | ❌ НЕТ |

**Правило:** Настройки на телефоне и ПК могут отличаться. Это фича.

### 5.2. Облачные данные (Telegram CloudStorage)
| Ключ | Что хранит | Синхронизация |
|------|-----------|---------------|
| `timehub_notes` | Текст заметок | ✅ ДА |
| `timehub_checklist` | Массив задач | ✅ ДА |
| `timehub_streak` | `{ count, lastVisit }` | ✅ ДА |

**Правило:** Если сайт открыт в браузере, облако недоступно → данные идут в `localStorage`.

**Модуль `telegram-storage.js`:**
- `smartStorage.getItem()` / `setItem()` — асинхронные (всегда `await`).
- **Лимит:** 4096 символов на ключ.

---

## 6. Ключевые модули — подробный разбор

### 6.1. Стрик (Огонёк) — `state.js` + `ui/header.js`
- **`state.js`**: `initStreak()` сравнивает `lastVisit` с текущей датой. Если разница 1 день → `count++`, иначе `count = 1`. Сохраняет в облако.
- **`ui/header.js`**: При клике на логотип открывается меню с огоньком. Цвет зависит от `count`: 10+ (красный), 30+ (синий), 60+ (фиолетовый), 100+ (золотой).
- **Секретка:** 5 кликов по логотипу → тема `matrix`, 10 кликов → `nothing`.

### 6.2. Конструктор — `builder.js` + `builder.html`
- Генерирует `.js` файл и сохраняет состояние в `timehub_builder_state`.
- **Транслитерация:** `transliterate()` переводит `26 АТП-2Бо` → `26ATP-2Bo.js`.
- Модалка скачивания: 2 шага (скачать файл → перейти в ТГ-группу).

### 6.3. Темы, шрифты, масштаб — `themes.js` + `ui/settings.js`
- `applyTheme(name)`, `applyFont(name)`, `applyTextScale(scale)`.
- Шрифты: `minecraft`, `tsap`, `inter`, `roboto`, `rubik`, `play`, `montserrat`.
- Google Fonts подключены в `index.html`.
- Масштаб через CSS-переменную `--text-scale` (в конце `style.css`).

### 6.4. Скелетоны — `ui/skeleton.js` + `ui/schedule.js`
- `renderScheduleSkeleton()` возвращает HTML с 3 псевдо-карточками.
- Анимация `.shimmer::after` — переливающийся градиент.

### 6.5. Service Worker — `sw.js`
- Стратегия: **Network First**.
- **ПРАВИЛО:** При любых изменениях CSS/JS **обязательно** изменить `CACHE_NAME` (`v4` → `v5`).

---

## 7. Форматы данных

### 7.1. `data/bells.js`
```javascript
export const BELLS = {
    course1: [ { pair: 1, start: "08:30", end: "10:05" } ],
    course2plus: [ /* ... */ ]
};
```
- `course1` — группы на **26**. `course2plus` — **25/24/23**.

### 7.2. `data/schedule/[группа].js`
```javascript
export const SCHEDULE_26ATP_2Bo = {
    "26 АТП-2Бо": {
        week1: { 1: [ { pair: 1, subject: "...", room: "...", teacher: "..." } ], 2: [], ... },
        week2: { /* ... */ },
        customTimes: [ [1, 1, 1, "09:20", "10:05"] ]
    }
};
```
- Ключ — название группы с пробелами.
- `customTimes`: `[week, day, pair, start, end]`.

### 7.3. `data/schedule/manifest.json`
```json
{ "files": ["26ATP-1Bo.js", "26ATP-2Bo.js"] }
```
- Без файла в манифесте расписание не загрузится.

### 7.4. `data/substitutions/index.js`
```javascript
export const SUBSTITUTIONS = {
    "2026-11-02": {
        "26 АТП-2Бо": {
            1: { subject: "Математика", room: "2-213", teacher: "Зайцева Н.Н." }
        }
    }
};
```
- Если `subject` пустой — пара удаляется.

### 7.5. `data/dictionary.js`
```javascript
export const DICTIONARY = {
    "Математика": {
        teachers: ["Зайцева Н.Н.", "Клочкова Н.В."],
        rooms: ["2-213", "2-212"]
    }
};
```
- Подгруппы через ` / `.

---

## 8. Логика расчётов

### Вычисление недели
```javascript
determineWeek() {
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7) % 2;
    return weekIndex + 1;
}
```

### Определение курса
```javascript
const isSecondYear = group.startsWith('25');
const bells = isSecondYear ? BELLS.course2plus : BELLS.course1;
```

### Таймер
- Пара = 90 минут (45 + 5 + 40).
- Если ≤ 45 минут — без поиска перемены.

---

## 9. CSS-переменные (шпаргалка)

```css
--bg-color, --bg-gradient, --surface-color
--text-main, --text-muted
--accent-color, --accent-hover
--border-color, --glass-bg, --glass-border, --glass-blur
--shadow, --border-radius
--font-family, --text-scale, --transition-speed
```
Все цвета — только через переменные. Хардкод запрещён.

---

## 10. Service Worker — правила

- Стратегия: Network First.
- При изменениях в CSS/JS/HTML — **менять `CACHE_NAME`**.
- Игнорирует: `telegram.org`, `open-meteo.com`, `wttr.in`, `esm.sh`.

---

## 11. Настройки пользователя — полная таблица

| Ключ | Где хранится | Что внутри |
|------|--------------|-----------|
| `timehub_settings` | localStorage | `{ theme, font, group, particles, liquidGlass, bgUrl, bgDarkness, bgBlur, textScale, weatherApi, course }` |
| `timehub_notes` | CloudStorage | Текст заметок |
| `timehub_checklist` | CloudStorage | `[{ text, done }]` |
| `timehub_streak` | CloudStorage | `{ count, lastVisit }` |
| `timehub_builder_state` | localStorage | `{ groupName, week, day, schedule }` |

---

## 12. Рецепты частых задач

### Добавить группу
1. Скачать файл из Билдера.
2. Положить в `data/schedule/`.
3. Добавить в `manifest.json`.
4. `git push`.

### Добавить замену
1. Открыть `data/substitutions/index.js`.
2. Добавить дату в `SUBSTITUTIONS`.
3. `git push`.

### Изменить звонки
1. Открыть `data/bells.js`.
2. Отредактировать `course1` / `course2plus`.

### Добавить преподавателя/кабинет
1. Открыть `data/dictionary.js`.
2. Добавить в массив.

### Сменить дату старта семестра
1. Открыть `config.js`.
2. Изменить `SEMESTER_START_DATE`.

### Добавить тему
1. В `themes.css` — `body.theme-mytheme { ... }`.
2. В `ui/settings.js` — в массив `THEMES`.

### Добавить шрифт
1. Закинуть `.woff2` и `.ttf` в `assets/fonts/`.
2. В `index.html` — Google Fonts (если облачный) или `@font-face` в `style.css`.
3. В `themes.js` — обработка в `applyFont()`.
4. В `ui/settings.js` — кнопка с `data-font`.

---

## 13. Правила стиля и антипаттерны

### ✅ Делать
- Использовать `state.getNow()`.
- Данные — в `localStorage` или CloudStorage.
- Изменения стейта — через `state.set()`.
- DOM — через `document.createElement()`.
- Стили — в CSS-файлах.
- Комментарии — на русском.
- Цвета — через CSS-переменные.
- Асинхронные операции — через `await`.
- Менять `CACHE_NAME` после правок CSS/JS.

### ❌ Не делать
- Не использовать фреймворки (React/Vue) и сборщики.
- Не писать всё в одном файле.
- Не трогать `.git`.
- Не добавлять тяжёлые библиотеки.
- Не использовать `innerHTML` для пользовательских данных (только `textContent`).
- Не хардкодить цвета.
- Не писать код «вслепую» без актуальных файлов.

---

## 14. Известные баги и их фиксы

| Симптом | Причина | Решение |
|---------|---------|---------|
| Старая версия сайта | Не обновлён `CACHE_NAME` | Изменить версию в `sw.js` |
| Настройки не синхронизируются | Так и должно быть | Фича, не баг |
| Таймер вылезает за экран | `transform: scale()` | Использовать `clamp()` и `vw` |
| Ошибка `Script error` в TG | Внутренняя ошибка WebView | Игнорируется в `main.js` |
| Стрик не растёт | `lastVisit` не совпадает | Проверить `initStreak()` |
| Файл из Билдера не грузится | Нет в `manifest.json` | Добавить в `files` |

---

## 15. Контакты

- **Telegram-группа:** `https://t.me/+sq9RDqa2I2A3M2Iy`
- **Почта:** `gemg944@gmail.com`
- **GitHub:** `https://github.com/si2hay`
```