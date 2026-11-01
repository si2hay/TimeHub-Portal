// config.js: Глобальные константы и настройки по умолчанию

export const CONFIG = {
    APP_NAME: "TimeHub-Portal",
    VERSION: "1.0.0",
    
    // Точка отсчета: 26 октября 2026 (Начало 1-й недели)
    SEMESTER_START_DATE: new Date("2026-10-26T00:00:00"),
    
    // Настройки по умолчанию
    DEFAULT_SETTINGS: {
        theme: "dark",
        font: "minecraft", // <-- Изменено с monocraft
        particles: true,
        liquidGlass: true,
        pulse: true,
        weatherApi: "open-meteo",
        group: "26 АТП-2Бо", 
        course: 1 
    }
};

export {};