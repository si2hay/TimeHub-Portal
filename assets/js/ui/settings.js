// ui/settings.js: preferences panel

import { state } from '../state.js';
import { applyTheme } from '../themes.js';
import { toggleParticles } from '../particles.js';
import { openFullSchedule } from './full-schedule.js';
import { promptInstall } from '../pwa.js';

export function openSettings() {
    if (document.getElementById('settings-modal')) return;

    const settings = state.get('settings');

    const THEMES = [
        { id: 'dark', name: 'Темная' },
        { id: 'dota', name: 'Dota 2' },
        { id: 'minecraft', name: 'Minecraft' },
        { id: 'ocean', name: 'Океан' },
        { id: 'sunset', name: 'Закат' },
        { id: 'golden', name: 'Золото' },
        { id: 'emerald', name: 'Изумруд' },
        { id: 'nord', name: 'Норд' },
        { id: 'coffee', name: 'Кофе' },
        { id: 'sakura', name: 'Сакура' },
        { id: 'nothing', name: 'Nothing (Secret)' }
    ];

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content glass-panel">
            <div class="modal-header">
                <h2>Настройки</h2>
                <button id="btn-close-settings" class="icon-btn">✖</button>
            </div>

            <div class="settings-group">
                <h3>Приложение</h3>
                <button id="btn-install-pwa" style="width: 100%; display: flex !important; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; font-family: inherit;">
                    📲 Установить на устройство
                </button>
            </div>

            <div class="settings-group">
                <h3>Действия</h3>
                <button id="btn-open-full-schedule" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin-bottom: 10px;">
                    📅 Открыть расписание на неделю
                </button>
                
                <!-- НОВАЯ КНОПКА КОНСТРУКТОРА -->
                <a href="./builder.html" target="_blank" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; text-decoration: none; color: var(--text-main);">
                    🛠️ Конструктор расписания
                </a>
            </div>
            
            <div class="settings-group">
                <h3>Темы</h3>
                <div class="theme-grid" id="theme-grid">
                    ${THEMES.map(t => `
                        <button class="theme-btn ${settings.theme === t.id ? 'active' : ''}" data-theme="${t.id}">${t.name}</button>
                    `).join('')}
                </div>
            </div>

            <div class="settings-group">
                <h3>Погода (API)</h3>
                <select id="select-weather" class="settings-select">
                    <option value="open-meteo" ${settings.weatherApi === 'open-meteo' ? 'selected' : ''}>Open-Meteo</option>
                    <option value="wttr-in" ${settings.weatherApi === 'wttr-in' ? 'selected' : ''}>wttr.in</option>
                </select>
            </div>

            <div class="settings-group">
                <h3>Эффекты</h3>
                <div class="toggle-row">
                    <span>Частицы на фоне</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-particles" ${settings.particles ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-row">
                    <span>Liquid Glass (стекло)</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-glass" ${settings.liquidGlass ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // --- Обработчики ---
    const closeBtn = modal.querySelector('#btn-close-settings');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Кнопка установки PWA
    const installBtn = modal.querySelector('#btn-install-pwa');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            const accepted = await promptInstall();
            if (accepted) {
                installBtn.innerHTML = '✅ Приложение установлено';
                installBtn.style.background = 'rgba(255,255,255,0.1)';
            }
        });
    }

    // Открытие расписания
    modal.querySelector('#btn-open-full-schedule').addEventListener('click', () => {
        modal.remove();
        openFullSchedule();
    });

    // Темы
    modal.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            modal.querySelectorAll('.theme-btn[data-theme]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyTheme(theme);
        });
    });

    // Погода
    const weatherSelect = modal.querySelector('#select-weather');
    weatherSelect.addEventListener('change', (e) => {
        const newSettings = { ...state.get('settings'), weatherApi: e.target.value };
        state.set('settings', newSettings);
    });

    // Тумблеры
    const setupToggle = (id, settingName, callback) => {
        const toggle = modal.querySelector(`#${id}`);
        toggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const newSettings = { ...state.get('settings'), [settingName]: isChecked };
            state.set('settings', newSettings);
            if (callback) callback(isChecked);
        });
    };

    setupToggle('toggle-particles', 'particles', toggleParticles);
    setupToggle('toggle-glass', 'liquidGlass', (isChecked) => {
        if (isChecked) document.body.classList.remove('no-glass');
        else document.body.classList.add('no-glass');
    });
}

export {};