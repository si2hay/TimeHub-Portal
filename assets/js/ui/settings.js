// assets/js/ui/settings.js: Модальное окно настроек с группировкой (аккордеон)

import { state } from '../state.js';
import { applyTheme, applyStyle, applyFont, applyTextScale } from '../themes.js';
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

    // ОСТАВЛЕНЫ ТОЛЬКО 4 СТИЛЯ
    const STYLES = [
        { id: 'default', name: 'Стекло' }, 
        { id: 'terminal', name: 'Терминал' },
        { id: 'brutalism', name: 'Брутализм' }, 
        { id: 'nothing', name: 'Nothing' }
    ];

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content glass-panel" style="padding-bottom: 30px;">
            <div class="modal-header">
                <h2>Настройки</h2>
                <button id="btn-close-settings" class="icon-btn">✖</button>
            </div>

            <div class="settings-group">
                <div class="settings-header">
                    <span>🎨 Оформление</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="settings-content">
                    <div class="settings-inner">
                        
                        <div class="settings-row">
                            <span class="settings-row-label">Цветовая тема</span>
                            <div class="theme-carousel">
                                ${THEMES.map(t => `
                                    <button class="theme-pill ${settings.theme === t.id ? 'active' : ''}" data-theme="${t.id}">${t.name}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">Стиль интерфейса</span>
                            <div class="settings-grid-buttons" style="grid-template-columns: 1fr 1fr;">
                                ${STYLES.map(s => `
                                    <button class="settings-btn ${settings.uiStyle === s.id || (!settings.uiStyle && s.id === 'default') ? 'active' : ''}" data-uistyle="${s.id}">${s.name}</button>
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
                            <span class="settings-row-label">Размер шрифта</span>
                            <div class="settings-grid-buttons" style="grid-template-columns: 1fr 1fr 1fr;">
                                <button class="settings-btn ${settings.textScale === 0.9 ? 'active' : ''}" data-scale="0.9">Мелкий</button>
                                <button class="settings-btn ${settings.textScale === 1 || !settings.textScale ? 'active' : ''}" data-scale="1">Обычный</button>
                                <button class="settings-btn ${settings.textScale === 1.15 ? 'active' : ''}" data-scale="1.15">Крупный</button>
                            </div>
                        </div>

                        <div class="settings-row">
                            <span class="settings-row-label">Эффекты</span>
                            <div class="toggle-row" style="padding-top:0;">
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
                </div>
            </div>

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
                                ⚠️ Файлы с устройства не синхронизируются между устройствами (сохраняются только локально). Чтобы обои были везде, используйте ссылку (URL).
                            </div>
                        </div>
                        
                        <div class="toggle-row" style="margin-top: 8px;">
                            <span>Затемнение</span>
                            <input type="range" id="bg-darkness" min="0" max="0.8" step="0.1" value="${settings.bgDarkness || 0}" style="accent-color: var(--accent-color); width: 100px;">
                        </div>
                        <div class="toggle-row">
                            <span>Размытие</span>
                            <input type="range" id="bg-blur" min="0" max="15" step="1" value="${settings.bgBlur || 0}" style="accent-color: var(--accent-color); width: 100px;">
                        </div>
                        
                        <button id="btn-clear-bg" class="settings-btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                            🗑️ Убрать обои
                        </button>
                    </div>
                </div>
            </div>

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
                            <div class="settings-hint">Проводите пальцем влево/вправо по полосе с датами, чтобы переключать недели.</div>
                        </div>

                    </div>
                </div>
            </div>

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

            <!-- DANGER ZONE (Жестко скрыто через display: none) -->
            <div class="debug-zone" id="debug-zone" style="display: none;">
                <div class="debug-header">
                    <span>🛠 ОТЛАДКА (DANGER ZONE)</span>
                </div>
                <div class="debug-content">
                    <div class="debug-inner">
                        
                        <div class="debug-group">
                            <div class="debug-label">Машина времени (Виртуальное время)</div>
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
                            <button id="btn-debug-hard-reset" class="debug-btn danger">Hard Reset (Полный сброс)</button>
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
                            <div class="debug-info" id="debug-env-info">
                                Загрузка...
                            </div>
                        </div>

                        <button id="btn-debug-hide" class="debug-btn" style="margin-top: 10px; width: 100%;">Скрыть отладку</button>
                    </div>
                </div>
            </div>

            <!-- Версия -->
            <div style="text-align: center; margin-top: 20px; opacity: 0.4; cursor: pointer;" id="version-trigger">
                <span style="font-size: 11px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">
                    TimeHub-Portal • v${CONFIG.VERSION}
                </span>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // ЛОГИКА 5 КЛИКОВ ПО ВЕРСИИ
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

    // ЛОГИКА АККОРДЕОНА
    const headers = modal.querySelectorAll('.settings-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            const isActive = group.classList.contains('active');
            modal.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
            if (!isActive) group.classList.add('active');
        });
    });

    // ОБРАБОТЧИКИ
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

    modal.querySelectorAll('.settings-btn[data-uistyle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const style = e.target.dataset.uistyle;
            modal.querySelectorAll('.settings-btn[data-uistyle]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), uiStyle: style });
            applyStyle(style);
        });
    });

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

    modal.querySelectorAll('.settings-btn[data-scale]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scale = parseFloat(e.target.dataset.scale);
            modal.querySelectorAll('.settings-btn[data-scale]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), textScale: scale });
            applyTextScale(scale);
        });
    });

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
    modal.querySelector('#bg-darkness').addEventListener('input', (e) => { state.set('settings', { ...state.get('settings'), bgDarkness: parseFloat(e.target.value) }); });
    modal.querySelector('#bg-blur').addEventListener('input', (e) => { state.set('settings', { ...state.get('settings'), bgBlur: parseInt(e.target.value) }); });
    
    modal.querySelector('#btn-clear-bg').addEventListener('click', () => {
        state.set('settings', { ...state.get('settings'), bgUrl: '', bgDarkness: 0, bgBlur: 0 });
        modal.querySelector('#bg-url').value = '';
        modal.querySelector('#bg-file').value = '';
        modal.querySelector('#file-name').textContent = '';
        modal.querySelector('#bg-darkness').value = 0;
        modal.querySelector('#bg-blur').value = 0;
    });

    modal.querySelectorAll('.settings-btn[data-font]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const font = e.target.dataset.font;
            modal.querySelectorAll('.settings-btn[data-font]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), font: font });
            applyFont(font);
        });
    });

    modal.querySelectorAll('.theme-pill[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            modal.querySelectorAll('.theme-pill[data-theme]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.set('settings', { ...state.get('settings'), theme: theme });
            applyTheme(theme);
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