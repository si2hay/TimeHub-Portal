// storage.js: Модуль для безопасной работы с localStorage

export const storage = {
    get(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            console.error(`Ошибка чтения ключа "${key}" из localStorage`, e);
            return fallback;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Ошибка записи ключа "${key}" в localStorage`, e);
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Ошибка удаления ключа "${key}" из localStorage`, e);
        }
    }
};

export {};