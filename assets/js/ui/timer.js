// ui/timer.js: Логика и отрисовка таймера пар

import { state } from '../state.js';
import { BELLS } from '../../../data/bells.js';
import { getLessonsForDay } from '../data-manager.js';
import { timeToMinutes, formatTimeLeft } from '../utils.js';

export function createTimer() {
    const widget = document.createElement('div');
    widget.className = 'timer-widget glass-panel';
    widget.id = 'timer-widget';

    let currentLessons = [];
    let timerInterval = null;
    let particleAnimId = null;

    widget.innerHTML = `
        <canvas id="timer-particles" class="timer-particles-canvas"></canvas>
        <div class="timer-content">
            <div class="timer-status" id="t-status"></div>
            <span class="timer-subject" id="t-subject"></span>
            <div class="timer-timeleft">
                <span class="time-label" id="t-time-label"></span>
                <span class="time-value" id="t-time-value"></span>
            </div>
            <div class="timer-progress-track">
                <div class="timer-progress-fill" id="t-progress"></div>
            </div>
            
            <!-- НОВЫЙ БЛОК: Подсказка и бейджик дня -->
            <div class="timer-bottom-row">
                <div class="timer-hint" id="t-hint">Нажми, чтобы раскрыть</div>
                <div class="timer-day-badge" id="t-day-badge">Пн</div>
            </div>
        </div>
    `;

    const tStatus = widget.querySelector('#t-status');
    const tSubject = widget.querySelector('#t-subject');
    const tTimeLabel = widget.querySelector('#t-time-label');
    const tTimeValue = widget.querySelector('#t-time-value');
    const tProgress = widget.querySelector('#t-progress');
    const tHint = widget.querySelector('#t-hint');
    const tDayBadge = widget.querySelector('#t-day-badge');
    const canvas = widget.querySelector('#timer-particles');
    const ctx = canvas.getContext('2d');

    // Обновление выбранного дня
    const updateSelectedDay = (dayNum) => {
        const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
        if (tDayBadge) tDayBadge.textContent = days[dayNum] || 'Пн';
    };

    updateSelectedDay(state.get('currentDay'));
    state.on('change:currentDay', updateSelectedDay);

    let localParticles = [];
    const LOCAL_PARTICLES_COUNT = 30;

    function initLocalParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        localParticles = Array.from({ length: LOCAL_PARTICLES_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            r: Math.random() * 2 + 1
        }));
    }

    function animateLocalParticles() {
        if (!widget.classList.contains('fullscreen')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const color = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#0062b1';

        localParticles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        particleAnimId = requestAnimationFrame(animateLocalParticles);
    }

    widget.addEventListener('click', () => {
        widget.classList.toggle('fullscreen');
        
        if (widget.classList.contains('fullscreen')) {
            document.body.style.overflow = 'hidden'; 
            tHint.textContent = 'Нажми, чтобы свернуть';
            initLocalParticles();
            animateLocalParticles();
        } else {
            document.body.style.overflow = ''; 
            tHint.textContent = 'Нажми, чтобы раскрыть';
            if (particleAnimId) {
                cancelAnimationFrame(particleAnimId);
                particleAnimId = null;
            }
        }
        update();
    });

    let lastLoadKey = '';
    let lastGroup = '';

    async function loadLessons() {
        const week = state.get('currentWeek');
        const day = state.get('currentDay');
        const group = state.get('settings').group;
        
        const key = `${week}-${day}-${group}`;
        if (key === lastLoadKey) return;
        
        lastLoadKey = key;
        lastGroup = group;

        const lessons = await getLessonsForDay(week, day, group);
        currentLessons = lessons || [];
        update();
    }

    function update() {
        const now = state.getNow();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        const course = state.get('settings').course || 1;
        const bells = course === 1 ? BELLS.course1 : BELLS.course2plus;

        const ordinals = ['первой', 'второй', 'третьей', 'четвертой', 'пятой', 'шестой', 'седьмой'];
        
        const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px; margin-bottom: 2px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

        let status = 'waiting';
        let text = '';
        let progress = 0;
        let timeLabelStr = '';
        let timeValueStr = '';
        let currentPairNum = null;

        const realDay = now.getDay(); 
        
        const todaySchedule = currentLessons.map(lesson => {
            const stdBell = bells.find(b => b.pair === lesson.pair);
            return {
                ...lesson,
                startTime: lesson.start || (stdBell ? stdBell.start : null),
                endTime: lesson.end || (stdBell ? stdBell.end : null)
            };
        }).filter(l => l.startTime && l.endTime);

        const firstPairStart = todaySchedule.length > 0 ? timeToMinutes(todaySchedule[0].startTime) : null;
        const lastPairEnd = todaySchedule.length > 0 ? timeToMinutes(todaySchedule[todaySchedule.length - 1].endTime) : null;

        if (todaySchedule.length === 0) {
            text = 'На сегодня пар нет 🎉';
        } else if (realDay === 0 || realDay === 6 || currentMins >= lastPairEnd) {
            let daysToAdd = realDay === 6 ? 2 : (realDay === 0 ? 1 : (realDay === 5 ? 3 : 1));
            const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, Math.floor(firstPairStart / 60), firstPairStart % 60);
            const diffMins = Math.floor((targetDate - now) / 60000);
            
            const firstPair = todaySchedule[0];
            const roomInfo = firstPair.room ? ` <span class="lesson-room">📍 ${firstPair.room}</span>` : '';
            text = `До занятий (${daysToAdd === 1 ? 'завтра' : 'в пн'}):<br><span class="timer-next-subject">${bookIcon} ${firstPair.subject}${roomInfo}</span>`;
            timeLabelStr = 'Начнется через:';
            timeValueStr = formatTimeLeft(diffMins);
        } else if (currentMins < firstPairStart) {
            const firstPair = todaySchedule[0];
            const roomInfo = firstPair.room ? ` <span class="lesson-room">📍 ${firstPair.room}</span>` : '';
            text = `До ${ordinals[0]} пары:<br><span class="timer-next-subject">${bookIcon} ${firstPair.subject}${roomInfo}</span>`;
            timeLabelStr = 'До начала:';
            timeValueStr = formatTimeLeft(firstPairStart - currentMins);
            
            const oneHourBefore = Math.max(0, firstPairStart - 60);
            progress = Math.max(0, Math.min(1, (currentMins - oneHourBefore) / (firstPairStart - oneHourBefore)));
        } else {
            for (let i = 0; i < todaySchedule.length; i++) {
                const pair = todaySchedule[i];
                const start = timeToMinutes(pair.startTime);
                const end = timeToMinutes(pair.endTime);
                const duration = end - start;

                if (duration <= 45) {
                    if (currentMins >= start && currentMins < end) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `Идет ${ordinals[pair.pair - 1]} пара`;
                        timeLabelStr = 'До конца:';
                        timeValueStr = formatTimeLeft(end - currentMins);
                        progress = (currentMins - start) / duration;
                        break;
                    }
                } else {
                    const half1End = start + 45; 
                    const half2Start = end - 45; 

                    if (currentMins >= start && currentMins < half1End) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `1-я часть ${ordinals[pair.pair - 1]} пары`;
                        timeLabelStr = 'До конца:';
                        timeValueStr = formatTimeLeft(half1End - currentMins);
                        progress = (currentMins - start) / 45;
                        break;
                    } else if (currentMins >= half1End && currentMins < half2Start) {
                        status = 'break'; currentPairNum = pair.pair;
                        text = `Перемена 🍵`;
                        timeLabelStr = 'До конца:';
                        timeValueStr = formatTimeLeft(half2Start - currentMins);
                        progress = (currentMins - half1End) / (half2Start - half1End);
                        break;
                    } else if (currentMins >= half2Start && currentMins < end) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `2-я часть ${ordinals[pair.pair - 1]} пары`;
                        timeLabelStr = 'До конца:';
                        timeValueStr = formatTimeLeft(end - currentMins);
                        progress = (currentMins - half2Start) / 45;
                        break;
                    }
                }

                if (currentMins >= end && i < todaySchedule.length - 1) {
                    const nextPair = todaySchedule[i+1];
                    const nextStart = timeToMinutes(nextPair.startTime);
                    if (currentMins < nextStart) {
                        status = 'waiting';
                        const roomInfo = nextPair.room ? ` <span class="lesson-room">📍 ${nextPair.room}</span>` : '';
                        text = `Перемена перед ${ordinals[nextPair.pair - 1]} парой:<br><span class="timer-next-subject">${bookIcon} ${nextPair.subject}${roomInfo}</span>`;
                        timeLabelStr = 'До начала:';
                        timeValueStr = formatTimeLeft(nextStart - currentMins);
                        progress = (currentMins - end) / (nextStart - end);
                        break;
                    }
                }
            }
        }

        let subjectHTML = '';
        if (currentPairNum !== null && currentLessons.length > 0) {
            const lesson = currentLessons.find(l => l.pair === currentPairNum);
            if (lesson) {
                const roomInfo = lesson.room ? ` <span class="lesson-room">📍 ${lesson.room}</span>` : '';
                subjectHTML = `${lesson.subject}${roomInfo}`;
            }
        }

        tStatus.innerHTML = text; 
        tStatus.className = `timer-status ${status}`;
        tSubject.innerHTML = subjectHTML;
        tTimeLabel.textContent = timeLabelStr;
        tTimeValue.textContent = timeValueStr;
        tProgress.style.width = `${progress * 100}%`;
    }

    state.on('change:currentDay', loadLessons);
    state.on('change:currentWeek', loadLessons);
    
    state.on('change:settings', (newSettings) => {
        if (newSettings && newSettings.group && newSettings.group !== lastGroup) {
            loadLessons();
        } else if (newSettings && newSettings.debugTime) {
            update(); 
        }
    });

    loadLessons();
    timerInterval = setInterval(update, 1000);

    return widget;
}