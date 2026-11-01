// ui/notes.js: Блок личных заметок + Чек-лист

export function createNotes() {
    const container = document.createElement('div');
    container.className = 'notes-widget glass-panel';

    container.innerHTML = `
        <div class="section-header">
            <h2>Заметки и Дела</h2>
            <span class="section-icon">✏️</span>
        </div>
        
        <div class="notes-grid">
            <!-- Левая колонка: Чек-лист -->
            <div class="checklist-container">
                <h3 style="font-size: 14px; margin-bottom: 10px; color: var(--text-muted);">Список дел</h3>
                <div class="checklist-input-row">
                    <input type="text" id="check-input" class="check-input" placeholder="Новая задача..." maxlength="50">
                    <button id="btn-add-check" class="check-add-btn">+</button>
                </div>
                <ul id="checklist" class="checklist"></ul>
            </div>

            <!-- Правая колонка: Текстовые заметки -->
            <div class="notes-text-container">
                <textarea id="notes-area" class="notes-textarea" placeholder="Введите текст в заметки..."></textarea>
                <div id="notes-status" class="notes-status"></div>
            </div>
        </div>
    `;

    // --- ЛОГИКА ЧЕК-ЛИСТА ---
    const checkInput = container.querySelector('#check-input');
    const addBtn = container.querySelector('#btn-add-check');
    const checklistUl = container.querySelector('#checklist');
    
    let tasks = JSON.parse(localStorage.getItem('timehub_checklist')) || [];

    function renderChecklist() {
        checklistUl.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `check-item ${task.done ? 'done' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${task.done ? 'checked' : ''} class="check-box">
                <span class="check-text">${task.text}</span>
                <button class="check-delete">✖</button>
            `;

            // Обработчик галочки
            li.querySelector('.check-box').addEventListener('change', (e) => {
                tasks[index].done = e.target.checked;
                saveTasks();
                renderChecklist();
            });

            // Обработчик удаления
            li.querySelector('.check-delete').addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderChecklist();
            });

            checklistUl.appendChild(li);
        });
    }

    function saveTasks() {
        localStorage.setItem('timehub_checklist', JSON.stringify(tasks));
    }

    function addTask() {
        const text = checkInput.value.trim();
        if (text) {
            // Защита от XSS (только буквы, цифры, пробелы)
            const cleanText = text.replace(/[^a-zA-Zа-яА-Я0-9\s.,!?\-]/g, '');
            if (cleanText) {
                tasks.push({ text: cleanText, done: false });
                saveTasks();
                renderChecklist();
                checkInput.value = '';
            }
        }
    }

    addBtn.addEventListener('click', addTask);
    checkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    renderChecklist(); // Первая отрисовка

    // --- ЛОГИКА ТЕКСТОВЫХ ЗАМЕТОК ---
    const textarea = container.querySelector('#notes-area');
    const status = container.querySelector('#notes-status');
    const savedNotes = localStorage.getItem('timehub_notes') || '';
    textarea.value = savedNotes;

    let saveTimeout;

    textarea.addEventListener('keydown', () => {
        textarea.classList.add('key-pressed');
        setTimeout(() => textarea.classList.remove('key-pressed'), 100);
    });

    textarea.addEventListener('input', (e) => {
        const originalValue = e.target.value;
        const cleanValue = originalValue.replace(/[^a-zA-Zа-яА-Я0-9\s.,!?\-]/g, '');
        if (originalValue !== cleanValue) e.target.value = cleanValue;

        status.textContent = 'Сохранение...';
        status.style.color = 'var(--text-muted)';
        status.classList.remove('status-show');

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('timehub_notes', e.target.value);
            status.textContent = 'Сохранено!';
            status.style.color = 'var(--accent-color)';
            status.classList.add('status-show');
            setTimeout(() => {
                if (status.textContent === 'Сохранено!') {
                    status.classList.remove('status-show');
                    status.textContent = '';
                }
            }, 2000);
        }, 500);
    });

    return container;
}

export {};