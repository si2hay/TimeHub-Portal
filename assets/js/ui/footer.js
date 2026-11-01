// ui/footer.js: Подвал сайта (Контакты и дисклеймер)

export function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'app-footer glass-panel';

    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-contact" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; margin-bottom: 8px; color: var(--accent-color);">Связь с автором</h3>
                <p style="font-size: 13px; color: var(--text-main); margin-bottom: 12px; line-height: 1.4;">
                    По вопросам работы сайта, предложениям и <strong>добавлению расписаний</strong> пишите нам.
                </p>
                <div class="footer-links" style="margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; align-items: center;">
                    <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" class="footer-link" style="width: 100%; max-width: 250px; justify-content: center;">
                        <span>💬</span> Группа в Telegram
                    </a>
                    <a href="mailto:gemg944@gmail.com" class="footer-link" style="width: 100%; max-width: 250px; justify-content: center;">
                        <span>📧</span> gemg944@gmail.com
                    </a>
                </div>
                <p style="font-size: 11px; color: var(--text-muted); font-style: italic;">
                    * Отвечаем по возможности, но не гарантируем быстрый ответ.
                </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 15px 0;">

            <p class="footer-disclaimer">
                ⚠️ <strong>Дисклеймер:</strong> Это неофициальный некоммерческий проект. 
                Всегда сверяйтесь с официальным расписанием на сайте колледжа.
            </p>
            <div class="footer-links" style="margin-top: 10px;">
                <a href="https://volgograd-college.gazprom.ru/ochnaya-forma-obucheniya/" target="_blank" class="footer-link official-link">
                    <span>🏫</span> Офиц. расписание
                </a>
            </div>
            <p class="footer-copy">TimeHub-Portal &copy; ${new Date().getFullYear()}</p>
        </div>
    `;

    return footer;
}

export {};