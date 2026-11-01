// ui/full-schedule.js: Просмотр расписания на всю неделю

import { state } from '../state.js';
import { getLessonsForDay } from '../data-manager.js';
import { BELLS } from '../../../data/bells.js';

export async function openFullSchedule() {
    if (document.getElementById('full-schedule-modal')) return;

    const week = state.get('currentWeek');
    const group = state.get('settings').group;
    const course = state.get('settings').course || 1;
    const bells = course === 1 ? BELLS.course1 : BELLS.course2plus;
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

    const modal = document.createElement('div');
    modal.id = 'full-schedule-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content glass-panel" style="max-height: 90vh; display: flex; flex-direction: column; padding: 16px;">
            <div class="modal-header" style="margin-bottom: 10px; flex-shrink: 0;">
                <h2>Расписание: ${group}</h2>
                <button id="btn-close-full-schedule" class="icon-btn">✖</button>
            </div>
            <div id="full-schedule-content" style="overflow-y: auto; flex-grow: 1; padding-right: 5px;">
                <div style="text-align: center; padding: 20px;">Загрузка...</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Закрытие
    const closeBtn = modal.querySelector('#btn-close-full-schedule');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Загрузка и отрисовка
    const contentDiv = modal.querySelector('#full-schedule-content');
    contentDiv.innerHTML = ''; 

    for (let i = 1; i <= 5; i++) {
        const dayName = days[i - 1];
        const lessons = await getLessonsForDay(week, i, group);

        const dayBlock = document.createElement('div');
        dayBlock.className = 'full-day-block';
        
        dayBlock.innerHTML = `<h3 class="full-day-title">${dayName}</h3>`;

        if (!lessons || lessons.length === 0) {
            dayBlock.innerHTML += `<div style="color: var(--text-muted); font-size: 13px; padding: 10px; margin-bottom: 15px;">Нет пар 🎉</div>`;
        } else {
            const list = document.createElement('div');
            list.className = 'schedule-container';
            list.style.marginBottom = '20px';

            lessons.forEach(lesson => {
                const bell = bells.find(b => b.pair === lesson.pair);
                if (!bell) return;

                const card = document.createElement('div');
                card.className = `schedule-card glass-panel ${lesson.isSubstitution ? 'is-substitution' : ''}`;
                card.style.padding = '8px'; 
                card.style.marginBottom = '8px';

                const badge = lesson.isSubstitution ? `<div class="badge-substitution">Замена</div>` : '';

                card.innerHTML = `
                    ${badge}
                    <div class="lesson-time" style="min-width: 70px; padding: 8px;">
                        <div class="lesson-num" style="font-size: 18px;">${lesson.pair}</div>
                        <div class="lesson-clock" style="font-size: 10px;">
                            <span>${bell.start}</span>
                            <span>-</span>
                            <span>${bell.end}</span>
                        </div>
                    </div>
                    <div class="lesson-info" style="padding: 8px 12px;">
                        <div class="lesson-subject" style="font-size: 14px;">${lesson.subject}</div>
                        <div class="lesson-details" style="font-size: 11px;">
                            <span class="lesson-room">📍 ${lesson.room}</span>
                            ${lesson.teacher ? `<span class="lesson-teacher">👤 ${lesson.teacher}</span>` : ''}
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
            dayBlock.appendChild(list);
        }
        contentDiv.appendChild(dayBlock);
    }
}

export {};