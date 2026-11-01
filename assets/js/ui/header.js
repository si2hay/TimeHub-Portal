// ui/header.js: Отрисовка верхней панели (лого, дата, кнопка настроек)

import { openSettings } from './settings.js';
import { applyTheme } from '../themes.js';
import { state } from '../state.js';

export function createHeader() {
    const header = document.createElement('header');
    header.className = 'app-header glass-panel';
    
    const updateDate = () => {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString('ru-RU', options);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        header.querySelector('.header-date').textContent = dateStr;
    };

    // ТВОЙ НОВЫЙ ЛОГОТИП
    header.innerHTML = `
        <div class="header-logo">
            <div class="logo-icon" id="secret-logo-trigger">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" width="100%" height="100%">
                    <path d="M50 5 L85 20 L85 75 L50 95 L15 75 L15 20 Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M 30 30 C 20 30 20 42 30 42 C 40 42 40 54 30 54" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                    <path d="M 40 30 H 60 M 50 30 V 60" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                    <g transform="translate(100, 0) scale(-1, 1)">
                        <path d="M 30 30 C 20 30 20 42 30 42 C 40 42 40 54 30 54" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                    </g>
                    <path d="M 15 72 C 35 82 50 67 50 67 C 50 67 65 82 85 72" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="logo-text">
                <h1>TimeHub</h1>
                <span>Portal</span>
            </div>
        </div>
        <div class="header-date"></div>
        <button id="btn-settings" class="icon-btn" aria-label="Настройки">
            ⚙️
        </button>
    `;

    updateDate();
    state.on('change:debugDate', updateDate);

    const settingsBtn = header.querySelector('#btn-settings');
    settingsBtn.addEventListener('click', () => {
        openSettings();
    });

    const logoTrigger = header.querySelector('#secret-logo-trigger');
    let logoClicks = 0;
    let clickTimeout;

    logoTrigger.addEventListener('click', () => {
        logoClicks++;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => { logoClicks = 0; }, 1000);

        if (logoClicks === 5) {
            applyTheme('matrix');
            logoClicks = 0;
        } else if (logoClicks === 10) {
            applyTheme('nothing');
            logoClicks = 0;
        }
    });

    return header;
}

export {};