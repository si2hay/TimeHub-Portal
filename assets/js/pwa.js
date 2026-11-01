// pwa.js: Управление установкой приложения (PWA) и авто-обновление

let deferredPrompt = null;

export function initPWA() {
    // --- 1. ЛОГИКА УСТАНОВКИ ---
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA: Браузер готов к установке');
        
        const installBtn = document.getElementById('btn-install-pwa');
        if (installBtn) {
            installBtn.innerHTML = '📲 Установить на устройство';
            installBtn.style.background = 'var(--accent-color)';
            installBtn.style.color = 'white';
        }
    });

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

    // --- 2. РЕГИСТРАЦИЯ SERVICE WORKER С АВТО-ОБНОВЛЕНИЕМ ---
    if ('serviceWorker' in navigator) {
        // updateViaCache: 'none' — заставляет браузер ВСЕГДА проверять sw.js на сервере
        navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
            .then(registration => {
                console.log('SW зарегистрирован:', registration.scope);

                // Если нашли новый воркер (потому что изменился sw.js)
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Если новый воркер установлен и уже есть активный старый
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Найдено обновление! Активируем...');
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                // Каждые 60 секунд проверяем обновления на сервере (пока сайт открыт)
                setInterval(() => {
                    registration.update();
                }, 60000);
            })
            .catch(err => console.error('SW register failed:', err));

        // Когда новый воркер активировался — перезагружаем страницу
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}

// Вызов окна установки
export async function promptInstall() {
    if (!deferredPrompt) {
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