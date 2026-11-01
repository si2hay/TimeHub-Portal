// main.js: Точка входа в приложение

import { state } from './state.js';
import { CONFIG } from './config.js';
import { initThemes, applyTextScale } from './themes.js'; // <-- ДОБАВИЛИ ИМПОРТ
import { initParticles } from './particles.js';
import { initPWA } from './pwa.js';
import { createHeader } from './ui/header.js';
import { createControls } from './ui/controls.js';
import { createTimer } from './ui/timer.js';
import { createSchedule } from './ui/schedule.js';
import { createReference } from './ui/reference.js';
import { createNotes } from './ui/notes.js';
import { createFooter } from './ui/footer.js';
import { createRadialDayPicker } from './ui/radial-day-picker.js';

// ФИЛЬТР ОШИБОК
window.addEventListener('error', (e) => {
    if (!e.filename || e.message.includes('Script error')) {
        console.warn('Подавлена внутренняя ошибка Telegram WebApp:', e.message);
        return;
    }
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:red; color:white; z-index:9999; padding:10px; font-size:14px; font-family:monospace;';
    errDiv.textContent = `ОШИБКА: ${e.message} в файле ${e.filename}:${e.lineno}`;
    document.body.appendChild(errDiv);
});

// ТЕЛЕГРАМ ФИШКИ
const tg = window.Telegram?.WebApp;
if (tg && tg.initData) {
    tg.BackButton.onClick(() => {
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length > 0) {
            modals[modals.length - 1].remove(); 
        }
    });

    setInterval(() => {
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length > 0) {
            tg.BackButton.show();
        } else {
            tg.BackButton.hide();
        }
    }, 500);

    const checkFocus = () => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
            tg.enableClosingConfirmation();
        } else {
            tg.disableClosingConfirmation();
        }
    };
    
    document.addEventListener('focusin', checkFocus);
    document.addEventListener('focusout', checkFocus);
}

// ФУНКЦИЯ ДЛЯ ПРИМЕНЕНИЯ ОБОЕВ
function applyBackground() {
    const settings = state.get('settings');
    const container = document.getElementById('custom-bg-container');
    const media = container.querySelector('.custom-bg-media');
    const overlay = container.querySelector('.custom-bg-overlay');

    if (!settings.bgUrl) {
        container.style.display = 'none';
        document.body.style.backgroundColor = 'var(--bg-color)';
        document.body.style.backgroundImage = 'var(--bg-gradient)';
        return;
    }

    container.style.display = 'block';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none';

    overlay.style.opacity = settings.bgDarkness || 0;
    media.style.filter = `blur(${settings.bgBlur || 0}px)`;

    const isVideo = settings.bgUrl.match(/\.(mp4|webm|ogg)$/i) || (settings.bgUrl.startsWith('data:video'));
    
    if (media.dataset.currentUrl !== settings.bgUrl) {
        if (isVideo) {
            media.innerHTML = `<video src="${settings.bgUrl}" autoplay loop muted playsinline></video>`;
        } else {
            media.innerHTML = `<img src="${settings.bgUrl}" alt="wallpaper">`;
        }
        media.dataset.currentUrl = settings.bgUrl;
    }

    const mediaEl = media.querySelector('img, video');
    if (mediaEl) {
        mediaEl.style.objectFit = settings.bgFit || 'cover';
    }
}

const appDiv = document.getElementById('app');
if (appDiv) {
    appDiv.innerHTML = ''; 
    
    initThemes(); // Тема загрузится из локального хранилища
    initParticles(); // Частицы тоже
    initPWA(); 
    
    appDiv.appendChild(createHeader());
    appDiv.appendChild(createControls());
    appDiv.appendChild(createTimer());
    appDiv.appendChild(createSchedule()); 
    appDiv.appendChild(createReference()); 
    appDiv.appendChild(createNotes()); 
    appDiv.appendChild(createFooter());
    appDiv.appendChild(createRadialDayPicker());
}

// Слушаем изменения настроек
state.on('change:settings', (newSettings) => {
    applyBackground();
    if (newSettings.textScale) {
        applyTextScale(newSettings.textScale);
    }
});

applyBackground(); 

export {};