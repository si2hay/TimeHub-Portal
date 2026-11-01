// main.js: Точка входа в приложение

import { initDebug } from './debug.js';
import { state } from './state.js';
import { CONFIG } from './config.js';
import { initThemes } from './themes.js';
import { initParticles } from './particles.js';
import { initPWA } from './pwa.js'; // <-- Импорт PWA
import { createHeader } from './ui/header.js';
import { createControls } from './ui/controls.js';
import { createTimer } from './ui/timer.js';
import { createSchedule } from './ui/schedule.js';
import { createReference } from './ui/reference.js';
import { createNotes } from './ui/notes.js';
import { createFooter } from './ui/footer.js';
import { createRadialDayPicker } from './ui/radial-day-picker.js';

window.addEventListener('error', (e) => {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:red; color:white; z-index:9999; padding:10px; font-size:14px; font-family:monospace;';
    errDiv.textContent = `ОШИБКА: ${e.message} в файле ${e.filename}:${e.lineno}`;
    document.body.appendChild(errDiv);
});

const appDiv = document.getElementById('app');
if (appDiv) {
    appDiv.innerHTML = ''; 
    
    initThemes(); 
    initParticles(); 
    initPWA(); // <-- Инициализация PWA
    
    appDiv.appendChild(createHeader());
    appDiv.appendChild(createControls());
    appDiv.appendChild(createTimer());
    appDiv.appendChild(createSchedule()); 
    appDiv.appendChild(createReference()); 
    appDiv.appendChild(createNotes()); 
    appDiv.appendChild(createFooter());
    appDiv.appendChild(createRadialDayPicker());
}

initDebug();

export {};