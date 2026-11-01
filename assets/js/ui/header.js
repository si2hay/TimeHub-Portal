// ui/header.js: Отрисовка верхней панели (лого, дата, кнопка настроек)

import { openSettings } from './settings.js';
import { applyTheme } from '../themes.js';

export function createHeader() {
    const header = document.createElement('header');
    header.className = 'app-header glass-panel';
    
    // Получаем текущую дату
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateStr = now.toLocaleDateString('ru-RU', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    header.innerHTML = `
        <div class="header-logo">
            <div class="logo-icon" id="secret-logo-trigger">T</div>
            <div class="logo-text">
                <h1>TimeHub</h1>
                <span>Portal</span>
            </div>
        </div>
        <div class="header-date">
            ${dateStr}
        </div>
        <button id="btn-settings" class="icon-btn" aria-label="Настройки">
            ⚙️
        </button>
    `;

    // Кнопка открытия настроек
    const settingsBtn = header.querySelector('#btn-settings');
    settingsBtn.addEventListener('click', () => {
        openSettings();
    });

    // Секретные клики по логотипу
    const logoTrigger = header.querySelector('#secret-logo-trigger');
    let logoClicks = 0;
    let clickTimeout;

    logoTrigger.addEventListener('click', () => {
        logoClicks++;
        
        // Сбрасываем счетчик, если кликов не было 1 секунду
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => { logoClicks = 0; }, 1000);

        if (logoClicks === 5) {
            applyTheme('matrix');
            console.log('Секретная тема: Matrix');
            logoClicks = 0;
        } else if (logoClicks === 10) {
            applyTheme('nothing');
            console.log('Секретная тема: Nothing');
            logoClicks = 0;
        }
    });

    return header;
}

export {};