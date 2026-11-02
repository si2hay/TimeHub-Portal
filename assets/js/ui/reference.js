// ui/reference.js: Справочник (библиотеки, консультации, калькулятор)

// Импортируем консультации прямо из JS-файла
import { CONSULTATIONS } from '../../../data/consultations.js';

export function createReference() {
    const container = document.createElement('div');
    container.className = 'reference-widget glass-panel';
    
    container.innerHTML = `
        <div class="section-header">
            <h2>Справочник</h2>
            <span class="section-icon">📚</span>
        </div>
        
        <div class="accordion">
            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Библиотеки</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <div class="accordion-inner">
                        <a href="https://e.lanbook.com" target="_blank" class="ref-link">
                            <span class="link-icon">🌐</span> ЭБС Лань
                        </a>
                        <a href="https://academia-moscow.ru" target="_blank" class="ref-link">
                            <span class="link-icon">🌐</span> Академия-Москва
                        </a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Консультации</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <div class="accordion-inner" id="consultations-list">
                        <!-- Сюда вставится список -->
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Калькулятор оценок</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <div class="accordion-inner">
                        <div class="calc-container">
                            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Введи оценки через запятую (например: 5, 4, 3, 5)</p>
                            <input type="text" id="grades-input" class="settings-select" placeholder="5, 4, 5, 3...">
                            <button id="btn-calc-grades" class="theme-btn" style="width:100%; margin-top:10px; padding:10px; background:var(--accent-color); color:white;">Посчитать</button>
                            <div id="grades-result" class="calc-result"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const triggers = container.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            container.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // --- ОТРИСОВКА КОНСУЛЬТАЦИЙ ---
    function renderConsultations() {
        const listContainer = container.querySelector('#consultations-list');
        
        if (!CONSULTATIONS || CONSULTATIONS.length === 0) {
            listContainer.innerHTML = `
                <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 15px;">
                    График консультаций пока не добавлен.<br>
                    <a href="./builder.html" target="_blank" style="color: var(--accent-color); text-decoration: underline; margin-top: 5px; display: inline-block;">Добавить в Конструкторе</a>
                </div>
            `;
            return;
        }

        const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        
        // Сортируем по дню, затем по номеру пары
        const sortedData = [...CONSULTATIONS].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.afterPair - b.afterPair;
        });

        let html = '';
        sortedData.forEach(c => {
            html += `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 14px; font-weight: bold; color: var(--text-main); margin-bottom: 2px;">${c.subject}</div>
                    <div style="font-size: 13px; color: var(--accent-color); margin-bottom: 6px;">${c.teacher}</div>
                    <div style="display: flex; gap: 10px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap;">
                        <span>📅 ${days[c.day]}</span>
                        <span>🕒 После ${c.afterPair}-й пары</span>
                        <span>📍 ${c.room}</span>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    }
    
    renderConsultations();

    // --- КАЛЬКУЛЯТОР ---
    const calcBtn = container.querySelector('#btn-calc-grades');
    const gradesInput = container.querySelector('#grades-input');
    const gradesResult = container.querySelector('#grades-result');

    calcBtn.addEventListener('click', () => {
        const rawText = gradesInput.value;
        const parts = rawText.split(/[,;\s]+/).filter(Boolean);
        
        let sum = 0;
        let count = 0;

        parts.forEach(p => {
            const grade = parseInt(p, 10);
            if (grade >= 2 && grade <= 5) {
                sum += grade;
                count++;
            }
        });

        if (count === 0) {
            gradesResult.textContent = "Введи хотя бы одну оценку (2-5)!";
            gradesResult.style.color = "#ef4444";
            return;
        }

        const average = (sum / count).toFixed(2);
        let comment = "";
        if (average >= 4.5) comment = "Отличник! 🎉";
        else if (average >= 3.5) comment = "Хорошист! 👍";
        else if (average >= 2.5) comment = "Троечник... 😅";
        else comment = "Надо подтянуть... 😬";

        gradesResult.innerHTML = `Средний балл: <strong>${average}</strong><br><span style="font-size: 12px; font-weight: normal;">${comment}</span>`;
        gradesResult.style.color = "var(--accent-color)";
    });

    return container;
}