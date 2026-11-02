// data-manager.js: Управление данными (расписание + замены + время)

import { ALL_SCHEDULES } from '../../data/schedule/index.js';
import { CONFIG } from './config.js';

// Вычисляем текущую неделю (1 или 2)
function getCurrentWeek() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = CONFIG.SEMESTER_START_DATE;
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7) % 2;
    return weekIndex + 1;
}

// Текущий день недели (1-5, вс -> 1)
function getCurrentDay() {
    let d = new Date().getDay();
    return d === 0 ? 1 : d;
}

export async function getLessonsForDay(week, day, group) {
    // 1. Получаем базовое расписание
    const groupData = ALL_SCHEDULES[group];
    if (!groupData) return null;

    const weekData = week === 1 ? groupData.week1 : groupData.week2;
    let lessons = JSON.parse(JSON.stringify(weekData[day] || []));

    // 2. Проверяем, является ли выбранный день СЕГОДНЯШНИМ
    // Если мы смотрим на вторник, а сегодня понедельник — замены не применяем
    const isToday = (week === getCurrentWeek() && day === getCurrentDay());

    if (isToday) {
        let todayZamena = null;
        try {
            const url = new URL('../../data/substitutions/data.json', import.meta.url);
            url.searchParams.set('t', Date.now()); // Обход кэша
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

        // Применяем замены, если они есть
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
    }

    // 3. ПРИМЕНЯЕМ КАСТОМНОЕ ВРЕМЯ
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