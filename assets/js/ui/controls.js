// ui/controls.js: Панель управления (выбор недели и группы)

import { state } from '../state.js';
import { ALL_SCHEDULES } from '../../../data/schedule/index.js'; // Берем из сборщика
import { createWeather } from './weather.js';

export function createControls() {
    const panel = document.createElement('div');
    panel.className = 'controls-panel glass-panel';

    const settings = state.get('settings');
    let currentWeek = state.get('currentWeek');
    const currentGroup = settings.group;
    const realWeek = state.determineWeek(); 

    // Берем ключи (названия групп) из объединенного объекта
    const availableGroups = Object.keys(ALL_SCHEDULES).sort();

    panel.innerHTML = `
        <div class="week-control">
            <button id="btn-prev-week" class="arrow-btn">◀</button>
            <span id="week-label" class="week-label"></span>
            <button id="btn-next-week" class="arrow-btn">▶</button>
        </div>
        <div class="middle-row">
            <div id="weather-container"></div>
            <div class="group-control">
                <div id="group-trigger" class="group-trigger">
                    ${currentGroup} <span class="arrow-down">▼</span>
                </div>
                <div id="group-dropdown" class="group-dropdown">
                    <ul class="dropdown-list">
                        ${availableGroups.map((g, index) => `
                            <li class="group-option" data-group="${g}" style="--i: ${index}">
                                ${g}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    // --- Логика переключения недель ---
    const btnPrev = panel.querySelector('#btn-prev-week');
    const btnNext = panel.querySelector('#btn-next-week');
    const weekLabel = panel.querySelector('#week-label');

    const updateWeekUI = (newWeek) => {
        currentWeek = newWeek;
        const isActual = currentWeek === realWeek;
        
        const hint = isActual ? '<span class="badge-actual">(тек.)</span>' : '<span class="badge-return" title="Вернуться на текущую">↩</span>';
        weekLabel.innerHTML = `${currentWeek} неделя ${hint}`;
        weekLabel.className = `week-label ${isActual ? 'active-week' : 'inactive-week'}`;
        
        state.set('currentWeek', currentWeek);
    };

    updateWeekUI(currentWeek);

    btnPrev.addEventListener('click', () => updateWeekUI(currentWeek === 1 ? 2 : 1));
    btnNext.addEventListener('click', () => updateWeekUI(currentWeek === 1 ? 2 : 1));

    weekLabel.addEventListener('click', () => {
        if (currentWeek !== realWeek) {
            updateWeekUI(realWeek);
        }
    });

    // --- Логика выбора группы ---
    const groupTrigger = panel.querySelector('#group-trigger');
    const groupDropdown = panel.querySelector('#group-dropdown');
    const arrow = groupTrigger.querySelector('.arrow-down');

    groupTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        groupDropdown.classList.toggle('open');
        arrow.classList.toggle('rotate');
    });

    groupDropdown.querySelectorAll('.group-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const newGroup = e.target.dataset.group;
            groupTrigger.innerHTML = `${newGroup} <span class="arrow-down">▼</span>`;
            
            groupDropdown.classList.remove('open');
            groupTrigger.querySelector('.arrow-down').classList.remove('rotate');
            
            const newSettings = { ...state.get('settings'), group: newGroup };
            state.set('settings', newSettings);
        });
    });

    document.addEventListener('click', (e) => {
        if (!groupTrigger.contains(e.target) && !groupDropdown.contains(e.target)) {
            groupDropdown.classList.remove('open');
            const currentArrow = groupTrigger.querySelector('.arrow-down');
            if (currentArrow) currentArrow.classList.remove('rotate');
        }
    });

    // --- Вставляем погоду ---
    const weatherContainer = panel.querySelector('#weather-container');
    const weatherWidget = createWeather();
    
    if (weatherWidget) {
        weatherContainer.appendChild(weatherWidget);
    }

    return panel;
}