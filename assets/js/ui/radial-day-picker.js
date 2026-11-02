// ui/radial-day-picker.js: Меню выбора дня (мульти-стиль)

import { state } from '../state.js';

export function createRadialDayPicker() {
    const container = document.createElement('div');
    container.className = 'day-picker-wrapper';
    container.id = 'day-picker-wrapper';

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
    let currentStyle = state.get('settings').dayPickerStyle || 'radial';

    function render() {
        container.innerHTML = '';
        const currentDay = state.get('currentDay'); // 1-5

        // === ВАРИАНТ 1: РАДИАЛЬНОЕ МЕНЮ ===
        if (currentStyle === 'radial') {
            const radialContainer = document.createElement('div');
            radialContainer.className = 'radial-menu-container';

            const trigger = document.createElement('button');
            trigger.className = 'radial-trigger';
            trigger.innerHTML = '✚';

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'radial-menu-items';

            days.forEach((day, index) => {
                const item = document.createElement('div');
                item.className = 'radial-item';
                item.textContent = day;
                item.style.setProperty('--i', index);
                if (index + 1 === currentDay) item.classList.add('active');

                item.addEventListener('click', () => {
                    state.set('currentDay', index + 1);
                    radialContainer.classList.remove('open');
                });
                itemsContainer.appendChild(item);
            });

            trigger.addEventListener('click', () => {
                radialContainer.classList.toggle('open');
            });

            radialContainer.appendChild(trigger);
            radialContainer.appendChild(itemsContainer);
            container.appendChild(radialContainer);
        }

        // === ВАРИАНТ 2: ТАБЫ С ПОЛЗУНКОМ ===
        else if (currentStyle === 'tabs') {
            const tabs = document.createElement('div');
            tabs.className = 'tabs-container';
            
            // ИСПРАВЛЕНИЕ: Сначала создаем пустую строку
            let html = '';
            
            days.forEach((day, index) => {
                const val = index + 1;
                const isChecked = val === currentDay ? 'checked' : '';
                html += `
                    <input type="radio" name="day-tab" id="tab-${val}" value="${val}" ${isChecked}>
                    <label for="tab-${val}">${day}</label>
                `;
            });
            
            // ИСПРАВЛЕНИЕ: Ползунок добавляем В САМЫЙ КОНЕЦ, чтобы CSS-правило "~" сработало
            html += '<div class="glider"></div>';
            
            tabs.innerHTML = html;

            tabs.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    if (e.target.checked) state.set('currentDay', parseInt(e.target.value));
                });
            });
            container.appendChild(tabs);
        }

        // === ВАРИАНТ 3: СТЕКЛО ===
        else if (currentStyle === 'glass') {
            const glass = document.createElement('div');
            glass.className = 'glass-radio-group';
            
            // ИСПРАВЛЕНИЕ: Сначала создаем пустую строку
            let html = '';
            
            days.forEach((day, index) => {
                const val = index + 1;
                const isChecked = val === currentDay ? 'checked' : '';
                html += `
                    <input type="radio" name="day-glass" id="glass-${val}" value="${val}" ${isChecked}>
                    <label for="glass-${val}">${day}</label>
                `;
            });
            
            // ИСПРАВЛЕНИЕ: Стеклянный ползунок добавляем В САМЫЙ КОНЕЦ
            html += '<div class="glass-glider"></div>';
            
            glass.innerHTML = html;

            glass.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    if (e.target.checked) state.set('currentDay', parseInt(e.target.value));
                });
            });
            container.appendChild(glass);
        }

        // === ВАРИАНТ 4: МИНИМАЛИЗМ ===
        else if (currentStyle === 'minimal') {
            const minimal = document.createElement('div');
            minimal.className = 'minimal-tabs';
            
            days.forEach((day, index) => {
                const btn = document.createElement('button');
                btn.textContent = day;
                if (index + 1 === currentDay) btn.classList.add('active');
                
                btn.addEventListener('click', () => {
                    state.set('currentDay', index + 1);
                });
                minimal.appendChild(btn);
            });
            container.appendChild(minimal);
        }
    }

    state.on('change:currentDay', render);
    
    state.on('change:settings', (newSettings) => {
        if (newSettings.dayPickerStyle !== currentStyle) {
            currentStyle = newSettings.dayPickerStyle || 'radial';
            render();
        }
    });

    render();
    return container;
}

export {};