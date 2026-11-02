// ui/settings.js: preferences panel

import { state } from '../state.js';
import { applyTheme, applyFont, applyTextScale } from '../themes.js'; 
import { toggleParticles } from '../particles.js';
import { openFullSchedule } from './full-schedule.js';
import { promptInstall } from '../pwa.js';
import { CONFIG } from '../config.js'; 

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
                <button id="btn-install-pwa" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #ef4444; color: white; border: none; margin-bottom: 10px;">
                    📲 Установить на устройство
                </button>
                <button id="btn-share-app" class="theme-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px;">
                    🔗 Поделиться приложением (QR)
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

            <div class="settings-group">
                <h3>Размер шрифта</h3>
                <div class="theme-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                    <button class="theme-btn ${settings.textScale === 0.9 ? 'active' : ''}" data-scale="0.9">Мелкий</button>
                    <button class="theme-btn ${settings.textScale === 1 || !settings.textScale ? 'active' : ''}" data-scale="1">Обычный</button>
                    <button class="theme-btn ${settings.textScale === 1.15 ? 'active' : ''}" data-scale="1.15">Крупный</button>
                </div>
            </div>

            <div class="settings-group">
                <h3>Шрифты</h3>
                <div class="theme-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                    <button class="theme-btn ${settings.font === 'minecraft' ? 'active' : ''}" data-font="minecraft">Minecraft</button>
                    <button class="theme-btn ${settings.font === 'tsap' ? 'active' : ''}" data-font="tsap">Tsap-Tsarap</button>
                    <button class="theme-btn ${settings.font === 'inter' ? 'active' : ''}" data-font="inter">Inter</button>
                    <button class="theme-btn ${settings.font === 'roboto' ? 'active' : ''}" data-font="roboto">Roboto</button>
                    <button class="theme-btn ${settings.font === 'rubik' ? 'active' : ''}" data-font="rubik">Rubik</button>
                    <button class="theme-btn ${settings.font === 'play' ? 'active' : ''}" data-font="play">Play</button>
                    <button class="theme-btn ${settings.font === 'montserrat' ? 'active' : ''}" data-font="montserrat">Montserrat</button>
                </div>
            </div>

            <div class="settings-group">
                <h3>Обои</h3>
                <input type="text" id="bg-url" class="settings-select" placeholder="Ссылка на видео/гифку (URL)" value="${settings.bgUrl || ''}" style="margin-bottom: 12px;">
                
                <div style="text-align: center; margin-bottom: 12px;">
                    <label for="bg-file" class="theme-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; cursor: pointer; width: 100%;">
                        📁 Выбрать картинку с устройства
                    </label>
                    <input type="file" id="bg-file" accept="image/*" style="display: none;">
                    <div id="file-name" style="font-size: 11px; color: var(--text-muted); margin-top: 6px; word-break: break-all;"></div>
                </div>
                
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

            <!-- БЛОК: ПОГОДА (КНОПКИ) -->
            <div class="settings-group">
                <h3>Погода (API)</h3>
                <div class="theme-grid">
                    <button class="theme-btn ${settings.weatherApi === 'open-meteo' ? 'active' : ''}" data-weather="open-meteo">Open-Meteo</button>
                    <button class="theme-btn ${settings.weatherApi === 'wttr-in' ? 'active' : ''}" data-weather="wttr-in">wttr.in</button>
                </div>
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

            <div class="settings-group" style="text-align: center; border-top: 1px solid var(--border-color); padding-top: 20px;">
                <h3>Связь с автором</h3>
                <p style="color: var(--text-muted); margin-bottom: 10px;">Вопросы, предложения и добавление расписаний. <br><em>(Отвечаем по возможности)</em></p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" class="theme-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        💬 Группа в Telegram
                    </a>
                    <a href="mailto:gemg944@gmail.com" class="theme-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        📧 gemg944@gmail.com
                    </a>
                </div>
            </div>

            <!-- ПЛАШКА ВЕРСИИ -->
            <div style="text-align: center; margin-top: 10px; margin-bottom: 10px; opacity: 0.4;">
                <span style="font-size: 11px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">
                    TimeHub-Portal • v${CONFIG.VERSION}
                </span>
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

    // PWA
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

    // Поделиться (открывает QR-модалку)
    modal.querySelector('#btn-share-app').addEventListener('click', () => {
        modal.remove();
        openQRCodeModal();
    });

    // Расписание
    modal.querySelector('#btn-open-full-schedule').addEventListener('click', () => {
        modal.remove();
        openFullSchedule();
    });

    // РАЗМЕР ШРИФТА
    modal.querySelectorAll('.theme-btn[data-scale]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scale = parseFloat(e.target.dataset.scale);
            modal.querySelectorAll('.theme-btn[data-scale]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const newSettings = { ...state.get('settings'), textScale: scale };
            state.set('settings', newSettings);
            applyTextScale(scale);
        });
    });

    // ОБОИ
    modal.querySelector('#bg-url').addEventListener('input', (e) => {
        const newSettings = { ...state.get('settings'), bgUrl: e.target.value };
        state.set('settings', newSettings);
    });

    modal.querySelector('#bg-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        modal.querySelector('#file-name').textContent = `Выбрано: ${file.name}`;
        
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
        const newSettings = { ...state.get('settings'), bgUrl: '', bgDarkness: 0, bgBlur: 0 };
        state.set('settings', newSettings);
        modal.querySelector('#bg-url').value = '';
        modal.querySelector('#bg-file').value = '';
        modal.querySelector('#file-name').textContent = '';
        modal.querySelector('#bg-darkness').value = 0;
        modal.querySelector('#bg-blur').value = 0;
    });

    // Шрифты
    modal.querySelectorAll('.theme-btn[data-font]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const font = e.target.dataset.font;
            modal.querySelectorAll('.theme-btn[data-font]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const newSettings = { ...state.get('settings'), font: font };
            state.set('settings', newSettings);
            applyFont(font);
        });
    });

    // Темы (ВАЖНО: сохраняем в state.set, чтобы улетело в облако)
    modal.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            modal.querySelectorAll('.theme-btn[data-theme]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Сохраняем новую тему в state и в облако (через state.set)
            const newSettings = { ...state.get('settings'), theme: theme };
            state.set('settings', newSettings);
            
            applyTheme(theme);
        });
    });

    // ПОГОДА (КНОПКИ)
    modal.querySelectorAll('.theme-btn[data-weather]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const weather = e.target.dataset.weather;
            modal.querySelectorAll('.theme-btn[data-weather]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const newSettings = { ...state.get('settings'), weatherApi: weather };
            state.set('settings', newSettings);
        });
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

// Вспомогательная функция для копирования (с фолбэком для старых браузеров)
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}

// --- ЛОГИКА QR-КОДА ---
async function openQRCodeModal() {
    const qrModal = document.createElement('div');
    qrModal.className = 'modal-overlay';
    
    // Умная генерация ссылки (короткая в ТГ, обычная в браузере)
    let currentUrl;
    if (window.Telegram?.WebApp?.initData) {
        currentUrl = 'https://t.me/timehub_portal_bot/portal';
    } else {
        currentUrl = window.location.origin + window.location.pathname;
    }

    qrModal.innerHTML = `
        <div class="modal-content glass-panel" style="max-width: 400px; text-align: center;">
            <div class="modal-header">
                <h2>Поделиться</h2>
                <button id="btn-close-qr" class="icon-btn">✖</button>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 20px;">
                Наведи камеру телефона, чтобы открыть TimeHub-Portal
            </p>
            <div id="qr-container" class="qr-glass-container">
                <div id="qr-loading" style="color: #666; font-size: 14px;">Генерация QR...</div>
            </div>
            <div class="share-link-container">
                <span class="share-link-text" id="share-url">${currentUrl}</span>
                <button id="btn-share-qr-native" class="share-copy-btn" title="Поделиться">🔗</button>
                <button id="btn-copy-link" class="share-copy-btn" title="Скопировать ссылку">📋</button>
            </div>
        </div>
    `;
    document.body.appendChild(qrModal);

    qrModal.querySelector('#btn-close-qr').addEventListener('click', () => qrModal.remove());
    qrModal.addEventListener('click', (e) => { if (e.target === qrModal) qrModal.remove(); });

    qrModal.querySelector('#btn-share-qr-native').addEventListener('click', async () => {
        const shareData = {
            title: 'TimeHub Portal',
            text: 'Умное расписание и заметки для студентов!',
            url: currentUrl
        };

        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else if (window.Telegram?.WebApp?.switchInlineQuery) {
            window.Telegram.WebApp.switchInlineQuery(`Посмотри это приложение: ${currentUrl}`, ['users', 'groups']);
        } else {
            copyToClipboard(currentUrl).then(() => alert('Ссылка скопирована!')).catch(() => alert('Не удалось скопировать.'));
        }
    });

    const copyBtn = qrModal.querySelector('#btn-copy-link');
    copyBtn.addEventListener('click', async () => {
        try {
            await copyToClipboard(currentUrl);
            copyBtn.innerHTML = '✅';
            copyBtn.style.background = '#10b981'; 
            setTimeout(() => {
                copyBtn.innerHTML = '📋';
                copyBtn.style.background = 'var(--accent-color)';
            }, 2000);
        } catch (err) {
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