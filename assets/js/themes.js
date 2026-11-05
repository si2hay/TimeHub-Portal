// assets/js/themes.js: темы, эффекты, шрифты, кастомные цвета и скругление

import { state } from './state.js';

export const FONT_SCALES = [0.65, 0.75, 0.85, 0.95, 1.0, 1.1, 1.2, 1.35, 1.5, 1.7];

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

export function applyEffects(effects) {
    if (!effects) return;
    Object.keys(effects).forEach(key => {
        const cssClass = `effect-${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
        if (effects[key]) {
            document.body.classList.add(cssClass);
        } else {
            document.body.classList.remove(cssClass);
        }
    });
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

export function applyTextScaleLevel(level) {
    const idx = Math.max(0, Math.min(9, (level || 5) - 1));
    applyTextScale(FONT_SCALES[idx]);
}

function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function hexToRgba(hex, alpha = 1) {
    if (!hex || !hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyCustomColors(customColors) {
    const body = document.body;
    
    // Очищаем ВСЕ переменные
    const vars = [
        '--accent-color', '--accent-hover', '--bg-color', '--text-main', '--text-muted', '--bg-gradient',
        '--surface-color', '--glass-bg', '--border-color', '--glass-border', '--shadow'
    ];
    vars.forEach(v => body.style.removeProperty(v));
    
    // Если кастом выключен, просто выходим. Тема применится через CSS.
    if (!customColors || !customColors.enabled) return;
    
    // 1. Акцент
    if (customColors.accent) {
        body.style.setProperty('--accent-color', customColors.accent);
        body.style.setProperty('--accent-hover', shadeColor(customColors.accent, 15));
    }
    
    // 2. Фон страницы
    if (customColors.background) {
        body.style.setProperty('--bg-color', customColors.background);
    }
    
    // 3. Текст
    if (customColors.text) {
        body.style.setProperty('--text-main', customColors.text);
        body.style.setProperty('--border-color', hexToRgba(customColors.text, 0.15));
        body.style.setProperty('--glass-border', hexToRgba(customColors.text, 0.2));
    }
    if (customColors.textMuted) {
        body.style.setProperty('--text-muted', customColors.textMuted);
    }
    
    // 4. Карточки
    if (customColors.surface) {
        body.style.setProperty('--surface-color', hexToRgba(customColors.surface, 0.92));
        body.style.setProperty('--glass-bg', hexToRgba(customColors.surface, 0.45));
        body.style.setProperty('--shadow', '0 4px 20px rgba(0, 0, 0, 0.3)');
    }
    
    // 5. Градиент
    if (customColors.gradient && customColors.gradient.enabled) {
        const { color1, color2, angle } = customColors.gradient;
        body.style.setProperty(
            '--bg-gradient',
            `linear-gradient(${angle || 135}deg, ${color1}, ${color2})`
        );
    } else {
        body.style.setProperty('--bg-gradient', 'none');
    }
}

export function applyCustomBorderRadius(value) {
    if (value === null || value === undefined) {
        document.body.style.removeProperty('--border-radius');
    } else {
        document.body.style.setProperty('--border-radius', `${value}px`);
    }
}

export function initThemes() {
    const settings = state.get('settings');
    applyTheme(settings.theme || 'dark');
    applyEffects(settings.effects);
    applyFont(settings.font || 'minecraft');
    
    const level = settings.textScaleLevel ?? 5;
    applyTextScaleLevel(level);
    
    applyCustomColors(settings.customColors);
    applyCustomBorderRadius(settings.customBorderRadius);
}

export {};