// assets/js/builder.js: Логика Конструктора расписания

import { ALL_TEACHERS, ALL_ROOMS, ALL_SUBJECTS, DICTIONARY } from '../../data/dictionary.js';

let state = {
    groupName: "",
    week: "1",
    day: "1",
    schedule: {
        "1": { "1": [], "2": [], "3": [], "4": [], "5": [] },
        "2": { "1": [], "2": [], "3": [], "4": [], "5": [] }
    }
};

const saved = localStorage.getItem('timehub_builder_state');
if (saved) {
    try { state = JSON.parse(saved); } catch (e) {}
}

const groupInput = document.getElementById('group-name');
const lessonsContainer = document.getElementById('lessons-container');
const btnAddLesson = document.getElementById('btn-add-lesson');
const btnGenerate = document.getElementById('btn-generate');
const codeOutput = document.getElementById('code-output');
const modalCode = document.getElementById('modal-code');

function sanitizeInput(text, allowPunct = true) {
    if (!text) return "";
    const regex = allowPunct ? /[^a-zA-Zа-яА-Я0-9\s.,!?\-/()]/g : /[^a-zA-Zа-яА-Я0-9\s\-]/g;
    return text.replace(regex, '');
}

// ФУНКЦИЯ ТРАНСЛИТЕРАЦИИ (Русские буквы -> Английские)
function transliterate(word) {
    const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya'
    };
    return word.split('').map(char => map[char] || char).join('');
}

groupInput.value = state.groupName;

function createDatalists() {
    const datalists = [
        { id: 'list-subjects', options: ALL_SUBJECTS },
        { id: 'list-teachers', options: ALL_TEACHERS },
        { id: 'list-rooms', options: ALL_ROOMS }
    ];

    datalists.forEach(list => {
        let dl = document.getElementById(list.id);
        if (!dl) {
            dl = document.createElement('datalist');
            dl.id = list.id;
            document.body.appendChild(dl);
        }
        dl.innerHTML = list.options.map(opt => `<option value="${opt}">`).join('');
    });
}
createDatalists();

function renderLessons() {
    lessonsContainer.innerHTML = '';
    const currentLessons = state.schedule[state.week][state.day] || [];

    if (currentLessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px; border: 2px dashed var(--border-color); border-radius: 8px;">
                На этот день пар пока нет.
            </div>
        `;
        return;
    }

    currentLessons.sort((a, b) => (a.pair || 0) - (b.pair || 0));

    currentLessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-edit-card';
        
        // --- ВЕРХНЯЯ ПАНЕЛЬ ---
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';

        const numBadge = document.createElement('input');
        numBadge.type = 'text'; 
        numBadge.inputMode = 'numeric';
        numBadge.maxLength = 1; 
        numBadge.className = 'pair-num-input';
        numBadge.value = lesson.pair || index + 1;
        numBadge.title = "Номер пары (1-7)";
        
        numBadge.addEventListener('focus', (e) => e.target.select());

        numBadge.addEventListener('change', (e) => {
            let newVal = parseInt(e.target.value);
            
            if (isNaN(newVal) || newVal < 1 || newVal > 7) {
                e.target.value = lesson.pair || index + 1;
                return;
            }

            const isDuplicate = currentLessons.some((l, i) => i !== index && l.pair === newVal);
            
            if (isDuplicate) {
                let freeNum = 1;
                while (currentLessons.some(l => l.pair === freeNum)) {
                    freeNum++;
                }
                newVal = freeNum;
            }

            lesson.pair = newVal;
            e.target.value = newVal;
            saveState();
            renderLessons(); 
        });

        numBadge.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        cardHeader.appendChild(numBadge);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = "Удалить пару";
        deleteBtn.addEventListener('click', () => {
            currentLessons.splice(index, 1);
            saveState();
            renderLessons();
        });
        cardHeader.appendChild(deleteBtn);

        card.appendChild(cardHeader);

        // --- ПОЛЯ ВВОДА ---
        const fieldsDiv = document.createElement('div');
        fieldsDiv.className = 'lesson-fields';

        const createField = (labelText, placeholder, value, datalistId, onChange) => {
            const group = document.createElement('div');
            group.className = 'input-group';
            
            const label = document.createElement('label');
            if (labelText === 'КАБИНЕТ' || labelText === 'ПРЕПОДАВАТЕЛЬ') {
                label.innerHTML = `${labelText} <span style="text-transform: none; font-size: 10px; opacity: 0.6; letter-spacing: 0;">(можно через /)</span>`;
            } else {
                label.textContent = labelText;
            }
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'builder-input';
            input.placeholder = placeholder;
            input.setAttribute('list', datalistId);
            input.value = value || '';
            input.addEventListener('input', onChange);
            
            group.appendChild(label);
            group.appendChild(input);
            return { group, input };
        };

        const subjectField = createField('ПРЕДМЕТ', 'Например: Математика', lesson.subject, 'list-subjects', (e) => {
            lesson.subject = sanitizeInput(e.target.value); saveState();
        });
        
        subjectField.input.addEventListener('change', (e) => {
            const val = e.target.value;
            lesson.subject = val;
            if (DICTIONARY[val]) {
                if (!roomField.input.value) {
                    roomField.input.value = DICTIONARY[val].rooms[0] || '';
                    lesson.room = roomField.input.value;
                }
                if (!teacherField.input.value) {
                    teacherField.input.value = DICTIONARY[val].teachers[0] || '';
                    lesson.teacher = teacherField.input.value;
                }
            }
            saveState();
        });

        const roomField = createField('КАБИНЕТ', '2-213 / 212', lesson.room, 'list-rooms', (e) => {
            lesson.room = sanitizeInput(e.target.value); saveState();
        });

        const teacherField = createField('ПРЕПОДАВАТЕЛЬ', 'Ушакова Е.П. / Процок М.П.', lesson.teacher, 'list-teachers', (e) => {
            lesson.teacher = sanitizeInput(e.target.value); saveState();
        });

        fieldsDiv.appendChild(subjectField.group);
        fieldsDiv.appendChild(roomField.group);
        fieldsDiv.appendChild(teacherField.group);
        card.appendChild(fieldsDiv);

        // --- НИЖНЯЯ ПАНЕЛЬ (ВРЕМЯ) ---
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'checkbox-label';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!lesson.start;
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode('Свое время'));
        cardFooter.appendChild(checkboxLabel);

        const timeInputs = document.createElement('div');
        timeInputs.className = 'lesson-time-inputs';
        timeInputs.style.display = checkbox.checked ? 'flex' : 'none';

        const startInput = document.createElement('input');
        startInput.type = 'text';
        startInput.className = 'builder-input';
        startInput.placeholder = '09:20';
        startInput.style.width = '70px';
        startInput.value = lesson.start || '';
        
        const endInput = document.createElement('input');
        endInput.type = 'text';
        endInput.className = 'builder-input';
        endInput.placeholder = '10:05';
        endInput.style.width = '70px';
        endInput.value = lesson.end || '';

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                timeInputs.style.display = 'flex';
                lesson.start = startInput.value || "09:20";
                lesson.end = endInput.value || "10:05";
            } else {
                timeInputs.style.display = 'none';
                delete lesson.start;
                delete lesson.end;
            }
            saveState();
        });

        startInput.addEventListener('input', (e) => { lesson.start = e.target.value; saveState(); });
        endInput.addEventListener('input', (e) => { lesson.end = e.target.value; saveState(); });

        timeInputs.appendChild(startInput);
        timeInputs.appendChild(document.createTextNode('—'));
        timeInputs.appendChild(endInput);
        cardFooter.appendChild(timeInputs);

        card.appendChild(cardFooter);
        lessonsContainer.appendChild(card);
    });
}

function saveState() {
    localStorage.setItem('timehub_builder_state', JSON.stringify(state));
}

// ФУНКЦИЯ ФОРМИРОВАНИЯ ПРАВИЛЬНЫХ ИМЕН
function getFilenames() {
    const cleanGroupName = sanitizeInput(state.groupName, false);
    
    // 1. Транслитерация (26 АТП-2Бо -> 26 ATP-2Bo)
    const transliterated = transliterate(cleanGroupName);
    
    // 2. Удаляем пробелы (26 ATP-2Bo -> 26ATP-2Bo)
    const noSpaces = transliterated.replace(/\s+/g, '');
    
    // 3. Очищаем от всего кроме букв, цифр и дефиса
    const fileBaseName = noSpaces.replace(/[^a-zA-Z0-9\-]/g, '');
    
    // 4. Для переменной заменяем дефис на подчеркивание (26ATP_2Bo)
    const varName = fileBaseName.replace(/-/g, '_');

    return { cleanGroupName, fileBaseName, varName };
}

function generateCode() {
    const { cleanGroupName, fileBaseName, varName } = getFilenames();
    
    if (!cleanGroupName) {
        alert('Введи нормальное название группы!');
        return;
    }

    let code = `// data/schedule/${fileBaseName}.js: Расписание для группы ${cleanGroupName}\n\n`;
    code += `export const SCHEDULE_${varName} = {\n`;
    code += `    "${cleanGroupName}": {\n`;

    let customTimes = [];

    [1, 2].forEach(weekNum => {
        code += `        week${weekNum}: {\n`;
        [1, 2, 3, 4, 5].forEach(dayNum => {
            const lessons = state.schedule[weekNum][dayNum] || [];
            if (lessons.length === 0) {
                code += `            ${dayNum}: [],\n`;
            } else {
                lessons.sort((a, b) => (a.pair || 0) - (b.pair || 0));
                code += `            ${dayNum}: [\n`;
                lessons.forEach((lesson) => {
                    const pairNum = lesson.pair || 1;
                    let lessonStr = `                { pair: ${pairNum}, subject: "${lesson.subject || ''}", room: "${lesson.room || ''}", teacher: "${lesson.teacher || ''}" }`;
                    
                    if (lesson.start && lesson.end) {
                        customTimes.push(`            [${weekNum}, ${dayNum}, ${pairNum}, "${lesson.start}", "${lesson.end}"]`);
                    }
                    
                    code += lessonStr + `,\n`;
                });
                code += `            ],\n`;
            }
        });
        code += `        },\n`;
    });

    code += `        customTimes: [\n`;
    if (customTimes.length > 0) {
        code += customTimes.join(',\n') + '\n';
    }
    code += `        ]\n`;
    code += `    }\n};\n`;

    codeOutput.value = code;
    modalCode.classList.remove('hidden');
}

groupInput.addEventListener('input', (e) => {
    e.target.value = sanitizeInput(e.target.value, false);
    state.groupName = e.target.value;
    saveState();
});

document.querySelectorAll('.week-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.week = e.target.dataset.week;
        saveState();
        renderLessons();
    });
});

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.day = e.target.dataset.day;
        saveState();
        renderLessons();
    });
});

btnAddLesson.addEventListener('click', () => {
    const currentLessons = state.schedule[state.week][state.day];
    let nextPairNum = currentLessons.length > 0 ? Math.max(...currentLessons.map(l => l.pair || 0)) + 1 : 1;

    if (nextPairNum > 7) {
        alert("В один день не может быть больше 7 пар!");
        return;
    }

    currentLessons.push({ pair: nextPairNum, subject: "", room: "", teacher: "" });
    saveState();
    renderLessons();
});

btnGenerate.addEventListener('click', generateCode);
document.getElementById('btn-close-modal').addEventListener('click', () => modalCode.classList.add('hidden'));

// СКАЧИВАНИЕ ФАЙЛА
document.getElementById('btn-download-js').addEventListener('click', () => {
    const { fileBaseName } = getFilenames();
    const filename = `${fileBaseName}.js`;
    
    const blob = new Blob([codeOutput.value], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Красивое уведомление на кнопке
    const btn = document.getElementById('btn-download-js');
    btn.innerHTML = '✅ Файл скачан!';
    btn.style.background = '#10b981';
    btn.style.borderColor = '#10b981';
    
    setTimeout(() => {
        btn.innerHTML = '💾 Скачать файл .js';
        btn.style.background = '';
        btn.style.borderColor = '';
    }, 3000);
});

document.getElementById('btn-help').addEventListener('click', () => document.getElementById('modal-help').classList.remove('hidden'));
document.getElementById('btn-close-help').addEventListener('click', () => document.getElementById('modal-help').classList.add('hidden'));

document.querySelectorAll('.week-btn').forEach(btn => {
    if (btn.dataset.week === state.week) btn.classList.add('active');
    else btn.classList.remove('active');
});
document.querySelectorAll('.day-btn').forEach(btn => {
    if (btn.dataset.day === state.day) btn.classList.add('active');
    else btn.classList.remove('active');
});

renderLessons();