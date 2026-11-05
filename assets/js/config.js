// assets/js/config.js: Глобальные константы и настройки по умолчанию

export const CONFIG = {
    APP_NAME: "TimeHub-Portal",
    VERSION: "05.11.2026-03:29",
    
    ENABLE_DEBUG: false, //вкл отладку true,выключить false
    SEMESTER_START_DATE: new Date("2026-10-26T00:00:00"),
    
    DEFAULT_SETTINGS: {
        theme: "dark",
        font: "minecraft",
        particles: true,
        liquidGlass: true,
        pulse: true,
        weatherApi: "open-meteo",
        group: "26 АТП-2Бо", 
        course: 1,
        textScaleLevel: 5,
        
        // ОБНОВЛЕНО: Больше настроек для кастома
        customColors: {
            enabled: false,
            accent: "#0062b1",       
            background: "#0f1115",   
            surface: "#1a1d24",      // Цвет карточек
            text: "#e2e8f0",         
            textMuted: "#94a3b8",    // Цвет дат и деталей
            gradient: {
                enabled: false,      
                color1: "#0f2027",
                color2: "#2c5364",
                angle: 135
            }
        },
        
        customBorderRadius: null,
        bgDarknessLevel: 0,
        bgBlurLevel: 0,
        
        effects: {
            strictCorners: false,
            neonGlow: false,
            terminalGrid: false,
            scanlines: false,
            thickBorders: false,
            dotBackground: false,
            asciiBrackets: false
        },
        
        dayPickerStyle: "capsule",
        dayChangeAnimation: "slide-up",
        enableWeekSwipe: true,
        debugTime: null
    }
};

export {};