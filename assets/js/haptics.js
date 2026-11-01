// assets/js/haptics.js

import { state } from './state.js';

export function vibrate(type = 'impact') {
    const settings = state.get('settings');
    
    // Если вибрация выключена в настройках — ничего не делаем
    if (!settings.vibration) return;

    const force = settings.vibrationForce || 'medium';

    // Приоритет 1: Telegram Haptic Feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
        if (type === 'impact') {
            window.Telegram.WebApp.HapticFeedback.impactOccurred(force);
        } else if (type === 'success') {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        } else if (type === 'error') {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
    } 
    // Приоритет 2: Обычная вибрация в браузере
    else if (navigator.vibrate) {
        const duration = force === 'heavy' ? 50 : (force === 'light' ? 10 : 25);
        navigator.vibrate(duration);
    }
}