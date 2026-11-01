// ui/schedule.js: Отрисовка карточек расписания (Главная страница)

import { state } from '../state.js';
import { BELLS } from '../../../data/bells.js';
import { getLessonsForDay } from '../data-manager.js';
import { timeToMinutes } from '../utils.js';
import { vibrate } from '../haptics.js';

export function createSchedule() {
    const container = document.createElement('div');
    container.className = 'schedule-container';
    container.id = 'schedule-container';

    // ФУНКЦИЯ ГЕНЕРАЦИИ ICS (Календарь)
    function downloadICS(lesson, dateStr, startTime, endTime) {
        const [startH, startM] = startTime.split(':');
        const [endH, endM] = endTime.split(':');
        
        const dtStart = `${dateStr.replace(/-/g, '')}T${startH}${startM}00`;
        const dtEnd = `${dateStr.replace(/-/g, '')}T${endH}${endM}00`;

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//TimeHub-Portal//RU',
            'BEGIN:VEVENT',
            `SUMMARY:${lesson.subject}`,
            `LOCATION:${lesson.room}`,
            `DESCRIPTION:Преподаватель: ${lesson.teacher || 'Не указан'}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            'BEGIN:VALARM',
            'TRIGGER:-PT15M', 
            'ACTION:DISPLAY',
            'DESCRIPTION:Напоминание о паре',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `para_${lesson.pair}_${dateStr}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        vibrate('success');
    }

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
        const todayDate = new Date().toISOString().split('T')[0];

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
                <div class="lesson-info" style="position: relative;">
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-details">
                        <span class="lesson-room">📍 ${lesson.room}</span>
                        ${lesson.teacher ? `<span class="lesson-teacher">👤 ${lesson.teacher}</span>` : ''}
                    </div>
                    <!-- Кнопка Календаря -->
                    <button class="calendar-btn" title="Добавить в календарь">📅</button>
                </div>
            `;

            card.querySelector('.calendar-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                downloadICS(lesson, todayDate, actualStart, actualEnd);
            });

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