// themes.js: theme switching and application

import { state } from './state.js';

export function applyTheme(themeName) {
    document.body.className = ''; // Сбрасываем классы
    
    if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
    }
    
    // Применяем настройку Liquid Glass
    const settings = state.get('settings');
    if (!settings.liquidGlass) {
        document.body.classList.add('no-glass');
    } else {
        document.body.classList.remove('no-glass');
    }
    
    state.set('settings', { ...settings, theme: themeName });
}

export function initThemes() {
    const settings = state.get('settings');
    applyTheme(settings.theme || 'dark');
}

export {};