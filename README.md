<div align="center">

# 📚 TimeHub-Portal

**Универсальный портал для студента:** расписание пар, таймер до конца занятия, погода, заметки, чек-листы и система мотивации (стрик-огонек).  
Работает офлайн, устанавливается как PWA и интегрирован в Telegram.

[![Site](https://img.shields.io/badge/🌐_Открыть_сайт-TimeHub--Portal-0062b1?style=for-the-badge&logo=github)](https://si2hay.github.io/TimeHub-Portal/)
[![Builder](https://img.shields.io/badge/🛠️_Конструктор-Собрать_расписание-10b981?style=for-the-badge&logo=javascript)](https://si2hay.github.io/TimeHub-Portal/builder.html)
[![Telegram](https://img.shields.io/badge/✈️_Telegram_Bot-timehub_portal_bot-2AABEE?style=for-the-badge&logo=telegram)](https://t.me/timehub_portal_bot/portal)

[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6_Modules-f7df1e?style=flat-square&logo=javascript&logoColor=black)]()
[![PWA](https://img.shields.io/badge/PWA-Устанавливается_на_ПК_и_Android-5A0FC8?style=flat-square&logo=pwa)]()
[![Telegram Mini App](https://img.shields.io/badge/Telegram-Mini_App-2AABEE?style=flat-square&logo=telegram&logoColor=white)]()

</div>

---

## 📖 О проекте

**TimeHub-Portal** — это легкий и быстрый SPA-портал, созданный студентом Газпром колледжа Волгограда (группа 26 АТП-2Бо). 

Изначально проект задумывался для одной группы, но теперь это **универсальная открытая платформа для любого учебного заведения**. Любой студент может собрать свое расписание в Конструкторе, отправить его в Telegram-группу, и администратор добавит его на сайт.

> **Наш стек:** Чистый Vanilla JS (ES6 Modules), HTML5, CSS3. Без тяжелых фреймворков (React, Vue) и сборщиков. Быстро грузится, легко поддерживается.

---

## ✨ Возможности

- **📅 Расписание:** Пары на день с учётом чётной/нечётной недели, кастомного времени и актуальных замен.
- **🔥 Стрик (Огонек):** Заходи каждый день и прокачивай свой огонек. Он меняет цвет от оранжевого до золотого (100+ дней).
- **☁️ Облако Telegram:** Заметки, чек-листы, стрик и настройки (тема, шрифт, URL-обои) автоматически синхронизируются между телефоном и ПК через Telegram CloudStorage.
- **⏱️ Умный таймер:** Обратный отсчёт до конца пары или до следующей. Есть полноэкранный режим.
- **🌤️ Погода:** Сводка по Волгограду с советами по одежде. В настройках можно выбрать API (Open-Meteo или wttr.in).
- **🎨 Кастомизация:** 12+ тем оформления, 7 шрифтов, настройка размера текста, установка своих обоев (картинка/видео/URL).
- **📴 Офлайн-режим:** Service Worker кэширует данные, сайт открывается даже без интернета.
- **🛠️ Конструктор:** Удобная сборка расписания для **любой** группы и генерация файла замен на конкретный день.

---

## 📸 Скриншоты

<div align="center">
  <img src="screenshots/main.png" width="45%" alt="Главный экран">
  <img src="screenshots/timer.png" width="45%" alt="Таймер пар">
  <br>
  <img src="screenshots/themes.png" width="45%" alt="Темы оформления">
  <img src="screenshots/settings.png" width="45%" alt="Настройки">
  <br>
  <img src="screenshots/notes.png" width="45%" alt="Заметки и чек-лист">
  <img src="screenshots/builder.png" width="45%" alt="Конструктор расписания">
</div>

---

## 🚀 Как добавить расписание СВОЕЙ группы

Если твоей группы нет в списке на сайте:

1. Открой [Конструктор](https://si2hay.github.io/TimeHub-Portal/builder.html).
2. Введи название своей группы (например, `МГУ-1Б` или `26 АТП-4Бо`) и заполни пары.
3. Нажми **«Сгенерировать код»** и скачай файл `.js` (или `data.json`, если это замены).
4. В открывшемся окне нажми кнопку **«✈️ Перейти в группу»** и отправь скачанный файл в нашу [Telegram-группу](https://t.me/+sq9RDqa2I2A3M2Iy).
5. Мы добавим его на сайт, и твоя группа появится в общем списке!

---

## 💻 Для разработчиков

Хочешь запустить проект локально или помочь с кодом?

1. Склонируй репозиторий:
   ```bash
   git clone https://github.com/si2hay/TimeHub-Portal.git
   ```
2. Открой папку в VS Code / VSCodium.
3. Установи расширение **Live Server**.
4. Нажми ПКМ по `index.html` → **Open with Live Server** (порт 5500).
5. Для Конструктора: ПКМ по `builder.html` → **Open with Live Server**.

**Архитектура:**  
Вся логика разбита на модули в `assets/js/`. Данные расписаний лежат в `data/schedule/`, замены — в `data/substitutions/data.json`. Все стили используют CSS-переменные для поддержки тем. Подробности смотри в файле `AI_GUIDE.md`.

---

## 💬 Связь и поддержка

- 💬 **Telegram-группа:** [https://t.me/+sq9RDqa2I2A3M2Iy](https://t.me/+sq9RDqa2I2A3M2Iy) (вопросы, предложения, добавление расписаний)
- 📧 **Почта:** gemg944@gmail.com
- 🐛 **Issues:** Если нашел баг, создай [Issue](https://github.com/si2hay/TimeHub-Portal/issues) на GitHub.

---

## 👤 Автор

Проект создан студентом **Газпром колледжа Волгограда** (группа 26 АТП-2Бо).  
Сайт является открытой платформой и не ограничивается одним учебным заведением. Мы всегда рады новым группам и учебным заведениям!

<div align="center">
  <i>Сделано с ❤️ для студентов</i>
</div>
