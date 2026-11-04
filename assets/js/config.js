// assets/js/config.js: Глобальные константы и настройки по умолчанию

export const CONFIG = {
    APP_NAME: "TimeHub-Portal",
    VERSION: "04.11.2026-03:34", // Обновлена версия
    
    // Точка отсчета: 26 октября 2026 (Начало 1-й недели)
    SEMESTER_START_DATE: new Date("2026-10-26T00:00:00"),
    
    // Настройки по умолчанию
    DEFAULT_SETTINGS: {
        theme: "dark",
        font: "minecraft",
        particles: true,
        liquidGlass: true,
        pulse: true,
        weatherApi: "open-meteo",
        group: "26 АТП-2Бо", 
        course: 1,
        textScale: 1,
        dayPickerStyle: "capsule", // Новый стиль по умолчанию
        dayChangeAnimation: "slide-up",
        enableWeekSwipe: true // Новая настройка: свайп недель
    }
};

export {};