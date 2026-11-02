// ui/schedule.js: Отрисовка карточек расписания (Главная страница)

import { state } from '../state.js';
import { BELLS } from '../../../data/bells.js';
import { getLessonsForDay } from '../data-manager.js';
import { timeToMinutes } from '../utils.js';
import { renderScheduleSkeleton } from './skeleton.js';

export function createSchedule() {
    const container = document.createElement('div');
    container.className = 'schedule-container';
    container.id = 'schedule-container';

    let lastWeek = -1;
    let lastDay = -1;
    let lastGroup = '';
    let isRendering = false;

    async function render() {
        if (isRendering) return;
        
        const week = state.get('currentWeek');
        const day = state.get('currentDay');
        const group = state.get('settings').group; 
        const animType = state.get('settings').dayChangeAnimation || 'slide-up'; 

        // Если ничего не изменилось — вообще не трогаем DOM!
        if (week === lastWeek && day === lastDay && group === lastGroup && container.children.length > 0) {
            updateHighlightOnly(week, day, group);
            return;
        }

        isRendering = true;
        
        // Показываем скелетоны ТОЛЬКО при первой загрузке страницы
        const isFirstLoad = container.children.length === 0;
        if (isFirstLoad) {
            container.innerHTML = renderScheduleSkeleton();
        }

        const lessons = await getLessonsForDay(week, day, group);
        
        // ФИКСАЦИЯ ВЫСОТЫ: чтобы страница не прыгала, когда скелетоны сменятся карточками
        const prevHeight = container.offsetHeight;
        if (prevHeight > 0 && !isFirstLoad) {
            container.style.minHeight = `${prevHeight}px`;
        }

        if (lessons === null) {
            container.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">Расписание для группы ${group} пока не добавлено 😔</div>`;
            lastWeek = week; lastDay = day; lastGroup = group;
            isRendering = false;
            setTimeout(() => { container.style.minHeight = ''; }, 100);
            return;
        }

        const isSecondYear = group.startsWith('25');
        const bells = isSecondYear ? BELLS.course2plus : BELLS.course1;

        container.innerHTML = '';

        if (lessons.length === 0) {
            container.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">На этот день пар нет 🎉</div>`;
            lastWeek = week; lastDay = day; lastGroup = group;
            isRendering = false;
            setTimeout(() => { container.style.minHeight = ''; }, 100);
            return;
        }

        const now = new Date(); 
        const currentMins = now.getHours() * 60 + now.getMinutes();

        lessons.forEach((lesson, index) => {
            const standardBell = bells.find(b => b.pair === lesson.pair);
            const actualStart = lesson.start || (standardBell ? standardBell.start : null);
            const actualEnd = lesson.end || (standardBell ? standardBell.end : null);

            if (!actualStart || !actualEnd) return;

            const startMins = timeToMinutes(actualStart);
            const endMins = timeToMinutes(actualEnd);
            
            const isNow = (week === state.get('currentWeek') && 
                           day === state.get('currentDay') && 
                           currentMins >= startMins && currentMins <= endMins);

            const card = document.createElement('div');
            card.className = `schedule-card glass-panel schedule-card-anim anim-${animType} ${isNow ? 'current-lesson animate-pulse' : ''} ${lesson.isSubstitution ? 'is-substitution' : ''}`;
            
            // Оставляем красивую задержку, чтобы они выезжали по очереди
            card.style.animationDelay = `${index * 0.05}s`; 
            
            card.dataset.pair = lesson.pair;
            card.dataset.start = startMins;
            card.dataset.end = endMins;
            
            const badge = lesson.isSubstitution ? `<div class="badge-substitution">Замена</div>` : '';

            card.innerHTML = `
                ${badge}
                <div class="lesson-time">
                    <div class="lesson-num">${lesson.pair}</div>
                    <div class="lesson-clock">
                        <span>${actualStart}</span>
                        <span class="time-dash">-</span>
                        <span>${actualEnd}</span>
                    </div>
                </div>
                <div class="lesson-info">
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-details">
                        <span class="lesson-room">📍 ${lesson.room}</span>
                        ${lesson.teacher ? `<span class="lesson-teacher">👤 ${lesson.teacher}</span>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);

            // Убираем класс анимации после её завершения, чтобы не было багов
            setTimeout(() => {
                card.classList.remove('schedule-card-anim');
                card.classList.remove(`anim-${animType}`);
            }, 800);
        });

        lastWeek = week;
        lastDay = day;
        lastGroup = group;
        isRendering = false;

        // Снимаем фиксацию высоты после того, как анимация завершится
        setTimeout(() => {
            container.style.minHeight = '';
        }, 600);
    }

    // Обновляет ТОЛЬКО подсветку (рамку), не трогая DOM
    function updateHighlightOnly(week, day, group) {
        const now = new Date(); 
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        const cards = container.querySelectorAll('.schedule-card');
        cards.forEach(card => {
            const start = parseInt(card.dataset.start);
            const end = parseInt(card.dataset.end);
            if (isNaN(start) || isNaN(end)) return;

            const isNow = (week === state.get('currentWeek') && 
                           day === state.get('currentDay') && 
                           currentMins >= start && currentMins <= end);

            if (isNow && !card.classList.contains('current-lesson')) {
                card.classList.add('current-lesson', 'animate-pulse');
            } else if (!isNow && card.classList.contains('current-lesson')) {
                card.classList.remove('current-lesson', 'animate-pulse');
            }
        });
    }

    state.on('change:currentDay', render);
    state.on('change:currentWeek', render);
    
    state.on('change:settings', (newSettings) => {
        if (newSettings && newSettings.group && newSettings.group !== lastGroup) {
            render();
        }
    });

    // Обновляем подсветку раз в 10 секунд
    setInterval(() => {
        if (lastWeek !== -1) {
            updateHighlightOnly(lastWeek, lastDay, lastGroup);
        }
    }, 10000); 

    render();

    return container;
}