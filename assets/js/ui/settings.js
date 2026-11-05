// assets/js/ui/settings.js: Модалка настроек с группировкой (аккордеон)

import { state } from '../state.js';
import {
    applyTheme, applyEffects, applyFont,
    applyTextScaleLevel, applyCustomColors, applyCustomBorderRadius
} from '../themes.js';
import { toggleParticles } from '../particles.js';
import { openFullSchedule } from './full-schedule.js';
import { promptInstall } from '../pwa.js';
import { CONFIG } from '../config.js'; 
import { smartStorage } from '../telegram-storage.js';

export function openSettings() {
    if (document.getElementById('settings-modal')) return;

    const settings = state.get('settings');

    const THEMES = [
        { id: 'dark', name: 'Темная' }, { id: 'dota', name: 'Dota 2' }, { id: 'minecraft', name: 'Minecraft' },
        { id: 'ocean', name: 'Океан' }, { id: 'sunset', name: 'Закат' }, { id: 'golden', name: 'Золото' },
        { id: 'emerald', name: 'Изумруд' }, { id: 'nord', name: 'Норд' }, { id: 'coffee', name: 'Кофе' },
        { id: 'sakura', name: 'Сакура' }, { id: 'nothing', name: 'Nothing' }, { id: 'matrix', name: 'Matrix' }
    ];

    const EFFECTS_LIST = [
        { id: 'strictCorners', name: 'Строгие углы (0px)' },
        { id: 'neonGlow', name: 'Неоновое свечение' },
        { id: 'terminalGrid', name: 'Фоновая сетка' },
        { id: 'scanlines', name: 'Сканлайны (CRT)' },
        { id: 'thickBorders', name: 'Жирные рамки' },
        { id: 'dotBackground', name: 'Точечный фон' },
        { id: 'asciiBrackets', name: 'ASCII скобки' }
    ];

    const textScaleLevel = settings.textScaleLevel ?? 5;
    const darknessLevel = settings.bgDarknessLevel ?? 0;
    const blurLevel = settings.bgBlurLevel ?? 0;
    const cc = settings.customColors || CONFIG.DEFAULT_SETTINGS.customColors;
    const br = settings.customBorderRadius;
    const effects = settings.effects || CONFIG.DEFAULT_SETTINGS.effects;

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content glass-panel" style="padding-bottom: 30px;">
            <div class="modal-header">
                <h2>Настройки</h2>
                <button id="btn-close-settings" class="icon-btn">✖</button>
            </div>

            <!-- ===== ОФОРМЛЕНИЕ И ФОРМА ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>🎨 Оформление (Пресеты)</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        
                        <div class="settings-row">
                            <span class="settings-row-label">Цветовая тема</span>
                            <div class="settings-hint" style="margin-bottom: 8px;">Кликни на тему, чтобы сбросить свои цвета и вернуть стандартный вид.</div>
                            <div class="theme-carousel">
                                ${THEMES.map(t => `
                                    <button class="theme-pill ${settings.theme === t.id ? 'active' : ''}" data-theme="${t.id}">${t.name}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">Шрифты</span>
                            <div class="settings-grid-buttons" style="grid-template-columns: 1fr 1fr 1fr;">
                                <button class="settings-btn ${settings.font === 'minecraft' ? 'active' : ''}" data-font="minecraft">Minecraft</button>
                                <button class="settings-btn ${settings.font === 'tsap' ? 'active' : ''}" data-font="tsap">Tsap</button>
                                <button class="settings-btn ${settings.font === 'inter' ? 'active' : ''}" data-font="inter">Inter</button>
                                <button class="settings-btn ${settings.font === 'roboto' ? 'active' : ''}" data-font="roboto">Roboto</button>
                                <button class="settings-btn ${settings.font === 'rubik' ? 'active' : ''}" data-font="rubik">Rubik</button>
                                <button class="settings-btn ${settings.font === 'play' ? 'active' : ''}" data-font="play">Play</button>
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">Размер шрифта (1–10, 5 = обычный)</span>
                            <div class="slider-with-value">
                                <input type="range" id="text-scale-range" min="1" max="10" step="1" value="${textScaleLevel}">
                                <input type="number" id="text-scale-value" min="1" max="10" step="1" value="${textScaleLevel}">
                            </div>
                        </div>

                        <div class="settings-row" style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                            <span class="settings-row-label">Скругление углов (0–32px)</span>
                            <div class="slider-with-value">
                                <input type="range" id="border-radius-range" min="0" max="32" step="1" value="${br !== null ? br : 12}">
                                <input type="number" id="border-radius-value" min="0" max="32" step="1" value="${br !== null ? br : 12}">
                            </div>
                            <div class="settings-hint">Значение берётся из темы, пока не сдвинешь ползунок.</div>
                            <button id="btn-reset-radius" class="settings-btn" style="margin-top: 8px;">↺ Вернуть как в теме</button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ===== ЭФФЕКТЫ ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>✨ Эффекты</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        <div class="settings-hint">Собери свой интерфейс, комбинируя визуальные эффекты.</div>
                        
                        <!-- ВОЗВРАЩЕНО: Тумблеры частиц и стекла -->
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

                        ${EFFECTS_LIST.map(e => `
                            <div class="toggle-row">
                                <span>${e.name}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" data-effect="${e.id}" ${effects[e.id] ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- ===== СВОИ ЦВЕТА ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>🎨 Свои цвета</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        
                        <div class="toggle-row" style="padding-top:0;">
                            <span>Использовать свои цвета</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="toggle-custom-colors" ${cc.enabled ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-hint">При включении цвета переопределяют выбранную тему.</div>

                        <div id="custom-colors-fields" style="${cc.enabled ? '' : 'opacity: 0.4; pointer-events: none;'}">
                            <div class="color-row">
                                <label for="custom-accent">Акцент</label>
                                <input type="color" id="custom-accent" value="${cc.accent || '#0062b1'}">
                            </div>
                            <div class="color-row">
                                <label for="custom-bg">Фон страницы</label>
                                <input type="color" id="custom-bg" value="${cc.background || '#0f1115'}">
                            </div>
                            <div class="color-row">
                                <label for="custom-surface">Фон карточек</label>
                                <input type="color" id="custom-surface" value="${cc.surface || '#1a1d24'}">
                            </div>
                            <div class="color-row">
                                <label for="custom-text">Основной текст</label>
                                <input type="color" id="custom-text" value="${cc.text || '#e2e8f0'}">
                            </div>
                            <div class="color-row">
                                <label for="custom-text-muted">Второстепенный текст</label>
                                <input type="color" id="custom-text-muted" value="${cc.textMuted || '#94a3b8'}">
                            </div>

                            <div class="toggle-row" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                                <span>Градиент на фоне</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-gradient" ${cc.gradient?.enabled ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <div id="gradient-fields" style="${cc.gradient?.enabled ? '' : 'opacity: 0.4; pointer-events: none;'}">
                                <div class="color-row">
                                    <label for="gradient-color1">Цвет 1</label>
                                    <input type="color" id="gradient-color1" value="${cc.gradient?.color1 || '#0f2027'}">
                                </div>
                                <div class="color-row">
                                    <label for="gradient-color2">Цвет 2</label>
                                    <input type="color" id="gradient-color2" value="${cc.gradient?.color2 || '#2c5364'}">
                                </div>
                                <div class="settings-row" style="margin-top: 8px;">
                                    <span class="settings-row-label">Угол (0–360°)</span>
                                    <div class="slider-with-value">
                                        <input type="range" id="gradient-angle-range" min="0" max="360" step="5" value="${cc.gradient?.angle || 135}">
                                        <input type="number" id="gradient-angle-value" min="0" max="360" step="5" value="${cc.gradient?.angle || 135}">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ===== ОБОИ ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>🖼 Обои</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        <input type="text" id="bg-url" class="settings-select" placeholder="Ссылка на видео/картинку (URL)" value="${settings.bgUrl || ''}">
                        
                        <div style="text-align: center;">
                            <label for="bg-file" class="settings-btn" style="cursor: pointer; width: 100%;">
                                📁 Выбрать картинку с устройства
                            </label>
                            <input type="file" id="bg-file" accept="image/*" style="display: none;">
                            <div id="file-name" style="font-size: 11px; color: var(--text-muted); margin-top: 6px; word-break: break-all;"></div>
                            
                            <div class="settings-warning">
                                ⚠️ Файлы с устройства не синхронизируются между устройствами. Используйте URL для облака.
                            </div>
                        </div>
                        
                        <div class="settings-row" style="margin-top: 12px;">
                            <span class="settings-row-label">Затемнение (0–10)</span>
                            <div class="slider-with-value">
                                <input type="range" id="bg-darkness-range" min="0" max="10" step="1" value="${darknessLevel}">
                                <input type="number" id="bg-darkness-value" min="0" max="10" step="1" value="${darknessLevel}">
                            </div>
                        </div>
                        <div class="settings-row">
                            <span class="settings-row-label">Размытие (0–10)</span>
                            <div class="slider-with-value">
                                <input type="range" id="bg-blur-range" min="0" max="10" step="1" value="${blurLevel}">
                                <input type="number" id="bg-blur-value" min="0" max="10" step="1" value="${blurLevel}">
                            </div>
                        </div>
                        
                        <button id="btn-clear-bg" class="settings-btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                            🗑️ Убрать обои
                        </button>
                    </div>
                </div>
            </div>

            <!-- ===== ИНТЕРФЕЙС ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>⚙️ Интерфейс</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        
                        <div class="settings-row">
                            <span class="settings-row-label">Переключатель дней</span>
                            <div class="settings-grid-buttons" style="grid-template-columns: 1fr 1fr;">
                                <button class="settings-btn ${settings.dayPickerStyle === 'radial' ? 'active' : ''}" data-daypicker="radial">Веер</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'minimal' ? 'active' : ''}" data-daypicker="minimal">Минимал</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'capsule' || !settings.dayPickerStyle ? 'active' : ''}" data-daypicker="capsule">Капсула</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'segmented' ? 'active' : ''}" data-daypicker="segmented">Сегменты</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'swipe' ? 'active' : ''}" data-daypicker="swipe">Свайп + Точки</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'vertical' ? 'active' : ''}" data-daypicker="vertical">Сбоку (Dock)</button>
                                <button class="settings-btn ${settings.dayPickerStyle === 'led' ? 'active' : ''}" data-daypicker="led" style="grid-column: span 2;">Светодиоды (LED)</button>
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">Анимация смены дней</span>
                            <div class="settings-grid-buttons">
                                <button class="settings-btn ${settings.dayChangeAnimation === 'slide-up' || !settings.dayChangeAnimation ? 'active' : ''}" data-anim="slide-up">Снизу</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'slide-left' ? 'active' : ''}" data-anim="slide-left">Слева</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'blur' ? 'active' : ''}" data-anim="blur">Матовое</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'bounce' ? 'active' : ''}" data-anim="bounce">Пружина</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'fade' ? 'active' : ''}" data-anim="fade">Затухание</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'zoom' ? 'active' : ''}" data-anim="zoom">Масштаб</button>
                                <button class="settings-btn ${settings.dayChangeAnimation === 'glitch' ? 'active' : ''}" data-anim="glitch" style="grid-column: span 2;">⚡ Глитч (CRT)</button>
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">API Погоды</span>
                            <div class="settings-grid-buttons">
                                <button class="settings-btn ${settings.weatherApi === 'open-meteo' ? 'active' : ''}" data-weather="open-meteo">Open-Meteo</button>
                                <button class="settings-btn ${settings.weatherApi === 'wttr-in' ? 'active' : ''}" data-weather="wttr-in">wttr.in</button>
                            </div>
                        </div>

                        <div class="settings-row" style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                            <div class="toggle-row" style="padding-top:0; border:none;">
                                <span>Свайп для смены недель</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-week-swipe" ${settings.enableWeekSwipe !== false ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="settings-hint">Проводите пальцем влево/вправо по полосе с датами.</div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ===== ПРИЛОЖЕНИЕ ===== -->
            <div class="settings-group">
                <div class="settings-header">
                    <span>📱 Приложение</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        
                        <button id="btn-install-pwa" class="settings-link-btn" style="background: #ef4444; color: white; border: none;">
                            📲 Установить на устройство
                        </button>
                        
                        <button id="btn-share-app" class="settings-link-btn">
                            🔗 Поделиться приложением (QR)
                        </button>

                        <button id="btn-open-full-schedule" class="settings-link-btn">
                            📅 Расписание на неделю
                        </button>
                        
                        <a href="./builder.html" target="_blank" class="settings-link-btn">
                            🛠️ Конструктор расписания
                        </a>

                        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                            <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" class="settings-link-btn" style="background: #2AABEE; color: white; border: none;">
                                💬 Группа в Telegram
                            </a>
                            <a href="mailto:gemg944@gmail.com" class="settings-link-btn">
                                📧 Написать автору
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DANGER ZONE -->
            <div class="debug-zone" id="debug-zone" style="display: none;">
                <div class="debug-header">
                    <span>🛠 ОТЛАДКА (DANGER ZONE)</span>
                </div>
                <div class="debug-content">
                    <div class="debug-inner">
                        
                        <div class="debug-group">
                            <div class="debug-label">Машина времени</div>
                            <div class="debug-row">
                                <input type="time" id="debug-time-input" class="debug-input" value="${settings.debugTime || ''}">
                                <button id="btn-debug-set-time" class="debug-btn">Задать</button>
                                <button id="btn-debug-reset-time" class="debug-btn danger">Сброс</button>
                            </div>
                        </div>

                        <div class="debug-group">
                            <div class="debug-label">Принудительный день/неделя</div>
                            <div class="debug-row">
                                <select id="debug-week-select" class="debug-input">
                                    <option value="1" ${state.get('currentWeek') === 1 ? 'selected' : ''}>1 неделя</option>
                                    <option value="2" ${state.get('currentWeek') === 2 ? 'selected' : ''}>2 неделя</option>
                                </select>
                                <select id="debug-day-select" class="debug-input">
                                    <option value="1" ${state.get('currentDay') === 1 ? 'selected' : ''}>Пн</option>
                                    <option value="2" ${state.get('currentDay') === 2 ? 'selected' : ''}>Вт</option>
                                    <option value="3" ${state.get('currentDay') === 3 ? 'selected' : ''}>Ср</option>
                                    <option value="4" ${state.get('currentDay') === 4 ? 'selected' : ''}>Чт</option>
                                    <option value="5" ${state.get('currentDay') === 5 ? 'selected' : ''}>Пт</option>
                                </select>
                                <button id="btn-debug-force-day" class="debug-btn">Применить</button>
                            </div>
                        </div>

                        <div class="debug-group">
                            <div class="debug-label">Данные и Кэш</div>
                            <button id="btn-debug-copy-state" class="debug-btn">Копировать State (JSON)</button>
                            <button id="btn-debug-hard-reset" class="debug-btn danger">Hard Reset</button>
                        </div>

                        <div class="debug-group">
                            <div class="debug-label">Стрик (Огонек)</div>
                            <div class="debug-row">
                                <button id="btn-debug-break-streak" class="debug-btn danger">Сломать (38ч)</button>
                                <button id="btn-debug-kill-streak" class="debug-btn danger">Убить (50ч)</button>
                            </div>
                        </div>

                        <div class="debug-group">
                            <div class="debug-label">Окружение</div>
                            <div class="debug-info" id="debug-env-info">Загрузка...</div>
                        </div>

                        <button id="btn-debug-hide" class="debug-btn" style="margin-top: 10px; width: 100%;">Скрыть отладку</button>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px; opacity: 0.4; cursor: pointer;" id="version-trigger">
                <span style="font-size: 11px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">
                    TimeHub-Portal • v${CONFIG.VERSION}
                </span>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // ============== DANGER ZONE ==============
    const versionTrigger = modal.querySelector('#version-trigger');
    const debugZone = modal.querySelector('#debug-zone');
    let versionClicks = 0;
    let clickTimeout;

    versionTrigger.addEventListener('click', () => {
        if (!CONFIG.ENABLE_DEBUG) return;
        versionClicks++;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => { versionClicks = 0; }, 1500);
        if (versionClicks >= 5) {
            versionClicks = 0;
            debugZone.style.display = 'grid'; 
            setTimeout(() => debugZone.classList.add('open'), 10); 
            updateEnvInfo();
        }
    });

    // ============== АККОРДЕОН ==============
    const headers = modal.querySelectorAll('.settings-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            const isActive = group.classList.contains('active');
            modal.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
            if (!isActive) group.classList.add('active');
        });
    });

    // ============== БАЗОВЫЕ ОБРАБОТЧИКИ ==============
    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

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

    modal.querySelector('#btn-share-app').addEventListener('click', () => { modal.remove(); openQRCodeModal(); });
    modal.querySelector('#btn-open-full-schedule').addEventListener('click', () => { modal.remove(); openFullSchedule(); });

    // ============== ЛОГИКА ПРЕСЕТОВ И КАСТОМА ==============
    const customColorsFields = modal.querySelector('#custom-colors-fields');
    const toggleCustomColors = modal.querySelector('#toggle-custom-colors');
    
    // ИСПРАВЛЕНО: Надежная конвертация любых цветов (hex, rgb, rgba) в hex
    const toHex = (color) => {
        if (!color) return '#000000';
        if (color.startsWith('#')) return color.length >= 7 ? color.substring(0, 7) : color;
        
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        const norm = ctx.fillStyle; // Возвращает либо #rrggbb, либо rgba(...)
        
        if (norm.startsWith('#')) return norm;
        
        const match = norm.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return '#000000';
    };

    // Функция для синхронизации color-picker'ов с текущей темой
    const syncColorPickers = () => {
        const style = getComputedStyle(document.body);
        
        const hexAccent = toHex(style.getPropertyValue('--accent-color').trim());
        const hexBg = toHex(style.getPropertyValue('--bg-color').trim());
        const hexSurface = toHex(style.getPropertyValue('--surface-color').trim());
        const hexText = toHex(style.getPropertyValue('--text-main').trim());
        const hexTextMuted = toHex(style.getPropertyValue('--text-muted').trim());
        
        modal.querySelector('#custom-accent').value = hexAccent;
        modal.querySelector('#custom-bg').value = hexBg;
        modal.querySelector('#custom-surface').value = hexSurface;
        modal.querySelector('#custom-text').value = hexText;
        modal.querySelector('#custom-text-muted').value = hexTextMuted;

        const radius = style.getPropertyValue('--border-radius').trim();
        modal.querySelector('#border-radius-range').value = parseInt(radius) || 0;
        modal.querySelector('#border-radius-value').value = parseInt(radius) || 0;
        
        return { hexAccent, hexBg, hexSurface, hexText, hexTextMuted };
    };

    // Вызываем синхронизацию при открытии
    syncColorPickers();

    modal.querySelectorAll('.theme-pill[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            modal.querySelectorAll('.theme-pill[data-theme]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // СБРОС КАСТОМА ПРИ ВЫБОРЕ ПРЕСЕТА
            const newSettings = { ...state.get('settings') };
            newSettings.theme = theme;
            newSettings.customColors = { ...newSettings.customColors, enabled: false };
            newSettings.customBorderRadius = null;
            
            state.set('settings', newSettings);
            applyTheme(theme);
            applyCustomColors(newSettings.customColors);
            applyCustomBorderRadius(null);
            
            // Обновляем UI
            toggleCustomColors.checked = false;
            customColorsFields.style.opacity = '0.4';
            customColorsFields.style.pointerEvents = 'none';
            
            // Ждём тик, чтобы тема применилась, и синхронизируем цвета
            setTimeout(() => {
                const colors = syncColorPickers();
                if (colors) {
                    // Сохраняем цвета темы в стейт, чтобы при включении кастома они были дефолтными
                    const updatedCC = { 
                        ...state.get('settings').customColors, 
                        accent: colors.hexAccent, 
                        background: colors.hexBg, 
                        surface: colors.hexSurface,
                        text: colors.hexText,
                        textMuted: colors.hexTextMuted,
                        enabled: false,
                        gradient: { ...state.get('settings').customColors?.gradient, enabled: false }
                    };
                    state.set('settings', { ...state.get('settings'), customColors: updatedCC });
                }
            }, 50);
        });
    });

    // ============== СВОИ ЦВЕТА ==============
    const toggleGradient = modal.querySelector('#toggle-gradient');
    const gradientFields = modal.querySelector('#gradient-fields');

    const getCurrentCC = () => {
        return state.get('settings').customColors || CONFIG.DEFAULT_SETTINGS.customColors;
    };

    const saveCC = (patch, autoEnable = false) => {
        const cc = { ...getCurrentCC(), ...patch };
        if (autoEnable && !cc.enabled) {
            cc.enabled = true;
            toggleCustomColors.checked = true;
            customColorsFields.style.opacity = '1';
            customColorsFields.style.pointerEvents = 'auto';
        }
        state.set('settings', { ...state.get('settings'), customColors: cc });
        applyCustomColors(cc);
    };

    toggleCustomColors.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        customColorsFields.style.opacity = enabled ? '1' : '0.4';
        customColorsFields.style.pointerEvents = enabled ? 'auto' : 'none';
        saveCC({ enabled });
    });

    modal.querySelector('#custom-accent').addEventListener('input', (e) => saveCC({ accent: e.target.value }, true));
    modal.querySelector('#custom-bg').addEventListener('input', (e) => saveCC({ background: e.target.value }, true));
    modal.querySelector('#custom-surface').addEventListener('input', (e) => saveCC({ surface: e.target.value }, true));
    modal.querySelector('#custom-text').addEventListener('input', (e) => saveCC({ text: e.target.value }, true));
    modal.querySelector('#custom-text-muted').addEventListener('input', (e) => saveCC({ textMuted: e.target.value }, true));

    toggleGradient.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        gradientFields.style.opacity = enabled ? '1' : '0.4';
        gradientFields.style.pointerEvents = enabled ? 'auto' : 'none';
        saveCC({ gradient: { ...getCurrentCC().gradient, enabled } }, true);
    });

    modal.querySelector('#gradient-color1').addEventListener('input', (e) => saveCC({ gradient: { ...getCurrentCC().gradient, color1: e.target.value } }, true));
    modal.querySelector('#gradient-color2').addEventListener('input', (e) => saveCC({ gradient: { ...getCurrentCC().gradient, color2: e.target.value } }, true));

    const gradAngleRange = modal.querySelector('#gradient-angle-range');
    const gradAngleValue = modal.querySelector('#gradient-angle-value');
    const updateGradAngle = (val) => {
        val = Math.max(0, Math.min(360, parseInt(val) || 135));
        gradAngleRange.value = val;
        gradAngleValue.value = val;
        saveCC({ gradient: { ...getCurrentCC().gradient, angle: val } }, true);
    };
    gradAngleRange.addEventListener('input', (e) => updateGradAngle(e.target.value));
    gradAngleValue.addEventListener('change', (e) => updateGradAngle(e.target.value));

    // ============== СКРУГЛЕНИЕ ==============
    const radiusRange = modal.querySelector('#border-radius-range');
    const radiusValue = modal.querySelector('#border-radius-value');
    const updateRadius = (val) => {
        val = Math.max(0, Math.min(32, parseInt(val) || 0));
        radiusRange.value = val;
        radiusValue.value = val;
        state.set('settings', { ...state.get('settings'), customBorderRadius: val });
        applyCustomBorderRadius(val);
    };
    radiusRange.addEventListener('input', (e) => updateRadius(e.target.value));
    radiusValue.addEventListener('change', (e) => updateRadius(e.target.value));

    modal.querySelector('#btn-reset-radius').addEventListener('click', () => {
        state.set('settings', { ...state.get('settings'), customBorderRadius: null });
        applyCustomBorderRadius(null);
        const themeValue = getComputedStyle(document.body).getPropertyValue('--border-radius').trim();
        const parsed = parseInt(themeValue) || 0;
        radiusRange.value = parsed;
        radiusValue.value = parsed;
    });

    // ============== ШРИФТЫ ==============
    modal.querySelectorAll('.settings-btn[data-font]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const font = e.target.dataset.font;
            modal.querySelectorAll('.settings-btn[data-font]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), font: font });
            applyFont(font);
        });
    });

    // ============== РАЗМЕР ШРИФТА (1–10) ==============
    const textScaleRange = modal.querySelector('#text-scale-range');
    const textScaleValue = modal.querySelector('#text-scale-value');
    const updateTextScale = (level) => {
        level = Math.max(1, Math.min(10, parseInt(level) || 5));
        textScaleRange.value = level;
        textScaleValue.value = level;
        state.set('settings', { ...state.get('settings'), textScaleLevel: level });
        applyTextScaleLevel(level);
    };
    textScaleRange.addEventListener('input', (e) => updateTextScale(e.target.value));
    textScaleValue.addEventListener('change', (e) => updateTextScale(e.target.value));

    // ============== ЭФФЕКТЫ ==============
    modal.querySelectorAll('input[data-effect]').forEach(input => {
        input.addEventListener('change', (e) => {
            const key = e.target.dataset.effect;
            const isChecked = e.target.checked;
            
            let newEffects = { ...state.get('settings').effects, [key]: isChecked };
            
            // Взаимоисключение сетки и точек
            if (isChecked && key === 'terminalGrid') {
                newEffects.dotBackground = false;
                const dotInput = modal.querySelector('input[data-effect="dotBackground"]');
                if (dotInput) dotInput.checked = false;
            } else if (isChecked && key === 'dotBackground') {
                newEffects.terminalGrid = false;
                const gridInput = modal.querySelector('input[data-effect="terminalGrid"]');
                if (gridInput) gridInput.checked = false;
            }

            state.set('settings', { ...state.get('settings'), effects: newEffects });
            applyEffects(newEffects);
        });
    });

    // ============== ОБОИ ==============
    modal.querySelector('#bg-url').addEventListener('input', (e) => { state.set('settings', { ...state.get('settings'), bgUrl: e.target.value }); });
    modal.querySelector('#bg-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        modal.querySelector('#file-name').textContent = `Выбрано: ${file.name}`;
        if (file.size > 4 * 1024 * 1024) { alert('Файл слишком большой (макс. 4 МБ).'); return; }
        const reader = new FileReader();
        reader.onload = (event) => {
            state.set('settings', { ...state.get('settings'), bgUrl: event.target.result });
            modal.querySelector('#bg-url').value = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const darknessRange = modal.querySelector('#bg-darkness-range');
    const darknessValue = modal.querySelector('#bg-darkness-value');
    const updateDarkness = (val) => {
        val = Math.max(0, Math.min(10, parseInt(val) || 0));
        darknessRange.value = val;
        darknessValue.value = val;
        state.set('settings', { ...state.get('settings'), bgDarknessLevel: val });
    };
    darknessRange.addEventListener('input', (e) => updateDarkness(e.target.value));
    darknessValue.addEventListener('change', (e) => updateDarkness(e.target.value));

    const blurRange = modal.querySelector('#bg-blur-range');
    const blurValue = modal.querySelector('#bg-blur-value');
    const updateBlur = (val) => {
        val = Math.max(0, Math.min(10, parseInt(val) || 0));
        blurRange.value = val;
        blurValue.value = val;
        state.set('settings', { ...state.get('settings'), bgBlurLevel: val });
    };
    blurRange.addEventListener('input', (e) => updateBlur(e.target.value));
    blurValue.addEventListener('change', (e) => updateBlur(e.target.value));

    modal.querySelector('#btn-clear-bg').addEventListener('click', () => {
        state.set('settings', { ...state.get('settings'), bgUrl: '', bgDarknessLevel: 0, bgBlurLevel: 0 });
        modal.querySelector('#bg-url').value = '';
        modal.querySelector('#bg-file').value = '';
        modal.querySelector('#file-name').textContent = '';
        darknessRange.value = 0;
        darknessValue.value = 0;
        blurRange.value = 0;
        blurValue.value = 0;
    });

    // ============== ИНТЕРФЕЙС ==============
    modal.querySelectorAll('.settings-btn[data-daypicker]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const style = e.target.dataset.daypicker;
            modal.querySelectorAll('.settings-btn[data-daypicker]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), dayPickerStyle: style });
        });
    });

    modal.querySelectorAll('.settings-btn[data-anim]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const anim = e.target.dataset.anim;
            modal.querySelectorAll('.settings-btn[data-anim]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), dayChangeAnimation: anim });
        });
    });

    modal.querySelectorAll('.settings-btn[data-weather]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const weather = e.target.dataset.weather;
            modal.querySelectorAll('.settings-btn[data-weather]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), weatherApi: weather });
        });
    });

    // ============== ТУМБЛЕРЫ ==============
    const setupToggle = (id, settingName, callback) => {
        const toggle = modal.querySelector(`#${id}`);
        if (!toggle) return;
        toggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            state.set('settings', { ...state.get('settings'), [settingName]: isChecked });
            if (callback) callback(isChecked);
        });
    };

    setupToggle('toggle-particles', 'particles', toggleParticles);
    setupToggle('toggle-glass', 'liquidGlass', (isChecked) => {
        if (isChecked) document.body.classList.remove('no-glass');
        else document.body.classList.add('no-glass');
    });
    setupToggle('toggle-week-swipe', 'enableWeekSwipe');

    // ============== DANGER ZONE ОБРАБОТЧИКИ ==============
    if (CONFIG.ENABLE_DEBUG) {
        const timeInput = modal.querySelector('#debug-time-input');
        const weekSelect = modal.querySelector('#debug-week-select');
        const daySelect = modal.querySelector('#debug-day-select');

        modal.querySelector('#btn-debug-set-time').addEventListener('click', () => {
            if (!timeInput.value) return;
            state.set('settings', { ...state.get('settings'), debugTime: timeInput.value });
            state.emit('change:debugDate');
            modal.remove();
        });

        modal.querySelector('#btn-debug-reset-time').addEventListener('click', () => {
            state.set('settings', { ...state.get('settings'), debugTime: null });
            timeInput.value = '';
            state.emit('change:debugDate');
            modal.remove();
        });

        modal.querySelector('#btn-debug-force-day').addEventListener('click', () => {
            state.set('currentWeek', parseInt(weekSelect.value));
            state.set('currentDay', parseInt(daySelect.value));
            modal.remove();
        });

        modal.querySelector('#btn-debug-copy-state').addEventListener('click', () => {
            copyToClipboard(JSON.stringify(state.data, null, 2))
                .then(() => alert('State скопирован в буфер обмена!'))
                .catch(() => alert('Не удалось скопировать.'));
        });

        modal.querySelector('#btn-debug-hard-reset').addEventListener('click', () => {
            if (confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ настройки, заметки и стрик. Приложение перезагрузится. Продолжить?')) {
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            }
        });

        modal.querySelector('#btn-debug-break-streak').addEventListener('click', async () => {
            const fakeLastVisit = new Date(Date.now() - 38 * 3600 * 1000).toISOString();
            state.data.streak.status = 'dying';
            state.data.streak.lastVisit = fakeLastVisit;
            state.emit('change:streak', state.data.streak);
            await smartStorage.setItem('timehub_streak', JSON.stringify(state.data.streak));
            modal.remove();
        });

        modal.querySelector('#btn-debug-kill-streak').addEventListener('click', async () => {
            const fakeLastVisit = new Date(Date.now() - 50 * 3600 * 1000).toISOString();
            state.data.streak.count = 0;
            state.data.streak.status = 'dead';
            state.data.streak.lastVisit = fakeLastVisit;
            state.emit('change:streak', state.data.streak);
            await smartStorage.setItem('timehub_streak', JSON.stringify(state.data.streak));
            modal.remove();
        });

        modal.querySelector('#btn-debug-hide').addEventListener('click', () => {
            debugZone.classList.remove('open');
            setTimeout(() => { debugZone.style.display = 'none'; }, 300);
            versionClicks = 0;
            if (timeInput) timeInput.value = '';
        });
    }

    async function updateEnvInfo() {
        const envInfo = modal.querySelector('#debug-env-info');
        if (!envInfo) return;
        
        let cacheName = 'Неизвестно';
        if ('caches' in window) {
            const keys = await caches.keys();
            if (keys.length > 0) cacheName = keys.join(', ');
        }
        
        const tgInfo = window.Telegram?.WebApp ? `Да (${window.Telegram.WebApp.platform})` : 'Нет (Браузер)';
        
        envInfo.innerHTML = `
            <div><b>Кэш SW:</b> ${cacheName}</div>
            <div><b>Telegram:</b> ${tgInfo}</div>
            <div><b>Экран:</b> ${window.innerWidth}x${window.innerHeight} (DPR: ${window.devicePixelRatio})</div>
        `;
    }
}

// ... (остальные функции ensureDarkEnough, copyToClipboard, openQRCodeModal остаются без изменений) ...

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

async function openQRCodeModal() {
    const qrModal = document.createElement('div');
    qrModal.className = 'modal-overlay';
    
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
        const shareData = { title: 'TimeHub Portal', text: 'Умное расписание и заметки!', url: currentUrl };
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