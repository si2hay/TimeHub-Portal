// ui/radial-day-picker.js: Меню выбора дня (Круглое и Минимализм)

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

        // === ВАРИАНТ 2: МИНИМАЛИЗМ (с плавным ползунком) ===
        else if (currentStyle === 'minimal') {
            const minimal = document.createElement('div');
            minimal.className = 'minimal-tabs';
            
            let html = '';
            days.forEach((day, index) => {
                const val = index + 1;
                const isChecked = val === currentDay ? 'checked' : '';
                html += `
                    <input type="radio" name="day-minimal" id="day-minimal-${val}" value="${val}" ${isChecked}>
                    <label for="day-minimal-${val}">${day}</label>
                `;
            });
            // Добавляем ползунок в конец, чтобы CSS-правило ~ работало
            html += '<div class="minimal-glider"></div>';
            
            minimal.innerHTML = html;

            minimal.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    if (e.target.checked) state.set('currentDay', parseInt(e.target.value));
                });
            });
            container.appendChild(minimal);
        }
    }

    // ВАЖНО: Не вызываем render() при смене дня, чтобы не ломать анимацию ползунка!
    state.on('change:currentDay', (newDay) => {
        if (currentStyle === 'radial') {
            // Для радиального просто обновляем активный класс
            const items = container.querySelectorAll('.radial-item');
            items.forEach((item, index) => {
                if (index + 1 === newDay) item.classList.add('active');
                else item.classList.remove('active');
            });
            // Закрываем меню, если оно было открыто
            const menu = container.querySelector('.radial-menu-container');
            if (menu) menu.classList.remove('open');
            
        } else if (currentStyle === 'minimal') {
            // Для минимализма просто переключаем radio-кнопки
            const inputs = container.querySelectorAll('input[name="day-minimal"]');
            inputs.forEach(input => {
                input.checked = parseInt(input.value) === newDay;
            });
        }
    });
    
    // А вот если пользователь меняет сам стиль в настройках — тогда перерисовываем
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