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
    
    // Применяем стекло
    const settings = state.get('settings');
    if (!settings.liquidGlass) {
        document.body.classList.add('no-glass');
    }
    
    // Возвращаем шрифт
    applyFont(currentFont);
    
    state.set('settings', { ...settings, theme: themeName });
}

export function applyFont(fontName) {
    document.body.classList.remove('font-minecraft', 'font-tsap');
    
    if (fontName === 'tsap') {
        document.body.classList.add('font-tsap');
    } else {
        document.body.classList.add('font-minecraft');
    }
}

export function initThemes() {
    const settings = state.get('settings');
    applyTheme(settings.theme || 'dark');
    applyFont(settings.font || 'minecraft');
}

export {};