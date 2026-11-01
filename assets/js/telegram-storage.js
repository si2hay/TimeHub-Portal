// assets/js/telegram-storage.js

// Безопасно получаем объект Telegram
const tg = window.Telegram?.WebApp;

// Проверяем поддержку облака
const isCloudSupported = !!(tg && tg.initData && tg.CloudStorage);

// Если мы в Telegram — сообщаем ему, что мы готовы, и разворачиваем на весь экран
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
        localStorage.setItem(key, value);

        if (isCloudSupported) {
            try {
                // Лимит Telegram CloudStorage - 4096 символов на ключ
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
        if (isCloudSupported) {
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
        return localStorage.getItem(key);
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