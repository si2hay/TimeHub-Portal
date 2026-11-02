// assets/js/telegram-storage.js

// Безопасная функция проверки, что мы в Telegram
const getTg = () => window.Telegram?.WebApp;
const isCloudSupported = () => {
    const tg = getTg();
    return !!(tg && tg.initData && tg.CloudStorage);
};

// Инициализация при старте
if (isCloudSupported()) {
    try {
        getTg().ready();
        getTg().expand();
        console.log('[Telegram] WebApp успешно инициализирован');
    } catch (e) {
        console.warn('[Telegram] Ошибка инициализации:', e);
    }
}

const tgSetItem = (key, value) => new Promise((resolve) => {
    getTg().CloudStorage.setItem(key, value, (err) => resolve(!err));
});

const tgGetItem = (key) => new Promise((resolve) => {
    getTg().CloudStorage.getItem(key, (err, value) => resolve(err ? null : value));
});

const tgRemoveItem = (key) => new Promise((resolve) => {
    getTg().CloudStorage.removeItem(key, (err) => resolve(!err));
});

export const smartStorage = {
    async setItem(key, value) {
        // 1. Всегда пишем в localStorage (чтобы сайт работал и без ТГ)
        localStorage.setItem(key, value);

        // 2. Дублируем в облако Telegram (если мы в ТГ)
        if (isCloudSupported()) {
            try {
                if (value.length > 4000) {
                    console.warn(`[TelegramStorage] ⚠️ Данные "${key}" слишком большие для облака. Сохранено только локально.`);
                } else {
                    await tgSetItem(key, value);
                    console.log(`[TelegramStorage] ✅ Сохранено в облако TG: ${key}`);
                }
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка записи в облако:', e);
            }
        }
    },

    async getItem(key) {
        // 1. Сначала пробуем облако
        if (isCloudSupported()) {
            try {
                const cloudValue = await tgGetItem(key);
                if (cloudValue !== null && cloudValue !== '') {
                    console.log(`[TelegramStorage] 📥 Загружено из облака TG: ${key}`);
                    localStorage.setItem(key, cloudValue);
                    return cloudValue;
                }
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка чтения из облака:', e);
            }
        }
        // 2. Если облако пусто — берем локально
        return localStorage.getItem(key);
    },

    // Читает ТОЛЬКО из облака (без фолбэка). Нужен для сравнения настроек.
    async getCloudOnly(key) {
        if (isCloudSupported()) {
            try {
                const cloudValue = await tgGetItem(key);
                return cloudValue || null;
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка чтения из облака:', e);
            }
        }
        return null;
    },

    async removeItem(key) {
        localStorage.removeItem(key);
        if (isCloudSupported()) {
            try {
                await tgRemoveItem(key);
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка удаления из облака:', e);
            }
        }
    }
};