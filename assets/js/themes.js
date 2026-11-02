// themes.js: theme switching and application

import { state } from './state.js';

export function applyTheme(themeName) {
    // Сбрасываем классы, но сохраняем классы шрифтов
    const currentFont = state.get('settings').font || 'minecraft';
    document.body.className = ''; 
    
    // Применяем тему
    if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
    }
    
    // Применяем стекло (liquid glass)
    const settings = state.get('settings');
    if (!settings.liquidGlass) {
        document.body.classList.add('no-glass');
    }
    
    // Возвращаем шрифт
    applyFont(currentFont);
    // ВАЖНО: НЕ вызываем здесь state.set, чтобы не было рекурсии.
    // Сохранение настроек делается в settings.js при клике.
}

export function applyFont(fontName) {
    document.body.classList.remove(
        'font-minecraft', 'font-tsap', 
        'font-inter', 'font-roboto', 'font-rubik', 'font-play', 'font-montserrat'
    );
    
    if (['inter', 'roboto', 'rubik', 'play', 'montserrat'].includes(fontName)) {
        document.body.classList.add(`font-${fontName}`);
    } else if (fontName === 'tsap') {
        document.body.classList.add('font-tsap');
    } else {
        document.body.classList.add('font-minecraft');
    }
}

export function applyTextScale(scale) {
    document.documentElement.style.setProperty('--text-scale', scale);
}

export function initThemes() {
    const settings = state.get('settings');
    applyTheme(settings.theme || 'dark');
    applyFont(settings.font || 'minecraft');
    applyTextScale(settings.textScale || 1);
}

export {};