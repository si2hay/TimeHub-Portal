// ui/weather.js: Виджет погоды с поддержкой нескольких API

import { state } from '../state.js';

export function createWeather() {
    const container = document.createElement('div');
    // Убираем класс glass-panel, чтобы погода не выглядела как отдельная карточка
    container.className = 'weather-widget'; 
    container.id = 'weather-widget';

    const LAT = 48.7080;
    const LON = 44.5133;

    const ADVICE = {
        cold: ["Мороз, надевай пуховик!", "Одевайся как капуста.", "Не забудь перчатки!"],
        cool: ["Накинь куртку.", "Ветровка или пальто.", "Возьми кофту с капюшоном."],
        warm: ["Комфортная погода!", "Можно в худи.", "Хорошая погода для прогулки."],
        hot: ["Жара, футболка и шорты!", "Не забудь кепку.", "Легкая одежда, сегодня пекло."]
    };

    function getAdvice(temp) {
        let category = 'warm';
        if (temp < 0) category = 'cold';
        else if (temp < 15) category = 'cool';
        else if (temp > 24) category = 'hot';
        const list = ADVICE[category];
        return list[Math.floor(Math.random() * list.length)];
    }

    async function fetchOpenMeteo() {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`);
        if (!res.ok) throw new Error('Open-Meteo failed');
        const data = await res.json();
        return { temp: Math.round(data.current_weather.temperature), isDay: data.current_weather.is_day === 1 };
    }

    async function fetchWttrIn() {
        const res = await fetch(`https://wttr.in/${LAT},${LON}?format=j1`);
        if (!res.ok) throw new Error('wttr.in failed');
        const data = await res.json();
        const current = data.current_condition[0];
        return { temp: parseInt(current.temp_C, 10), isDay: current.isDayTime === "yes" };
    }

    async function loadWeather() {
        // Показываем заглушку при загрузке
        container.innerHTML = `<div style="font-size:12px; color:var(--text-muted);">...</div>`;

        const settings = state.get('settings');
        const preferred = settings.weatherApi || 'open-meteo';
        let provider = preferred;
        let weatherData = null;

        try {
            if (provider === 'open-meteo') weatherData = await fetchOpenMeteo();
            else if (provider === 'wttr-in') weatherData = await fetchWttrIn();
            else weatherData = await fetchOpenMeteo();
        } catch (e) {
            console.warn(`API "${provider}" не ответил, пробуем запасной...`, e);
            try {
                if (provider === 'open-meteo') {
                    weatherData = await fetchWttrIn();
                    provider = 'wttr-in';
                } else {
                    weatherData = await fetchOpenMeteo();
                    provider = 'open-meteo';
                }
                const newSettings = { ...settings, weatherApi: provider };
                state.set('settings', newSettings);
            } catch (e2) {
                container.innerHTML = `<span>🌧️</span><span style="font-size:10px; color:var(--text-muted);">Нет данных</span>`;
                return;
            }
        }

        const icon = weatherData.isDay ? '☀️' : '🌙';
        const advice = getAdvice(weatherData.temp);

        // ВАЖНО: Здесь мы создаем два блока, которые CSS раскидает по краям
        container.innerHTML = `
            <div class="weather-main">
                <span class="weather-icon">${icon}</span>
                <span class="temp-value">${weatherData.temp}°C</span>
            </div>
            <div class="weather-advice">${advice}</div>
        `;
    }

    loadWeather();

    // Возвращаем нормальный DOM-элемент
    return container;
}

export {};