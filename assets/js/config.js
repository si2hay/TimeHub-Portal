// assets/js/config.js: Глобальные константы и настройки по умолчанию

export const CONFIG = {
    APP_NAME: "TimeHub-Portal",
    VERSION: "04.11.2026-06:16", // Обновлена версия
    
    // =====================================================================================
    // ⚠️ ВНИМАНИЕ! ГЛАВНЫЙ ВЫКЛЮЧАТЕЛЬ РЕЖИМА ОТЛАДКИ ⚠️
    // Перед релизом или если отладка не нужна, поставь ENABLE_DEBUG: false
    // После этого клики по версии в настройках перестанут открывать DANGER ZONE.
    // =====================================================================================
    ENABLE_DEBUG: true,
    
    // Точка отсчета: 26 октября 2026 (Начало 1-й недели)
    SEMESTER_START_DATE: new Date("2026-10-26T00:00:00"),
    
    // Настройки по умолчанию
    DEFAULT_SETTINGS: {
        theme: "dark",
        uiStyle: "default",
        font: "minecraft",
        particles: true,
        liquidGlass: true,
        pulse: true,
        weatherApi: "open-meteo",
        group: "26 АТП-2Бо", 
        course: 1,
        textScale: 1,
        dayPickerStyle: "capsule",
        dayChangeAnimation: "slide-up",
        enableWeekSwipe: true,
        debugTime: null
    }
};

export {};