// themes.js: theme switching and application

import { state } from './state.js';

export function applyTheme(themeName) {
    const currentFont = state.get('settings').font || 'minecraft';
    document.body.className = ''; 
    
    if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
    }
    
    const settings = state.get('settings');
    if (!settings.liquidGlass) {
        document.body.classList.add('no-glass');
    }
    
    applyFont(currentFont);
    state.set('settings', { ...settings, theme: themeName });
}

export function applyFont(fontName) {
    // Сбрасываем все возможные классы шрифтов
    document.body.classList.remove(
        'font-minecraft', 'font-tsap', 
        'font-inter', 'font-roboto', 'font-rubik', 'font-play', 'font-montserrat'
    );
    
    // Применяем новый
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