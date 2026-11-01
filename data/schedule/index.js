// data/schedule/index.js: Сборщик всех расписаний (читает манифест)

let ALL_SCHEDULES = {};

try {
    // 1. Запрашиваем список файлов из манифеста
    const response = await fetch(new URL('./manifest.json', import.meta.url));
    if (!response.ok) throw new Error('Не удалось загрузить manifest.json');
    
    const manifest = await response.json();
    
    // 2. Динамически импортируем каждый файл из списка
    const modules = await Promise.all(
        manifest.files.map(file => import(`./${file}`))
    );
    
    // 3. Склеиваем все объекты в один
    modules.forEach(mod => {
        // Берем первый экспорт из модуля (например, SCHEDULE_26ATP_1Bo)
        const exportKey = Object.keys(mod)[0];
        if (exportKey && mod[exportKey]) {
            ALL_SCHEDULES = { ...ALL_SCHEDULES, ...mod[exportKey] };
        }
    });
    
    console.log('Расписания успешно загружены:', Object.keys(ALL_SCHEDULES));
    
} catch (error) {
    console.error('Ошибка при загрузке расписаний:', error);
    // Если файлы не загрузились, показываем пустой объект, чтобы сайт не упал
}

export { ALL_SCHEDULES };