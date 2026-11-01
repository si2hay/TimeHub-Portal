// ui/schedule.js: Отрисовка карточек расписания (Главная страница)

import { state } from '../state.js';
import { BELLS } from '../../../data/bells.js';
import { getLessonsForDay } from '../data-manager.js';
import { timeToMinutes } from '../utils.js';

export function createSchedule() {
    const container = document.createElement('div');
    container.className = 'schedule-container';
    container.id = 'schedule-container';

    async function render() {
        const week = state.get('currentWeek');
        const day = state.get('currentDay');
        const group = state.get('settings').group; 
        
        container.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">Загрузка расписания...</div>`;

        const lessons = await getLessonsForDay(week, day, group);
        
        if (lessons === null) {
            container.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">Расписание для группы ${group} пока не добавлено 😔</div>`;
            return;
        }

        const isSecondYear = group.startsWith('25');
        const bells = isSecondYear ? BELLS.course2plus : BELLS.course1;

        container.innerHTML = '';

        if (lessons.length === 0) {
            container.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">На этот день пар нет 🎉</div>`;
            return;
        }

        const now = new Date(); 
        const currentMins = now.getHours() * 60 + now.getMinutes();

        lessons.forEach(lesson => {
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
            card.className = `schedule-card glass-panel ${isNow ? 'current-lesson animate-pulse' : ''} ${lesson.isSubstitution ? 'is-substitution' : ''}`;
            
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
        });
    }

    state.on('change:currentDay', render);
    state.on('change:currentWeek', render);
    state.on('change:settings', render);
    state.on('change:debugDate', render); 

    render();

    return container;
}