// utils.js: Вспомогательные функции

// "09:20" -> 560 (минут)
export function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// 560 -> "09:20"
export function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

// Форматирование оставшегося времени (теперь с днями)
export function formatTimeLeft(mins) {
    if (mins < 60) return `${mins} мин`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    
    if (h >= 24) {
        const d = Math.floor(h / 24);
        const remH = h % 24;
        return `${d} д ${remH} ч`;
    }
    
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

export {};