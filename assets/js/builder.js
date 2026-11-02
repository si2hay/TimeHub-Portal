// assets/js/builder.js: Логика Конструктора расписания и замен

import { ALL_TEACHERS, ALL_ROOMS, ALL_SUBJECTS, DICTIONARY } from '../../data/dictionary.js';
import { CONFIG } from './config.js';

let state = {
    mode: 'schedule',
    groupName: "",
    week: "1",
    day: "1",
    subDate: new Date().toISOString().split('T')[0],
    schedule: {
        "1": { "1": [], "2": [], "3": [], "4": [], "5": [] },
        "2": { "1": [], "2": [], "3": [], "4": [], "5": [] }
    }
};

const saved = localStorage.getItem('timehub_builder_state');
if (saved) {
    try { state = { ...state, ...JSON.parse(saved) }; } catch (e) {}
}

const groupInput = document.getElementById('group-name');
const lessonsContainer = document.getElementById('lessons-container');
const btnAddLesson = document.getElementById('btn-add-lesson');
const btnGenerate = document.getElementById('btn-generate');
const codeOutput = document.getElementById('code-output');
const manifestOutput = document.getElementById('manifest-output');
const modalCode = document.getElementById('modal-code');
const subDateInput = document.getElementById('sub-date');
const scheduleControls = document.getElementById('schedule-controls');
const substitutionControls = document.getElementById('substitution-controls');
const builderTitle = document.getElementById('builder-title');
const builderSubtitle = document.getElementById('builder-subtitle');
const filenameHint = document.getElementById('filename-hint');
const btnDownloadJs = document.getElementById('btn-download-js');
const tabManifest = document.getElementById('tab-manifest');
const hintFile = document.getElementById('hint-file');

function sanitizeInput(text, allowPunct = true) {
    if (!text) return "";
    const regex = allowPunct ? /[^a-zA-Zа-яА-Я0-9\s.,!?\-/()]/g : /[^a-zA-Zа-яА-Я0-9\s\-]/g;
    return text.replace(regex, '');
}

function transliterate(word) {
    const map = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya' };
    return word.split('').map(char => map[char] || char).join('');
}

function formatGroupName(rawName) {
    let name = rawName.trim();
    if (!/[а-яА-Я]/.test(name)) {
        name = name.replace(/ATP/gi, 'АТП').replace(/AT/gi, 'АТ').replace(/Bo/gi, 'Бо').replace(/Ba/gi, 'Ба').replace(/Bu/gi, 'Бу').replace(/PNG/gi, 'ПНГ').replace(/EBS/gi, 'ЭБС').replace(/IST/gi, 'ИСТ').replace(/M/gi, 'М').replace(/T/gi, 'Т').replace(/P/gi, 'П').replace(/H/gi, 'Х');
    }
    name = name.replace(/\s+/g, '');
    name = name.replace(/^(\d+)([А-Яа-я])/g, '$1 $2');
    return name;
}

function setupTimeMask(input, nextInput = null) {
    input.setAttribute('maxlength', '5');
    input.setAttribute('placeholder', 'ЧЧ:ММ');
    input.setAttribute('inputmode', 'numeric');
    input.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + ':' + val.slice(2);
        e.target.value = val;
        if (val.length === 5 && nextInput) setTimeout(() => nextInput.focus(), 50);
    });
    input.addEventListener('blur', (e) => {
        let val = e.target.value;
        if (val.length === 5) {
            const [h, m] = val.split(':');
            if (parseInt(h) > 23 || parseInt(m) > 59) e.target.value = '';
        } else if (val.length > 0 && val.length < 5) e.target.value = '';
    });
}

function flashAutofill(input) {
    input.classList.add('autofilled');
    setTimeout(() => input.classList.remove('autofilled'), 1000);
}

groupInput.value = state.groupName;
subDateInput.value = state.subDate;

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

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.mode = e.target.dataset.mode;
        
        if (state.mode === 'schedule') {
            scheduleControls.classList.remove('hidden');
            substitutionControls.classList.add('hidden');
            builderTitle.textContent = "TimeHub Builder";
            builderSubtitle.textContent = "Редактор расписаний";
            state.week = "1"; state.day = "1";
            tabManifest.style.display = 'block';
        } else {
            scheduleControls.classList.add('hidden');
            substitutionControls.classList.remove('hidden');
            builderTitle.textContent = "TimeHub Замены";
            builderSubtitle.textContent = "Редактор замен на день";
            tabManifest.style.display = 'none';
            const { week, day } = getWeekAndDayFromDate(state.subDate);
            state.schedule[week][day] = []; 
        }
        saveState();
        renderLessons();
    });
});

subDateInput.addEventListener('change', (e) => {
    state.subDate = e.target.value;
    const { week, day } = getWeekAndDayFromDate(state.subDate);
    state.schedule[week][day] = [];
    saveState();
    renderLessons();
});

function getWeekAndDayFromDate(dateStr) {
    const date = new Date(dateStr);
    const start = new Date(CONFIG.SEMESTER_START_DATE);
    const diffTime = Math.abs(date - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const week = (Math.floor(diffDays / 7) % 2) + 1;
    let day = date.getDay();
    if (day === 0) day = 1;
    if (day === 6) day = 1;
    return { week, day };
}

function getCurrentLessons() {
    if (state.mode === 'schedule') {
        return state.schedule[state.week][state.day] || [];
    } else {
        const { week, day } = getWeekAndDayFromDate(state.subDate);
        return state.schedule[week][day] || [];
    }
}

function renderLessons() {
    lessonsContainer.innerHTML = '';
    const currentLessons = getCurrentLessons();

    if (currentLessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px; border: 2px dashed var(--border-color); border-radius: 8px;">
                ${state.mode === 'schedule' ? 'На этот день пар пока нет.' : 'Добавь только те пары, которые поменялись.'}
            </div>
        `;
        return;
    }

    currentLessons.sort((a, b) => (a.pair || 0) - (b.pair || 0));

    currentLessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-edit-card';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';

        const numBadge = document.createElement('input');
        numBadge.type = 'text'; 
        numBadge.inputMode = 'numeric';
        numBadge.maxLength = 1; 
        numBadge.className = 'pair-num-input';
        numBadge.value = lesson.pair || index + 1;
        
        numBadge.addEventListener('focus', (e) => e.target.select());
        numBadge.addEventListener('change', (e) => {
            let newVal = parseInt(e.target.value);
            if (isNaN(newVal) || newVal < 1 || newVal > 7) {
                e.target.value = lesson.pair || index + 1;
                return;
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
        deleteBtn.addEventListener('click', () => {
            currentLessons.splice(index, 1);
            saveState();
            renderLessons();
        });
        cardHeader.appendChild(deleteBtn);
        card.appendChild(cardHeader);

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
                if (!roomField.input.value && DICTIONARY[val].rooms.length > 0) {
                    roomField.input.value = DICTIONARY[val].rooms[0];
                    lesson.room = roomField.input.value;
                    flashAutofill(roomField.input);
                }
                if (!teacherField.input.value && DICTIONARY[val].teachers.length > 0) {
                    teacherField.input.value = DICTIONARY[val].teachers[0];
                    lesson.teacher = teacherField.input.value;
                    flashAutofill(teacherField.input);
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

        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        if (state.mode === 'schedule') {
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
            startInput.className = 'builder-input time-input';
            startInput.style.width = '80px';
            startInput.value = lesson.start || '';
            
            const endInput = document.createElement('input');
            endInput.type = 'text';
            endInput.className = 'builder-input time-input';
            endInput.style.width = '80px';
            endInput.value = lesson.end || '';

            setupTimeMask(startInput, endInput);
            setupTimeMask(endInput, null);

            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    timeInputs.style.display = 'flex';
                    lesson.start = startInput.value || "09:20";
                    lesson.end = endInput.value || "10:05";
                    startInput.value = lesson.start;
                    endInput.value = lesson.end;
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
        }

        lessonsContainer.appendChild(card);
    });
}

function saveState() {
    localStorage.setItem('timehub_builder_state', JSON.stringify(state));
}

function getFilenames() {
    const cleanGroupName = sanitizeInput(state.groupName, false);
    const transliterated = transliterate(cleanGroupName);
    const noSpaces = transliterated.replace(/\s+/g, '');
    const fileBaseName = noSpaces.replace(/[^a-zA-Z0-9\-]/g, '');
    const varName = fileBaseName.replace(/-/g, '_');
    const displayGroupName = formatGroupName(cleanGroupName);
    return { cleanGroupName, fileBaseName, varName, displayGroupName };
}

async function generateCode() {
    const { cleanGroupName, fileBaseName, varName, displayGroupName } = getFilenames();
    
    if (!cleanGroupName) {
        alert('Введи нормальное название группы!');
        return;
    }

    if (state.mode === 'schedule') {
        let code = `// data/schedule/${fileBaseName}.js: Расписание для группы ${displayGroupName}\n\n`;
        code += `export const SCHEDULE_${varName} = {\n`;
        code += `    "${displayGroupName}": {\n`;

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
                        code += `                { pair: ${pairNum}, subject: "${lesson.subject || ''}", room: "${lesson.room || ''}", teacher: "${lesson.teacher || ''}" },\n`;
                        if (lesson.start && lesson.end) {
                            customTimes.push(`            [${weekNum}, ${dayNum}, ${pairNum}, "${lesson.start}", "${lesson.end}"]`);
                        }
                    });
                    code += `            ],\n`;
                }
            });
            code += `        },\n`;
        });

        code += `        customTimes: [\n`;
        if (customTimes.length > 0) code += customTimes.join(',\n') + '\n';
        code += `        ]\n`;
        code += `    }\n};\n`;
        
        codeOutput.value = code;
        manifestOutput.value = `"${fileBaseName}.js"`;
        filenameHint.textContent = `${fileBaseName}.js`;
        hintFile.innerHTML = `Скачай этот файл и положи его в папку <b>data/schedule/</b>`;
        
    } else {
        const { week, day } = getWeekAndDayFromDate(state.subDate);
        const currentLessons = state.schedule[week][day] || [];

        const newSubs = {};
        currentLessons.sort((a, b) => (a.pair || 0) - (b.pair || 0)).forEach(lesson => {
            newSubs[lesson.pair] = { 
                subject: lesson.subject || "", 
                room: lesson.room || "", 
                teacher: lesson.teacher || "" 
            };
        });

        try {
            const url = new URL('../../data/substitutions/data.json', import.meta.url);
            url.searchParams.set('t', Date.now());
            const response = await fetch(url);
            
            let allSubs = {};
            if (response.ok) {
                allSubs = await response.json();
            }

            const todayStr = new Date().toISOString().split('T')[0];
            for (const dateKey in allSubs) {
                if (dateKey < todayStr) {
                    delete allSubs[dateKey];
                }
            }

            if (!allSubs[state.subDate]) allSubs[state.subDate] = {};
            if (!allSubs[state.subDate][displayGroupName]) allSubs[state.subDate][displayGroupName] = {};
            
            Object.assign(allSubs[state.subDate][displayGroupName], newSubs);

            codeOutput.value = JSON.stringify(allSubs, null, 2);
            manifestOutput.value = "// Для замен manifest.json менять не нужно";
            filenameHint.textContent = "data.json";
            hintFile.innerHTML = `Скачай этот файл и положи его в папку <b>data/substitutions/</b>, заменив старый`;
            
        } catch (e) {
            console.error("Не удалось скачать старые замены", e);
            codeOutput.value = JSON.stringify({ [state.subDate]: { [displayGroupName]: newSubs } }, null, 2);
        }
    }
    modalCode.classList.remove('hidden');
}

document.getElementById('tab-file').addEventListener('click', () => {
    document.getElementById('tab-file').style.background = 'var(--accent-color)';
    document.getElementById('tab-manifest').style.background = 'rgba(255,255,255,0.1)';
    document.getElementById('content-file').classList.remove('hidden');
    document.getElementById('content-manifest').classList.add('hidden');
});
document.getElementById('tab-manifest').addEventListener('click', () => {
    document.getElementById('tab-manifest').style.background = 'var(--accent-color)';
    document.getElementById('tab-file').style.background = 'rgba(255,255,255,0.1)';
    document.getElementById('content-manifest').classList.remove('hidden');
    document.getElementById('content-file').classList.add('hidden');
});

groupInput.addEventListener('input', (e) => {
    e.target.value = sanitizeInput(e.target.value, false);
    state.groupName = e.target.value;
    saveState();
});

document.querySelectorAll('.week-btn[data-week]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.week-btn[data-week]').forEach(b => b.classList.remove('active'));
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
    const { week, day } = state.mode === 'schedule' ? { week: state.week, day: state.day } : getWeekAndDayFromDate(state.subDate);
    const currentLessons = state.schedule[week][day];
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

btnDownloadJs.addEventListener('click', () => {
    let filename = 'data.json';
    if (state.mode === 'schedule') {
        const { fileBaseName } = getFilenames();
        filename = `${fileBaseName}.js`;
    }

    const mimeType = state.mode === 'schedule' ? 'text/javascript' : 'application/json';
    const blob = new Blob([codeOutput.value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    btnDownloadJs.innerHTML = '✅ Файл скачан!';
    btnDownloadJs.style.background = '#10b981';
    setTimeout(() => {
        btnDownloadJs.innerHTML = '💾 Скачать файл';
        btnDownloadJs.style.background = '';
    }, 3000);
});

document.getElementById('btn-copy-manifest').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(manifestOutput.value);
        const btn = document.getElementById('btn-copy-manifest');
        btn.innerHTML = '✅';
        setTimeout(() => {
            btn.innerHTML = '📋';
        }, 2000);
    } catch (err) {
        alert('Не удалось скопировать. Выдели текст и нажми Ctrl+C');
    }
});

document.getElementById('btn-help').addEventListener('click', () => document.getElementById('modal-help').classList.remove('hidden'));
document.getElementById('btn-close-help').addEventListener('click', () => document.getElementById('modal-help').classList.add('hidden'));

document.querySelectorAll('.mode-btn').forEach(btn => {
    if (btn.dataset.mode === state.mode) btn.classList.add('active');
    else btn.classList.remove('active');
});
if (state.mode === 'substitution') {
    scheduleControls.classList.add('hidden');
    substitutionControls.classList.remove('hidden');
    builderTitle.textContent = "TimeHub Замены";
    builderSubtitle.textContent = "Редактор замен на день";
    tabManifest.style.display = 'none';
}

document.querySelectorAll('.week-btn[data-week]').forEach(btn => {
    if (btn.dataset.week === state.week) btn.classList.add('active');
    else btn.classList.remove('active');
});
document.querySelectorAll('.day-btn').forEach(btn => {
    if (btn.dataset.day === state.day) btn.classList.add('active');
    else btn.classList.remove('active');
});

renderLessons();