// state.js: Хранилище состояния приложения и система событий

import { CONFIG } from './config.js';
import { smartStorage } from './telegram-storage.js';

class State {
    constructor() {
        // Загружаем настройки ТОЛЬКО из локального хранилища устройства.
        const savedSettings = JSON.parse(localStorage.getItem('timehub_settings')) || {};
        
        const currentWeekCalc = this.determineWeek();
        
        this.data = {
            currentWeek: currentWeekCalc, 
            realWeek: currentWeekCalc,    
            currentDay: new Date().getDay() === 0 ? 1 : new Date().getDay(), 
            settings: { ...CONFIG.DEFAULT_SETTINGS, ...savedSettings },
            schedule: null,
            substitutions: null,
            streak: { count: 0, lastVisit: '' } // <-- Добавили стрик
        };
        
        this.listeners = {};

        // Запускаем асинхронную проверку стрика в облаке
        this.initStreak();
    }

    async initStreak() {
        try {
            // Берем стрик из облака (или локалки)
            const savedStreakStr = await smartStorage.getItem('timehub_streak');
            let streakData = savedStreakStr ? JSON.parse(savedStreakStr) : { count: 0, lastVisit: '' };

            const today = new Date();
            // Формируем строку даты в локальном времени (YYYY-MM-DD)
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];

            if (streakData.lastVisit === localISOTime) {
                // Уже заходили сегодня, ничего не меняем
            } else {
                // Проверяем, был ли вчерашний визит
                const lastVisitDate = new Date(streakData.lastVisit);
                const currentDate = new Date(localISOTime);
                
                const diffTime = Math.abs(currentDate - lastVisitDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1 && streakData.lastVisit !== '') {
                    // Заходил вчера -> увеличиваем стрик
                    streakData.count += 1;
                } else {
                    // Пропустил день или первый заход -> сбрасываем на 1
                    streakData.count = 1;
                }
                streakData.lastVisit = localISOTime;
                
                // Сохраняем обновленный стрик
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