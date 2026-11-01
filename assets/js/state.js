// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';
import { smartStorage } from './telegram-storage.js';

class State {
    constructor() {
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
        this.isReady = false;

        // Запускаем синхронизацию в фоне
        this.initCloudSync();
    }

    async initCloudSync() {
        try {
            const cloudSettingsStr = await smartStorage.getItem('timehub_settings');
            
            if (cloudSettingsStr) {
                const cloudSettings = JSON.parse(cloudSettingsStr);
                const localSettingsStr = JSON.stringify(this.data.settings);

                if (localSettingsStr !== cloudSettingsStr) {
                    this.data.settings = { ...CONFIG.DEFAULT_SETTINGS, ...cloudSettings };
                    localStorage.setItem('timehub_settings', cloudSettingsStr);
                    
                    // Оповещаем интерфейс, что настройки поменялись
                    this.emit('change:settings', this.data.settings);
                }
            }
        } catch (e) {
            console.warn('Ошибка синхронизации настроек:', e);
        } finally {
            this.isReady = true;
            this.emit('ready'); // Говорим всем, что облако проверено
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
            localStorage.setItem('timehub_settings', strValue); 
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