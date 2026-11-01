// debug.js: Временный режим отладки (перехват времени)

// Проверяем, есть ли сохраненное время в сессии
const savedDebugTime = sessionStorage.getItem('debugTime');

// Если есть — переопределяем глобальный Date
if (savedDebugTime) {
    const OriginalDate = Date;
    
    window.Date = class extends OriginalDate {
        constructor(...args) {
            if (args.length === 0) {
                return new OriginalDate(savedDebugTime);
            }
            return new OriginalDate(...args);
        }
        static now() {
            return new OriginalDate(savedDebugTime).getTime();
        }
    };
}

// Создаем плавающую кнопку для управления отладкой
export function initDebug() {
    const btn = document.createElement('button');
    btn.innerText = '🛠 Отладка';
    btn.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 99999;
        background: #ef4444; color: white; border: none; border-radius: 20px;
        padding: 8px 12px; font-size: 12px; font-weight: bold; cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-family: monospace;
    `;

    btn.addEventListener('click', () => {
        // Открываем диалоговое окно для ввода времени
        const current = savedDebugTime || new Date().toISOString().slice(0, 16);
        const input = prompt("Введи дату и время (ГГГГ-ММ-ДДTЧЧ:ММ), или оставь пустым, чтобы сбросить:", current);
        
        if (input === null) return; // Если нажали Отмена
        
        if (input.trim() === '') {
            sessionStorage.removeItem('debugTime');
        } else {
            sessionStorage.setItem('debugTime', input);
        }
        location.reload(); // Перезагружаем страницу, чтобы время применилось
    });

    document.body.appendChild(btn);
}

export {};