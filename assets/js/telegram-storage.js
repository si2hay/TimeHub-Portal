// assets/js/telegram-storage.js

// Проверяем, открыты ли мы в Telegram и поддерживается ли CloudStorage
const tg = window.Telegram?.WebApp;
const isTelegram = !!(tg && tg.initData);
const isCloudSupported = isTelegram && tg.CloudStorage && typeof tg.CloudStorage.setItem === 'function';

// Вспомогательные промисы для Telegram CloudStorage
const tgSetItem = (key, value) => new Promise((resolve) => tg.CloudStorage.setItem(key, value, (err) => resolve(!err)));
const tgGetItem = (key) => new Promise((resolve) => tg.CloudStorage.getItem(key, (err, value) => resolve(err ? null : value)));
const tgRemoveItem = (key) => new Promise((resolve) => tg.CloudStorage.removeItem(key, (err) => resolve(!err)));

export const smartStorage = {
    async setItem(key, value) {
        // 1. Всегда пишем в localStorage (для офлайн-режима и обычных браузеров)
        localStorage.setItem(key, value);

        // 2. Если мы в Telegram, дублируем в облако
        if (isCloudSupported) {
            try {
                await tgSetItem(key, value);
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка записи в облако:', e);
            }
        }
    },

    async getItem(key) {
        // 1. Если мы в Telegram, пробуем сначала взять из облака (у него приоритет)
        if (isCloudSupported) {
            try {
                const cloudValue = await tgGetItem(key);
                if (cloudValue !== null && cloudValue !== '') {
                    // Синхронизируем облако с локальным хранилищем
                    localStorage.setItem(key, cloudValue);
                    return cloudValue;
                }
            } catch (e) {
                console.warn('[TelegramStorage] Ошибка чтения из облака:', e);
            }
        }

        // 2. Если не в ТГ или в облаке пусто — читаем из localStorage
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