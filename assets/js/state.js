// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';

class State {
    constructor() {
        // 1. Загружаем настройки ТОЛЬКО из локального хранилища устройства.
        // Каждое устройство (телефон, ПК) хранит свои настройки независимо.
        const savedSettings = JSON.parse(localStorage.getItem('timehub_settings')) || {};
        
        // Вычисляем текущую неделю на основе даты старта семестра
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
    }

    // Вычисление учебной недели (1 или 2)
    determineWeek() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const start = CONFIG.SEMESTER_START_DATE;
        
        const diffTime = Math.abs(today - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const weekIndex = Math.floor(diffDays / 7) % 2;
        return weekIndex + 1;
    }

    // Получить значение из состояния
    get(key) {
        return this.data[key];
    }

    // Установить значение и оповестить UI
    set(key, value) {
        this.data[key] = value;
        this.emit(`change:${key}`, value);
        
        if (key === 'settings') {
            // Сохраняем настройки ТОЛЬКО локально. 
            // В облако Telegram они больше не летят (по твоей просьбе).
            localStorage.setItem('timehub_settings', JSON.stringify(value));
        }
    }

    // Подписка на события
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Вызов события для всех подписчиков
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export const state = new State();

export {};