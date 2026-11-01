// ui/radial-day-picker.js: Радиальное меню выбора дня

import { state } from '../state.js';

export function createRadialDayPicker() {
    const container = document.createElement('div');
    container.className = 'radial-menu-container';

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
    const currentDay = state.get('currentDay'); // 1-5

    // Кнопка-триггер
    const trigger = document.createElement('button');
    trigger.className = 'radial-trigger';
    trigger.innerHTML = '✚'; // Плюсик, который крутится в крестик
    trigger.setAttribute('aria-label', 'Выбрать день');

    // Контейнер для пунктов
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'radial-menu-items';

    // Генерируем кнопки дней
    days.forEach((day, index) => {
        const item = document.createElement('div');
        item.className = 'radial-item';
        item.textContent = day;
        // Задаем CSS-переменную для угла (0, 1, 2, 3, 4)
        item.style.setProperty('--i', index); 
        
        // Если это текущий день, делаем активным
        if (index + 1 === currentDay) {
            item.classList.add('active');
        }

        item.addEventListener('click', () => {
            // Обновляем стейт
            state.set('currentDay', index + 1);
            
            // Обновляем активный класс
            itemsContainer.querySelectorAll('.radial-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            // Закрываем меню
            container.classList.remove('open');
        });

        itemsContainer.appendChild(item);
    });

    // Логика открытия/закрытия
    trigger.addEventListener('click', () => {
        container.classList.toggle('open');
    });

    container.appendChild(trigger);
    container.appendChild(itemsContainer);

    return container;
}

export {};