// data-manager.js: Управление данными (расписание + замены + время)

import { ALL_SCHEDULES } from '../../data/schedule/index.js';

export async function getLessonsForDay(week, day, group) {
    // 1. Получаем базовое расписание
    const groupData = ALL_SCHEDULES[group];
    if (!groupData) return null;

    const weekData = week === 1 ? groupData.week1 : groupData.week2;
    let lessons = JSON.parse(JSON.stringify(weekData[day] || []));

    // 2. Загружаем замены из JSON
    let todayZamena = null;
    try {
        const url = new URL('../../data/substitutions/data.json', import.meta.url);
        url.searchParams.set('t', Date.now()); // Обход кэша браузера
        const response = await fetch(url);
        
        if (response.ok) {
            const SUBSTITUTIONS = await response.json();
            
            const today = new Date(); 
            const offset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];

            if (SUBSTITUTIONS[localISOTime] && SUBSTITUTIONS[localISOTime][group]) {
                todayZamena = SUBSTITUTIONS[localISOTime][group];
            }
        }
    } catch (e) {
        console.warn('Ошибка загрузки замен:', e);
    }

    // 3. Применяем замены
    if (todayZamena) {
        for (const pairNum in todayZamena) {
            const pNum = parseInt(pairNum);
            const existingIndex = lessons.findIndex(l => l.pair === pNum);
            const newLesson = { ...todayZamena[pairNum], isSubstitution: true };
            
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