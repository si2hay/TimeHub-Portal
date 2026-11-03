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
            <div class="timer-timeleft" id="t-timeleft"></div>
            <div class="timer-progress-track">
                <div class="timer-progress-fill" id="t-progress"></div>
            </div>
            <div class="timer-hint" id="t-hint">Нажми, чтобы раскрыть</div>
        </div>
    `;

    const tStatus = widget.querySelector('#t-status');
    const tSubject = widget.querySelector('#t-subject');
    const tTimeLeft = widget.querySelector('#t-timeleft');
    const tProgress = widget.querySelector('#t-progress');
    const tHint = widget.querySelector('#t-hint');
    const canvas = widget.querySelector('#timer-particles');
    const ctx = canvas.getContext('2d');

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
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        const course = state.get('settings').course || 1;
        const bells = course === 1 ? BELLS.course1 : BELLS.course2plus;

        let status = 'waiting';
        let text = '';
        let progress = 0;
        let timeLeftStr = '';
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
            text = `До 1-й пары (${daysToAdd === 1 ? 'завтра' : 'в пн'})`;
            timeLeftStr = formatTimeLeft(diffMins);
        } else if (currentMins < firstPairStart) {
            text = 'До 1-й пары';
            timeLeftStr = formatTimeLeft(firstPairStart - currentMins);
        } else {
            for (let i = 0; i < todaySchedule.length; i++) {
                const pair = todaySchedule[i];
                const start = timeToMinutes(pair.startTime);
                const end = timeToMinutes(pair.endTime);
                const duration = end - start;

                if (duration <= 45) {
                    if (currentMins >= start && currentMins < end) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `Идет пара ${pair.pair}`;
                        timeLeftStr = `До конца: ${formatTimeLeft(end - currentMins)}`;
                        progress = (currentMins - start) / duration;
                        break;
                    }
                } else {
                    const half1End = start + 45; 
                    const half2Start = end - 45; 

                    if (currentMins >= start && currentMins < half1End) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `Идет 1-я часть пары ${pair.pair}`;
                        timeLeftStr = `До конца: ${formatTimeLeft(half1End - currentMins)}`;
                        progress = (currentMins - start) / 45;
                        break;
                    } else if (currentMins >= half1End && currentMins < half2Start) {
                        status = 'break'; currentPairNum = pair.pair;
                        text = `Перемена 🍵`;
                        timeLeftStr = `До конца: ${formatTimeLeft(half2Start - currentMins)}`;
                        progress = (currentMins - half1End) / (half2Start - half1End);
                        break;
                    } else if (currentMins >= half2Start && currentMins < end) {
                        status = 'lesson'; currentPairNum = pair.pair;
                        text = `Идет 2-я часть пары ${pair.pair}`;
                        timeLeftStr = `До конца: ${formatTimeLeft(end - currentMins)}`;
                        progress = (currentMins - half2Start) / 45;
                        break;
                    }
                }

                // Перемена между парами
                if (currentMins >= end && i < todaySchedule.length - 1) {
                    const nextPair = todaySchedule[i+1];
                    const nextStart = timeToMinutes(nextPair.startTime);
                    if (currentMins < nextStart) {
                        status = 'waiting';
                        const roomInfo = nextPair.room ? `, каб. ${nextPair.room}` : '';
                        text = `Перемена до ${nextPair.pair}-й пары:<br><span class="timer-next-subject">📖 ${nextPair.subject}${roomInfo}</span>`;
                        timeLeftStr = `До начала: ${formatTimeLeft(nextStart - currentMins)}`;
                        progress = (currentMins - end) / (nextStart - end);
                        break;
                    }
                }
            }
        }

        let subjectName = '';
        if (currentPairNum !== null && currentLessons.length > 0) {
            const lesson = currentLessons.find(l => l.pair === currentPairNum);
            if (lesson) subjectName = lesson.subject;
        }

        tStatus.innerHTML = text; 
        tStatus.className = `timer-status ${status}`;
        tSubject.textContent = subjectName;
        tTimeLeft.textContent = timeLeftStr;
        tProgress.style.width = `${progress * 100}%`;
    }

    state.on('change:currentDay', loadLessons);
    state.on('change:currentWeek', loadLessons);
    
    state.on('change:settings', (newSettings) => {
        if (newSettings && newSettings.group && newSettings.group !== lastGroup) {
            loadLessons();
        }
    });

    loadLessons();
    timerInterval = setInterval(update, 1000);

    return widget;
}