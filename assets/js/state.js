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
            substitutions: null,
            streak: { count: 0, lastVisit: '' }
        };
        
        this.listeners = {};

        this.initStreak();
        this.restoreSettingsFromCloud();
    }

    async restoreSettingsFromCloud() {
        try {
            const cloudSettingsStr = await smartStorage.getCloudOnly('timehub_settings');
            if (!cloudSettingsStr) return;

            const cloudSettings = JSON.parse(cloudSettingsStr);
            
            const cloudUpdatedAt = cloudSettings._updatedAt || 0;
            const localUpdatedAt = this.data.settings._updatedAt || 0;
            
            // Если облачные настройки новее (или локальных вообще нет метки времени) — применяем
            if (cloudUpdatedAt > localUpdatedAt || !this.data.settings._updatedAt) {
                this.data.settings = { ...CONFIG.DEFAULT_SETTINGS, ...cloudSettings };
                localStorage.setItem('timehub_settings', JSON.stringify(this.data.settings));
                this.emit('change:settings', this.data.settings);
                console.log('[State] ✅ Настройки обновлены из облака');
            } else {
                console.log('[State] Локальные настройки новее, оставляем их');
            }
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

            if (streakData.lastVisit !== localISOTime) {
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
        if (key === 'settings') {
            // Добавляем метку времени, чтобы знать, какие настройки новее
            const settingsWithTimestamp = { ...value, _updatedAt: Date.now() };
            this.data[key] = settingsWithTimestamp;
            this.emit(`change:${key}`, settingsWithTimestamp);
            
            // 1. Пишем локально полные настройки (с обоями)
            localStorage.setItem('timehub_settings', JSON.stringify(settingsWithTimestamp));
            
            // 2. Пишем в облако, но вырезаем base64-обои (не влезут в лимит)
            const cloudSettings = { ...settingsWithTimestamp };
            if (cloudSettings.bgUrl && cloudSettings.bgUrl.startsWith('data:')) {
                delete cloudSettings.bgUrl;
            }
            smartStorage.setItem('timehub_settings', JSON.stringify(cloudSettings));
            return;
        }
        
        // Для остальных ключей
        this.data[key] = value;
        this.emit(`change:${key}`, value);
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