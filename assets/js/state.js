// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';
import { smartStorage } from './telegram-storage.js';

class State {
    constructor() {
        // 1. Синхронно загружаем настройки из localStorage (чтобы сайт открылся мгновенно)
        const savedSettings = JSON.parse(localStorage.getItem('timehub_settings')) || {};
        
        const currentWeekCalc = this.determineWeek();
        
        this.data = {
            currentWeek: currentWeekCalc, 
            realWeek: currentWeekCalc,    
            currentDay: new Date().getDay() === 0 ? 1 : new Date().getDay(), 
            settings: { ...CONFIG.DEFAULT_SETTINGS, ...savedSettings },
            schedule: null,
            substitutions: null
        };
        
        this.listeners = {};

        // 2. В фоне запускаем проверку облака Telegram
        this.syncWithCloud();
    }

    async syncWithCloud() {
        try {
            // Запрашиваем настройки из умного хранилища (сначала облако, потом локал)
            const cloudSettingsStr = await smartStorage.getItem('timehub_settings');
            
            if (cloudSettingsStr) {
                const cloudSettings = JSON.parse(cloudSettingsStr);
                const localSettingsStr = JSON.stringify(this.data.settings);

                // Если в облаке настройки другие — обновляем и применяем
                if (localSettingsStr !== cloudSettingsStr) {
                    this.data.settings = { ...CONFIG.DEFAULT_SETTINGS, ...cloudSettings };
                    localStorage.setItem('timehub_settings', cloudSettingsStr);
                    
                    // Оповещаем все модули (темы, шрифты, UI), что настройки изменились
                    this.emit('change:settings', this.data.settings);
                }
            }
        } catch (e) {
            console.warn('Ошибка синхронизации настроек с облаком Telegram:', e);
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
            const strValue = JSON.stringify(value);
            
            // Синхронно сохраняем в локальное хранилище
            localStorage.setItem('timehub_settings', strValue);
            
            // Асинхронно отправляем в облако (внутри smartStorage)
            smartStorage.setItem('timehub_settings', strValue);
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