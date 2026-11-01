// ui/reference.js: Справочник (библиотеки, консультации, калькулятор)

export function createReference() {
    const container = document.createElement('div');
    container.className = 'reference-widget glass-panel';
    
    container.innerHTML = `
        <div class="section-header">
            <h2>Справочник</h2>
            <span class="section-icon">📚</span>
        </div>
        
        <div class="accordion">
            <!-- Вкладка 1: Библиотеки -->
            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Библиотеки</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <a href="https://e.lanbook.com" target="_blank" class="ref-link">
                        <span class="link-icon">🌐</span> ЭБС Лань
                    </a>
                    <a href="https://academia-moscow.ru" target="_blank" class="ref-link">
                        <span class="link-icon">🌐</span> Академия-Москва
                    </a>
                </div>
            </div>

            <!-- Вкладка 2: Консультации -->
            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Консультации</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <div style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 10px;">
                        Здесь скоро появятся графики консультаций 📅
                    </div>
                </div>
            </div>

            <!-- Вкладка 3: Калькулятор оценок -->
            <div class="accordion-item">
                <button class="accordion-trigger">
                    <span>Калькулятор оценок</span>
                    <span class="accordion-arrow">▼</span>
                </button>
                <div class="accordion-content">
                    <div class="calc-container">
                        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Введи оценки через запятую (например: 5, 4, 3, 5)</p>
                        <input type="text" id="grades-input" class="settings-select" placeholder="5, 4, 5, 3...">
                        <button id="btn-calc-grades" class="theme-btn" style="width:100%; margin-top:10px; padding:10px; background:var(--accent-color); color:white;">Посчитать</button>
                        <div id="grades-result" class="calc-result"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Логика аккордеона
    const triggers = container.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            const content = item.querySelector('.accordion-content');
            
            container.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Логика калькулятора
    const calcBtn = container.querySelector('#btn-calc-grades');
    const gradesInput = container.querySelector('#grades-input');
    const gradesResult = container.querySelector('#grades-result');

    calcBtn.addEventListener('click', () => {
        const rawText = gradesInput.value;
        // Разделяем по запятой, пробелу или точке с запятой
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

        // Обновляем высоту аккордеона, чтобы текст не обрезался
        const content = calcBtn.closest('.accordion-content');
        if (content) content.style.maxHeight = content.scrollHeight + "px";
    });

    return container;
}

export {};