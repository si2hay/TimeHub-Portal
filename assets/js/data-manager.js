// data-manager.js: Управление данными (расписание + замены + время)

import { ALL_SCHEDULES } from '../../data/schedule/index.js';
import { SUBSTITUTIONS } from '../../data/substitutions/index.js';

export async function getLessonsForDay(week, day, group) {
    // 1. Получаем базовое расписание
    const groupData = ALL_SCHEDULES[group];
    if (!groupData) return null;

    const weekData = week === 1 ? groupData.week1 : groupData.week2;
    let lessons = JSON.parse(JSON.stringify(weekData[day] || []));

    // 2. Проверяем наличие замен на сегодня
    const today = new Date(); 
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];

    const todayZamena = SUBSTITUTIONS[localISOTime];

    if (todayZamena && todayZamena[group]) {
        const groupZamena = todayZamena[group];
        
        for (const pairNum in groupZamena) {
            const pNum = parseInt(pairNum);
            const existingIndex = lessons.findIndex(l => l.pair === pNum);
            const newLesson = { ...groupZamena[pairNum], isSubstitution: true };
            
            if (existingIndex !== -1) {
                lessons[existingIndex] = newLesson;
            } else {
                lessons.push(newLesson);
            }
        }
        lessons.sort((a, b) => a.pair - b.pair);
    }

    // 3. ПРИМЕНЯЕМ КАСТОМНОЕ ВРЕМЯ
    const customTimes = groupData.customTimes || [];
    
    lessons = lessons.map(lesson => {
        // Ищем в массиве совпадение по неделе, дню и номеру пары
        // Структура: [week, day, pair, start, end]
        const custom = customTimes.find(t => 
            t[0] === week && t[1] === day && t[2] === lesson.pair
        );
        
        if (custom) {
            // Если нашли, перезаписываем время в объекте пары
            return { ...lesson, start: custom[3], end: custom[4] };
        }
        return lesson;
    });

    return lessons;
}