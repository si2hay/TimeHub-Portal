// data-manager.js: Управление данными (расписание + замены + время)

import { ALL_SCHEDULES } from '../../data/schedule/index.js';
import { CONFIG } from './config.js';

// Вычисляем реальную дату для конкретного дня недели и недели семестра
function getDateForDay(week, day) {
    const start = new Date(CONFIG.SEMESTER_START_DATE);
    // Неделя 1, День 1 = старт. Неделя 2, День 1 = старт + 7 дней.
    const offsetDays = (week - 1) * 7 + (day - 1);
    const targetDate = new Date(start.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    
    // Форматируем в YYYY-MM-DD с учетом локального часового пояса
    const offset = targetDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(targetDate - offset)).toISOString().split('T')[0];
    return localISOTime;
}

export async function getLessonsForDay(week, day, group) {
    // 1. Получаем базовое расписание
    const groupData = ALL_SCHEDULES[group];
    if (!groupData) return null;

    const weekData = week === 1 ? groupData.week1 : groupData.week2;
    let lessons = JSON.parse(JSON.stringify(weekData[day] || []));

    // 2. Получаем замены для конкретной даты
    const targetDateStr = getDateForDay(week, day);
    let dayZamena = null;

    try {
        const url = new URL('../../data/substitutions/data.json', import.meta.url);
        url.searchParams.set('t', Date.now()); // Обход кэша
        const response = await fetch(url);
        
        if (response.ok) {
            const SUBSTITUTIONS = await response.json();
            
            if (SUBSTITUTIONS[targetDateStr] && SUBSTITUTIONS[targetDateStr][group]) {
                dayZamena = SUBSTITUTIONS[targetDateStr][group];
            }
        }
    } catch (e) {
        console.warn('Ошибка загрузки замен:', e);
    }

    // 3. Применяем замены, если они есть
    if (dayZamena) {
        for (const pairNum in dayZamena) {
            const pNum = parseInt(pairNum);
            const existingIndex = lessons.findIndex(l => l.pair === pNum);
            const newLesson = { ...dayZamena[pairNum], isSubstitution: true };
            
            if (existingIndex !== -1) {
                if (!newLesson.subject || newLesson.subject.trim() === '') {
                    lessons.splice(existingIndex, 1); // Отмена пары
                } else {
                    lessons[existingIndex] = { ...newLesson, pair: pNum };
                }
            } else {
                if (newLesson.subject && newLesson.subject.trim() !== '') {
                    lessons.push({ ...newLesson, pair: pNum });
                }
            }
        }
        lessons.sort((a, b) => a.pair - b.pair);
    }

    // 4. ПРИМЕНЯЕМ КАСТОМНОЕ ВРЕМЯ
    const customTimes = groupData.customTimes || [];
    lessons = lessons.map(lesson => {
        const custom = customTimes.find(t => 
            t[0] === week && t[1] === day && t[2] === lesson.pair
        );
        if (custom) return { ...lesson, start: custom[3], end: custom[4] };
        return lesson;
    });

    return lessons;
}