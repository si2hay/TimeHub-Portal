// themes.js: theme switching and application

import { state } from './state.js';

export function applyTheme(themeName) {
    const classesToRemove = Array.from(document.body.classList).filter(c => c.startsWith('theme-'));
    document.body.classList.remove(...classesToRemove);
    
    if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
    }
    
    const settings = state.get('settings');
    if (!settings.liquidGlass) {
        document.body.classList.add('no-glass');
    } else {
        document.body.classList.remove('no-glass');
    }
}

export function applyStyle(styleName) {
    const classesToRemove = Array.from(document.body.classList).filter(c => c.startsWith('style-'));
    document.body.classList.remove(...classesToRemove);
    
    if (styleName && styleName !== 'default') {
        document.body.classList.add(`style-${styleName}`);
    }
}

export function applyFont(fontName) {
    document.body.classList.remove(
        'font-minecraft', 'font-tsap', 
        'font-inter', 'font-roboto', 'font-rubik', 'font-play', 'font-montserrat',
        'font-terminal', 'font-paper', 'font-cyber', 'font-synth', 'font-soft'
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
    applyStyle(settings.uiStyle || 'default');
    applyFont(settings.font || 'minecraft');
    applyTextScale(settings.textScale || 1);
}

export {};