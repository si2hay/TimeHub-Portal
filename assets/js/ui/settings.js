// ui/settings.js: preferences panel

import { state } from '../state.js';
import { applyTheme, applyFont } from '../themes.js'; 
import { toggleParticles } from '../particles.js';
import { openFullSchedule } from './full-schedule.js';
import { promptInstall } from '../pwa.js';
import { vibrate } from '../haptics.js'; // ИМПОРТ ВИБРАЦИИ

export function openSettings() {
    if (document.getElementById('settings-modal')) return;

    const settings = state.get('settings');

    const THEMES = [
        { id: 'dark', name: 'Темная' }, { id: 'dota', name: 'Dota 2' }, { id: 'minecraft', name: 'Minecraft' },
        { id: 'ocean', name: 'Океан' }, { id: 'sunset', name: 'Закат' }, { id: 'golden', name: 'Золото' },
        { id: 'emerald', name: 'Изумруд' }, { id: 'nord', name: 'Норд' }, { id: 'coffee', name: 'Кофе' },
        { id: 'sakura', name: 'Сакура' }, { id: 'nothing', name: 'Nothing (Secret)' }
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
                <button id="btn-install-pwa" style="width: 100%; display: flex !important; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; font-family: inherit; margin-bottom: 10px;">
                    📲 Установить на устройство
                </button>
                <button id="btn-share-qr" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px;">
                    📱 Поделиться сайтом (QR)
                </button>
            </div>

            <div class="settings-group">
                <h3>Действия</h3>
                <button id="btn-open-full-schedule" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin-bottom: 10px;">
                    📅 Открыть расписание на неделю
                </button>
                
                <a href="./builder.html" target="_blank" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; text-decoration: none; color: var(--text-main);">
                    🛠️ Конструктор расписания
                </a>
            </div>

            <!-- НОВЫЙ БЛОК: ВИБРАЦИЯ -->
            <div class="settings-group">
                <h3>Вибрация</h3>
                <div class="toggle-row">
                    <span>Тактильный отклик</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="toggle-vibration" ${settings.vibration ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-row" style="${!settings.vibration ? 'opacity: 0.5; pointer-events: none;' : ''}" id="vibration-force-row">
                    <span>Сила вибрации</span>
                    <select id="select-vibration-force" class="settings-select" style="width: auto; padding: 5px 10px;">
                        <option value="light" ${settings.vibrationForce === 'light' ? 'selected' : ''}>Легкая</option>
                        <option value="medium" ${settings.vibrationForce === 'medium' ? 'selected' : ''}>Средняя</option>
                        <option value="heavy" ${settings.vibrationForce === 'heavy' ? 'selected' : ''}>Сильная</option>
                    </select>
                </div>
            </div>
            <!-- КОНЕЦ БЛОКА ВИБРАЦИИ -->

            <div class="settings-group">
                <h3>Шрифты</h3>
                <div class="theme-grid">
                    <button class="theme-btn ${settings.font === 'minecraft' ? 'active' : ''}" data-font="minecraft">Minecraft</button>
                    <button class="theme-btn ${settings.font === 'tsap' ? 'active' : ''}" data-font="tsap">Tsap-Tsarap</button>
                </div>
            </div>

            <div class="settings-group">
                <h3>Обои</h3>
                <input type="text" id="bg-url" class="settings-select" placeholder="Ссылка на видео/гифку (URL)" value="${settings.bgUrl || ''}" style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Или загрузи картинку с устройства:</div>
                <input type="file" id="bg-file" accept="image/*" style="font-size: 12px; color: var(--text-main); margin-bottom: 12px;">
                
                <div class="toggle-row">
                    <span>Затемнение</span>
                    <input type="range" id="bg-darkness" min="0" max="0.8" step="0.1" value="${settings.bgDarkness || 0}" style="accent-color: var(--accent-color); width: 100px;">
                </div>
                <div class="toggle-row">
                    <span>Размытие</span>
                    <input type="range" id="bg-blur" min="0" max="15" step="1" value="${settings.bgBlur || 0}" style="accent-color: var(--accent-color); width: 100px;">
                </div>
                
                <button id="btn-clear-bg" class="theme-btn" style="width: 100%; margin-top: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                    🗑️ Убрать обои
                </button>
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
    vibrate('impact');

    // --- Обработчики ---
    const closeBtn = modal.querySelector('#btn-close-settings');
    closeBtn.addEventListener('click', () => { modal.remove(); vibrate('impact'); });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { modal.remove(); vibrate('impact'); }
    });

    // НАСТРОЙКИ ВИБРАЦИИ
    const vibToggle = modal.querySelector('#toggle-vibration');
    const vibForceRow = modal.querySelector('#vibration-force-row');
    const vibForceSelect = modal.querySelector('#select-vibration-force');

    vibToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const newSettings = { ...state.get('settings'), vibration: isChecked };
        state.set('settings', newSettings);
        
        vibForceRow.style.opacity = isChecked ? '1' : '0.5';
        vibForceRow.style.pointerEvents = isChecked ? 'auto' : 'none';
        
        if (isChecked) vibrate('success');
    });

    vibForceSelect.addEventListener('change', (e) => {
        const newSettings = { ...state.get('settings'), vibrationForce: e.target.value };
        state.set('settings', newSettings);
        vibrate('impact');
    });

    // PWA
    const installBtn = modal.querySelector('#btn-install-pwa');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            vibrate('impact');
            const accepted = await promptInstall();
            if (accepted) {
                installBtn.innerHTML = '✅ Приложение установлено';
                installBtn.style.background = 'rgba(255,255,255,0.1)';
                vibrate('success');
            }
        });
    }

    // Поделиться
    modal.querySelector('#btn-share-qr').addEventListener('click', () => {
        vibrate('impact');
        modal.remove();
        openQRCodeModal();
    });

    // Расписание
    modal.querySelector('#btn-open-full-schedule').addEventListener('click', () => {
        vibrate('impact');
        modal.remove();
        openFullSchedule();
    });

    // ОБОИ
    modal.querySelector('#bg-url').addEventListener('input', (e) => {
        const newSettings = { ...state.get('settings'), bgUrl: e.target.value };
        state.set('settings', newSettings);
    });

    modal.querySelector('#bg-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            alert('Файл слишком большой (макс. 4 МБ).');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const newSettings = { ...state.get('settings'), bgUrl: event.target.result };
            state.set('settings', newSettings);
            modal.querySelector('#bg-url').value = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    modal.querySelector('#bg-darkness').addEventListener('input', (e) => {
        const newSettings = { ...state.get('settings'), bgDarkness: parseFloat(e.target.value) };
        state.set('settings', newSettings);
    });

    modal.querySelector('#bg-blur').addEventListener('input', (e) => {
        const newSettings = { ...state.get('settings'), bgBlur: parseInt(e.target.value) };
        state.set('settings', newSettings);
    });

    modal.querySelector('#btn-clear-bg').addEventListener('click', () => {
        vibrate('error');
        const newSettings = { ...state.get('settings'), bgUrl: '', bgDarkness: 0, bgBlur: 0 };
        state.set('settings', newSettings);
        modal.querySelector('#bg-url').value = '';
        modal.querySelector('#bg-file').value = '';
        modal.querySelector('#bg-darkness').value = 0;
        modal.querySelector('#bg-blur').value = 0;
    });

    // Шрифты
    modal.querySelectorAll('.theme-btn[data-font]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            vibrate('impact');
            const font = e.target.dataset.font;
            modal.querySelectorAll('.theme-btn[data-font]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const newSettings = { ...state.get('settings'), font: font };
            state.set('settings', newSettings);
            applyFont(font);
        });
    });

    // Темы
    modal.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            vibrate('impact');
            const theme = e.target.dataset.theme;
            modal.querySelectorAll('.theme-btn[data-theme]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyTheme(theme);
        });
    });

    // Погода
    modal.querySelector('#select-weather').addEventListener('change', (e) => {
        const newSettings = { ...state.get('settings'), weatherApi: e.target.value };
        state.set('settings', newSettings);
    });

    // Тумблеры
    const setupToggle = (id, settingName, callback) => {
        const toggle = modal.querySelector(`#${id}`);
        toggle.addEventListener('change', (e) => {
            vibrate('impact');
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

// Вспомогательная функция: делает цвет темнее, если он слишком светлый
function ensureDarkEnough(color) {
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
        let r = parseInt(hexMatch[1], 16);
        let g = parseInt(hexMatch[2], 16);
        let b = parseInt(hexMatch[3], 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance > 0.5) {
            r = Math.floor(r * 0.35); g = Math.floor(g * 0.35); b = Math.floor(b * 0.35);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        let r = parseInt(rgbMatch[1]); let g = parseInt(rgbMatch[2]); let b = parseInt(rgbMatch[3]);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance > 0.5) {
            r = Math.floor(r * 0.35); g = Math.floor(g * 0.35); b = Math.floor(b * 0.35);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }
    return '#1a1a1a';
}

// --- ЛОГИКА QR-КОДА ---
async function openQRCodeModal() {
    const qrModal = document.createElement('div');
    qrModal.className = 'modal-overlay';
    const currentUrl = window.location.origin + window.location.pathname;

    qrModal.innerHTML = `
        <div class="modal-content glass-panel" style="max-width: 400px; text-align: center;">
            <div class="modal-header">
                <h2>Поделиться</h2>
                <button id="btn-close-qr" class="icon-btn">✖</button>
            </div>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                Наведи камеру телефона, чтобы открыть TimeHub-Portal
            </p>
            <div id="qr-container" class="qr-glass-container">
                <div id="qr-loading" style="color: #666; font-size: 14px;">Генерация QR...</div>
            </div>
            <div class="share-link-container">
                <span class="share-link-text" id="share-url">${currentUrl}</span>
                <button id="btn-copy-link" class="share-copy-btn" title="Скопировать ссылку">📋</button>
            </div>
        </div>
    `;
    document.body.appendChild(qrModal);

    qrModal.querySelector('#btn-close-qr').addEventListener('click', () => qrModal.remove());
    qrModal.addEventListener('click', (e) => { if (e.target === qrModal) qrModal.remove(); });

    const copyBtn = qrModal.querySelector('#btn-copy-link');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            copyBtn.innerHTML = '✅';
            copyBtn.style.background = '#10b981'; 
            setTimeout(() => {
                copyBtn.innerHTML = '📋';
                copyBtn.style.background = 'var(--accent-color)';
            }, 2000);
        } catch (err) {
            console.error('Ошибка копирования', err);
            alert('Не удалось скопировать. Ссылка: ' + currentUrl);
        }
    });

    try {
        const { default: QRCodeStyling } = await import('https://esm.sh/qr-code-styling@1.5.0');
        const rawAccent = getComputedStyle(document.body).getPropertyValue('--accent-color').trim();
        const qrColor = ensureDarkEnough(rawAccent);
        const accentForBorder = rawAccent || '#0062b1';
        const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="white"/><path d="M50 15 L80 28 L80 70 L50 85 L20 70 L20 28 Z" stroke="${accentForBorder}" stroke-width="4" stroke-linejoin="round"/><path d="M 35 35 C 25 35 25 45 35 45 C 45 45 45 55 35 55" stroke="${accentForBorder}" stroke-width="5" stroke-linecap="round"/><path d="M 42 35 H 58 M 50 35 V 60" stroke="${accentForBorder}" stroke-width="5" stroke-linecap="round"/><g transform="translate(100, 0) scale(-1, 1)"><path d="M 35 35 C 25 35 25 45 35 45 C 45 45 45 55 35 55" stroke="${accentForBorder}" stroke-width="5" stroke-linecap="round"/></g><path d="M 20 70 C 35 80 50 68 50 68 C 50 68 65 80 80 70" stroke="${accentForBorder}" stroke-width="4" stroke-linecap="round"/></svg>`;
        const logoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

        const qrCode = new QRCodeStyling({
            width: 250, height: 250, type: 'canvas', data: currentUrl, image: logoDataUrl,
            dotsOptions: { color: qrColor, type: "rounded" }, backgroundOptions: { color: "#ffffff" },
            imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: 0.35 },
            cornersSquareOptions: { type: "extra-rounded", color: qrColor },
            cornersDotOptions: { type: "dot", color: qrColor }
        });

        const container = document.getElementById('qr-container');
        container.innerHTML = ''; 
        container.style.setProperty('--qr-glow', accentForBorder);
        qrCode.append(container);

    } catch (error) {
        console.error('Ошибка генерации QR:', error);
        document.getElementById('qr-container').innerHTML = '<div style="color: red; font-size: 14px; padding: 20px; text-align: center;">Не удалось загрузить QR-код.<br>Проверьте интернет.</div>';
    }
}

export {};