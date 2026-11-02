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
            streak: { count: 0, lastVisit: '', status: 'alive' }
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
            
            if (cloudUpdatedAt > localUpdatedAt || !this.data.settings._updatedAt) {
                this.data.settings = { ...CONFIG.DEFAULT_SETTINGS, ...cloudSettings };
                localStorage.setItem('timehub_settings', JSON.stringify(this.data.settings));
                this.emit('change:settings', this.data.settings);
                console.log('[State] ✅ Настройки обновлены из облака');
            }
        } catch (e) {
            console.warn('[State] Не удалось восстановить настройки из облака:', e);
        }
    }

    async initStreak() {
        try {
            const savedStreakStr = await smartStorage.getItem('timehub_streak');
            let streakData = savedStreakStr ? JSON.parse(savedStreakStr) : { count: 0, lastVisit: '', status: 'alive' };
            
            const now = new Date();
            const nowTime = now.getTime();
            
            if (!streakData.lastVisit || streakData.lastVisit.length === 10) {
                streakData = { count: 1, lastVisit: now.toISOString(), status: 'alive' };
            } else {
                const lastVisitDate = new Date(streakData.lastVisit);
                const diffHours = (nowTime - lastVisitDate.getTime()) / (1000 * 60 * 60);
                
                const offset = now.getTimezoneOffset() * 60000;
                const localToday = (new Date(now - offset)).toISOString().split('T')[0];
                const localLastVisit = (new Date(lastVisitDate - offset)).toISOString().split('T')[0];
                
                if (localToday === localLastVisit) {
                    // Уже заходил сегодня, статус не меняем
                } else {
                    if (diffHours > 48) {
                        streakData.count = 0; // Полностью сгорел
                        streakData.status = 'dead';
                    } else if (diffHours > 36) {
                        streakData.status = 'dying';
                    } else {
                        streakData.count += 1;
                        streakData.status = 'alive';
                        streakData.lastVisit = now.toISOString();
                    }
                }
            }

            this.data.streak = streakData;
            this.emit('change:streak', streakData);
            await smartStorage.setItem('timehub_streak', JSON.stringify(streakData));
        } catch (e) {
            console.warn('Ошибка при загрузке стрика:', e);
        }
    }

    async reviveStreak() {
        if (this.data.streak.status === 'dying') {
            this.data.streak.status = 'alive';
            this.data.streak.lastVisit = new Date().toISOString();
            this.emit('change:streak', this.data.streak);
            await smartStorage.setItem('timehub_streak', JSON.stringify(this.data.streak));
            return true;
        }
        return false;
    }

    async resetStreak() {
        this.data.streak = { count: 1, lastVisit: new Date().toISOString(), status: 'alive' };
        this.emit('change:streak', this.data.streak);
        await smartStorage.setItem('timehub_streak', JSON.stringify(this.data.streak));
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
            const settingsWithTimestamp = { ...value, _updatedAt: Date.now() };
            this.data[key] = settingsWithTimestamp;
            this.emit(`change:${key}`, settingsWithTimestamp);
            localStorage.setItem('timehub_settings', JSON.stringify(settingsWithTimestamp));
            const cloudSettings = { ...settingsWithTimestamp };
            if (cloudSettings.bgUrl && cloudSettings.bgUrl.startsWith('data:')) delete cloudSettings.bgUrl;
            smartStorage.setItem('timehub_settings', JSON.stringify(cloudSettings));
            return;
        }
        this.data[key] = value;
        this.emit(`change:${key}`, value);
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) this.listeners[event].forEach(callback => callback(data));
    }
}

export const state = new State();
export {};