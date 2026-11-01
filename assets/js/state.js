// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';

class State {
    constructor() {
        // Загружаем настройки из localStorage (если есть) или берем дефолтные
        const savedSettings = JSON.parse(localStorage.getItem('timehub_settings')) || {};
        
        const currentWeekCalc = this.determineWeek();
        
        this.data = {
            currentWeek: currentWeekCalc, // Выбранная пользователем неделя
            realWeek: currentWeekCalc,    // <-- Настоящая текущая неделя (для возврата)
            currentDay: new Date().getDay() === 0 ? 1 : new Date().getDay(), 
            settings: { ...CONFIG.DEFAULT_SETTINGS, ...savedSettings },
            schedule: null,
            substitutions: null
        };
        
        this.listeners = {};
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
            localStorage.setItem('timehub_settings', JSON.stringify(value));
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