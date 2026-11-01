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

    header.innerHTML = `
        <div class="header-logo" id="main-logo-area">
            <div class="logo-icon">
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
                <h1>TimeHub <span id="header-streak-val" class="header-streak-badge" style="display:none;">🔥 0</span></h1>
                <span>Portal</span>
            </div>
            
            <!-- Выпадающее меню стрика -->
            <div class="streak-dropdown glass-panel" id="streak-dropdown">
                <div class="streak-icon-wrapper" id="streak-fire-container"></div>
                <div class="streak-title">Твоя серия</div>
                <div class="streak-count-text"><span id="streak-days">0</span> дней подряд</div>
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

    // --- ЛОГИКА СТРИКА ---
    const streakBadge = header.querySelector('#header-streak-val');
    const streakDropdown = header.querySelector('#streak-dropdown');
    const fireContainer = header.querySelector('#streak-fire-container');
    const streakDays = header.querySelector('#streak-days');
    let isDropdownOpen = false;

    function getFireSVG(level) {
        let colorClass = 'fire-lvl-1';
        if (level >= 100) colorClass = 'fire-lvl-5';
        else if (level >= 60) colorClass = 'fire-lvl-4';
        else if (level >= 30) colorClass = 'fire-lvl-3';
        else if (level >= 10) colorClass = 'fire-lvl-2';

        return `
            <div class="fire-svg-container ${colorClass}">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 15.5 6 15.5 10.5C15.5 12.5 14.5 14 12 14C9.5 14 8.5 12.5 8.5 10.5C8.5 6 12 2 12 2Z" fill="currentColor"/>
                    <path d="M12 12C12 12 16.5 14.5 16.5 18.5C16.5 21 14.5 22 12 22C9.5 22 7.5 21 7.5 18.5C7.5 14.5 12 12 12 12Z" fill="currentColor" opacity="0.6"/>
                </svg>
            </div>
        `;
    }

    function renderStreak(streakData) {
        const count = streakData.count || 0;
        
        if (count > 0) {
            streakBadge.textContent = `🔥 ${count}`;
            streakBadge.style.display = 'inline-block';
            
            streakDays.textContent = count;
            fireContainer.innerHTML = getFireSVG(count);
        } else {
            streakBadge.style.display = 'none';
        }
    }

    state.on('change:streak', renderStreak);
    if (state.get('streak')) {
        renderStreak(state.get('streak'));
    }

    // --- КЛИКИ (Меню + Секретные темы) ---
    const mainLogoArea = header.querySelector('#main-logo-area');
    let logoClicks = 0;
    let clickTimeout;

    mainLogoArea.addEventListener('click', (e) => {
        // Если кликнули внутри выпадающего меню, ничего не делаем
        if (e.target.closest('.streak-dropdown')) return;

        logoClicks++;
        clearTimeout(clickTimeout);

        // Ждем 300мс. Если за это время не было 5 кликов, открываем/закрываем меню
        clickTimeout = setTimeout(() => {
            if (logoClicks === 1) {
                isDropdownOpen = !isDropdownOpen;
                streakDropdown.classList.toggle('open', isDropdownOpen);
            }
            logoClicks = 0;
        }, 300);

        // Секретные темы
        if (logoClicks === 5) {
            applyTheme('matrix');
            logoClicks = 0;
            clearTimeout(clickTimeout);
            streakDropdown.classList.remove('open');
            isDropdownOpen = false;
        } else if (logoClicks === 10) {
            applyTheme('nothing');
            logoClicks = 0;
            clearTimeout(clickTimeout);
            streakDropdown.classList.remove('open');
            isDropdownOpen = false;
        }
    });

    // Закрываем меню по клику в любое другое место
    document.addEventListener('click', (e) => {
        if (!mainLogoArea.contains(e.target)) {
            streakDropdown.classList.remove('open');
            isDropdownOpen = false;
        }
    });

    return header;
}

export {};