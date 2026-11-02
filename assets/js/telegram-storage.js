// assets/js/telegram-storage.js

const tg = window.Telegram?.WebApp;
const isCloudSupported = !!(tg && tg.initData && tg.CloudStorage);

if (isCloudSupported) {
    try {
        tg.ready();
        tg.expand();
        console.log('[Telegram] WebApp успешно инициализирован');
    } catch (e) {
        console.warn('[Telegram] Ошибка инициализации:', e);
    }
}

const tgSetItem = (key, value) => new Promise((resolve) => {
    tg.CloudStorage.setItem(key, value, (err) => resolve(!err));
});

const tgGetItem = (key) => new Promise((resolve) => {
    tg.CloudStorage.getItem(key, (err, value) => resolve(err ? null : value));
});

const tgRemoveItem = (key) => new Promise((resolve) => {
    tg.CloudStorage.removeItem(key, (err) => resolve(!err));
});

export const smartStorage = {
    async setItem(key, value) {
        // 1. Всегда пишем в localStorage для мгновенной загрузки
        localStorage.setItem(key, value);

        // 2. Дублируем в облако Telegram (если мы в ТГ)
        if (isCloudSupported) {
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
        // 1. Сначала пробуем облако (приоритет облака)
        if (isCloudSupported) {
            try {
                const cloudValue = await tgGetItem(key);
                if (cloudValue !== null && cloudValue !== '') {
                    console.log(`[TelegramStorage] 📥 Загружено из облака TG: ${key}`);
                    localStorage.setItem(key, cloudValue); // Синхронизируем локально
                    return cloudValue;
                }
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка чтения из облака:', e);
            }
        }
        // 2. Если облако пусто или мы не в ТГ — берем локально
        return localStorage.getItem(key);
    },

    // Специальный метод: читает ТОЛЬКО из облака (без фолбэка в localStorage)
    // Нужен для восстановления настроек, если localStorage был очищен
    async getCloudOnly(key) {
        if (isCloudSupported) {
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
        if (isCloudSupported) {
            try {
                await tgRemoveItem(key);
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка удаления из облака:', e);
            }
        }
    }
};