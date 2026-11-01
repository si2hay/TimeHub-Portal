// pwa.js: Управление установкой приложения (PWA)

let deferredPrompt = null;

export function initPWA() {
    // Ловим событие готовности к установке
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA: Браузер готов к установке');
        
        // Меняем текст кнопки, если она уже есть на странице
        const installBtn = document.getElementById('btn-install-pwa');
        if (installBtn) {
            installBtn.innerHTML = '📲 Установить на устройство';
            installBtn.style.background = 'var(--accent-color)';
            installBtn.style.color = 'white';
        }
    });

    // Слушаем событие, если приложение уже установлено
    window.addEventListener('appinstalled', () => {
        console.log('PWA: Приложение установлено');
        const installBtn = document.getElementById('btn-install-pwa');
        if (installBtn) {
            installBtn.innerHTML = '✅ Приложение установлено';
            installBtn.style.background = 'rgba(255,255,255,0.1)';
            installBtn.style.color = 'var(--text-main)';
        }
        deferredPrompt = null;
    });

    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => console.log('SW зарегистрирован:', reg.scope))
                .catch((err) => console.log('Ошибка SW:', err));
        });
    }
}

// Вызов окна установки
export async function promptInstall() {
    if (!deferredPrompt) {
        // Если браузер не готов, показываем инструкцию
        alert('Браузер не может установить приложение автоматически.\n\n' +
              'Пожалуйста, установите вручную:\n' +
              '1. Нажмите на три точки (меню) в правом верхнем углу браузера.\n' +
              '2. Выберите "Установить приложение" или "Добавить на главный экран".');
        return false;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('Пользователь установил приложение');
    } else {
        console.log('Пользователь отклонил установку');
    }
    
    deferredPrompt = null;
    return outcome === 'accepted';
}

export {};