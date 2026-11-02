// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';
import { smartStorage } from './telegram-storage.js';

class State {
    constructor() {
        // Загружаем настройки ТОЛЬКО из локального хранилища устройства для мгновенного старта
        const savedSettings = JSON.parse(localStorage.getItem('timehub_settings')) || {};
        
        const currentWeekCalc = this.determineWeek();
        
        this.data = {
            currentWeek: currentWeekCalc, 
            realWeek: currentWeekCalc,    
            currentDay: new Date().getDay() === 0 ? 1 : new Date().getDay(), 
            settings: { ...CONFIG.DEFAULT_SETTINGS, ...savedSettings },
            schedule: null,
            substitutions: null,
            streak: { count: 0, lastVisit: '' }
        };
        
        this.listeners = {};

        // Запускаем асинхронную проверку стрика в облаке
        this.initStreak();

        // Если localStorage пуст (например, Telegram Desktop почистил кэш) — восстанавливаем из облака
        if (Object.keys(savedSettings).length === 0) {
            this.restoreSettingsFromCloud();
        }
    }

    async restoreSettingsFromCloud() {
        try {
            // Читаем ТОЛЬКО из облака
            const cloudSettingsStr = await smartStorage.getCloudOnly('timehub_settings');
            if (!cloudSettingsStr) return;

            const cloudSettings = JSON.parse(cloudSettingsStr);
            
            // Объединяем с дефолтными и сохраняем локально
            this.data.settings = { ...CONFIG.DEFAULT_SETTINGS, ...cloudSettings };
            localStorage.setItem('timehub_settings', JSON.stringify(this.data.settings));
            
            // Оповещаем UI: применить тему, шрифт, обои
            this.emit('change:settings', this.data.settings);
            console.log('[State] ✅ Настройки восстановлены из облака');
        } catch (e) {
            console.warn('[State] Не удалось восстановить настройки из облака:', e);
        }
    }

    async initStreak() {
        try {
            const savedStreakStr = await smartStorage.getItem('timehub_streak');
            let streakData = savedStreakStr ? JSON.parse(savedStreakStr) : { count: 0, lastVisit: '' };

            const today = new Date();
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];

            if (streakData.lastVisit === localISOTime) {
                // Уже заходили сегодня
            } else {
                const lastVisitDate = new Date(streakData.lastVisit);
                const currentDate = new Date(localISOTime);
                
                const diffTime = Math.abs(currentDate - lastVisitDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1 && streakData.lastVisit !== '') {
                    streakData.count += 1;
                } else {
                    streakData.count = 1;
                }
                streakData.lastVisit = localISOTime;
                
                await smartStorage.setItem('timehub_streak', JSON.stringify(streakData));
            }

            this.data.streak = streakData;
            this.emit('change:streak', streakData);
        } catch (e) {
            console.warn('Ошибка при загрузке стрика:', e);
        }
    }

    determineWeek() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const start = CONFIG.SEMESTER_START_DATE;
        
        const diffTime = Math.abs(today - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const weekIndex = Math.floor(diffDays / 7) % 2;
        return weekIndex + 1;
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this.emit(`change:${key}`, value);
        
        if (key === 'settings') {
            const fullStr = JSON.stringify(value);
            
            // 1. Всегда пишем полные настройки в localStorage (с обоями)
            localStorage.setItem('timehub_settings', fullStr);
            
            // 2. Отправляем в облако, но без base64-обоев (чтобы не превысить лимит 4096 символов)
            const cloudSettings = { ...value };
            if (cloudSettings.bgUrl && cloudSettings.bgUrl.startsWith('data:')) {
                delete cloudSettings.bgUrl; // Вырезаем тяжелую картинку
            }
            smartStorage.setItem('timehub_settings', JSON.stringify(cloudSettings));
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export const state = new State();

export {};