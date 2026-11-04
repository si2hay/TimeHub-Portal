// assets/js/ui/radial-day-picker.js: Меню выбора дня (7 стилей + Свайпы)

import { state } from '../state.js';

export function createRadialDayPicker() {
    const container = document.createElement('div');
    container.className = 'day-picker-wrapper';
    container.id = 'day-picker-wrapper';

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
    const fullDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
    
    let currentStyle = state.get('settings').dayPickerStyle || 'capsule';

    // Обновление активного состояния без перерисовки (для плавных анимаций)
    function updateActiveState(newDay) {
        if (currentStyle === 'radial') {
            const items = container.querySelectorAll('.radial-item');
            items.forEach((item, index) => {
                if (index + 1 === newDay) item.classList.add('active');
                else item.classList.remove('active');
            });
            const menu = container.querySelector('.radial-menu-container');
            if (menu) menu.classList.remove('open');
        } 
        else if (currentStyle === 'minimal') {
            const inputs = container.querySelectorAll('input[name="day-minimal"]');
            inputs.forEach(input => { input.checked = parseInt(input.value) === newDay; });
        }
        else if (currentStyle === 'capsule') {
            const items = container.querySelectorAll('.capsule-item');
            items.forEach((item, index) => {
                if (index + 1 === newDay) item.classList.add('active');
                else item.classList.remove('active');
            });
        }
        else if (currentStyle === 'segmented') {
            const items = container.querySelectorAll('.segmented-item');
            const glider = container.querySelector('.segmented-glider');
            items.forEach((item, index) => {
                if (index + 1 === newDay) item.classList.add('active');
                else item.classList.remove('active');
            });
            if (glider) glider.style.transform = `translateX(${(newDay - 1) * 100}%)`;
        }
        else if (currentStyle === 'swipe') {
            const dots = container.querySelectorAll('.swipe-dot');
            dots.forEach((dot, index) => {
                if (index + 1 === newDay) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }
        else if (currentStyle === 'vertical') {
            const items = container.querySelectorAll('.vertical-item');
            items.forEach((item, index) => {
                if (index + 1 === newDay) item.classList.add('active');
                else item.classList.remove('active');
            });
        }
        else if (currentStyle === 'led') {
            const dots = container.querySelectorAll('.led-dot');
            dots.forEach((dot, index) => {
                if (index + 1 === newDay) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }
    }

    function render() {
        container.className = `day-picker-wrapper style-${currentStyle}`;
        container.innerHTML = '';
        const currentDay = state.get('currentDay'); 

        // 1. РАДИАЛЬНОЕ МЕНЮ (ВЕЕР)
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
                if (index + 1 === currentDay) item.classList.add('active');
                item.addEventListener('click', () => state.set('currentDay', index + 1));
                itemsContainer.appendChild(item);
            });

            trigger.addEventListener('click', () => radialContainer.classList.toggle('open'));
            radialContainer.appendChild(trigger);
            radialContainer.appendChild(itemsContainer);
            container.appendChild(radialContainer);
        }

        // 2. МИНИМАЛИЗМ
        else if (currentStyle === 'minimal') {
            const minimal = document.createElement('div');
            minimal.className = 'minimal-tabs';
            let html = '';
            days.forEach((day, index) => {
                const val = index + 1;
                const isChecked = val === currentDay ? 'checked' : '';
                html += `<input type="radio" name="day-minimal" id="day-minimal-${val}" value="${val}" ${isChecked}><label for="day-minimal-${val}">${day}</label>`;
            });
            html += '<div class="minimal-glider"></div>';
            minimal.innerHTML = html;
            minimal.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => { if (e.target.checked) state.set('currentDay', parseInt(e.target.value)); });
            });
            container.appendChild(minimal);
        }

        // 3. КАПСУЛА
        else if (currentStyle === 'capsule') {
            const capsule = document.createElement('div');
            capsule.className = 'capsule-container';
            days.forEach((day, index) => {
                const val = index + 1;
                const item = document.createElement('div');
                item.className = `capsule-item ${val === currentDay ? 'active' : ''}`;
                item.innerHTML = `<span class="short-text">${day}</span><span class="full-text">${fullDays[index]}</span>`;
                item.addEventListener('click', () => state.set('currentDay', val));
                capsule.appendChild(item);
            });
            container.appendChild(capsule);
        }

        // 4. СЕГМЕНТЫ
        else if (currentStyle === 'segmented') {
            const seg = document.createElement('div');
            seg.className = 'segmented-tabs';
            let html = '';
            days.forEach((day, index) => {
                const val = index + 1;
                html += `<div class="segmented-item ${val === currentDay ? 'active' : ''}" data-day="${val}">${day}</div>`;
            });
            html += `<div class="segmented-glider" style="transform: translateX(${(currentDay - 1) * 100}%)"></div>`;
            seg.innerHTML = html;
            seg.querySelectorAll('.segmented-item').forEach(item => {
                item.addEventListener('click', () => state.set('currentDay', parseInt(item.dataset.day)));
            });
            container.appendChild(seg);
        }

        // 5. СВАЙП (ТОЛЬКО ТОЧКИ)
        else if (currentStyle === 'swipe') {
            const swipe = document.createElement('div');
            swipe.className = 'swipe-dots-container';
            days.forEach((_, index) => {
                const val = index + 1;
                const dot = document.createElement('div');
                dot.className = `swipe-dot ${val === currentDay ? 'active' : ''}`;
                dot.addEventListener('click', () => state.set('currentDay', val));
                swipe.appendChild(dot);
            });
            container.appendChild(swipe);
        }

        // 6. ВЕРТИКАЛЬНЫЙ ДОК (СБОКУ)
        else if (currentStyle === 'vertical') {
            const dock = document.createElement('div');
            dock.className = 'vertical-dock';
            days.forEach((day, index) => {
                const val = index + 1;
                const item = document.createElement('div');
                item.className = `vertical-item ${val === currentDay ? 'active' : ''}`;
                item.textContent = day;
                item.addEventListener('click', () => state.set('currentDay', val));
                dock.appendChild(item);
            });
            container.appendChild(dock);
        }

        // 7. СВЕТОДИОДЫ (LED)
        else if (currentStyle === 'led') {
            const led = document.createElement('div');
            led.className = 'led-tabs';
            days.forEach((_, index) => {
                const val = index + 1;
                const dot = document.createElement('div');
                dot.className = `led-dot ${val === currentDay ? 'active' : ''}`;
                dot.addEventListener('click', () => state.set('currentDay', val));
                led.appendChild(dot);
            });
            container.appendChild(led);
        }
    }

    // ==========================================
    // ОБРАБОТКА СВАЙПОВ (Для стиля "swipe")
    // ==========================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        if (currentStyle === 'swipe') {
            // Игнорируем свайпы по полям ввода, модалкам и самому меню
            if (e.target.closest('input, textarea, .group-dropdown, .modal-overlay, .day-picker-wrapper')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (currentStyle === 'swipe') {
            if (e.target.closest('input, textarea, .group-dropdown, .modal-overlay, .day-picker-wrapper')) return;
            
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Проверяем, что свайп был горизонтальным (а не скроллом страницы)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                const currentDay = state.get('currentDay');
                
                if (deltaX < 0) { // Свайп влево -> следующий день
                    if (currentDay < 5) state.set('currentDay', currentDay + 1);
                } else { // Свайп вправо -> предыдущий день
                    if (currentDay > 1) state.set('currentDay', currentDay - 1);
                }
            }
        }
    }, { passive: true });

    // ==========================================
    // ПОДПИСКИ НА СОБЫТИЯ
    // ==========================================
    state.on('change:currentDay', (newDay) => {
        updateActiveState(newDay);
    });
    
    state.on('change:settings', (newSettings) => {
        if (newSettings.dayPickerStyle !== currentStyle) {
            currentStyle = newSettings.dayPickerStyle || 'capsule';
            render();
        }
    });

    render();
    return container;
}

export {};