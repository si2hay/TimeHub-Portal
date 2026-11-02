// ui/footer.js: Подвал сайта

export function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'app-footer glass-panel';

    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-contact" style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; margin-bottom: 8px; color: var(--accent-color);">Стань амбассадором 🚀</h3>
                <p style="font-size: 13px; color: var(--text-main); margin-bottom: 12px; line-height: 1.4;">
                    У нас <b>нет авто-парсинга</b> с сайта колледжа. Весь проект держится на студентах-энтузиастах!<br><br>
                    Собери расписание, замены или консультации в <b>Конструкторе</b>, скачай файл и пришли нам в Telegram.
                </p>
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
                    <i>Помогая проекту, ты делаешь жизнь всех студентов чуточку проще (и получаешь наши лучи добра ✨).</i>
                </p>
                <div class="footer-links" style="margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; align-items: center;">
                    <a href="https://t.me/+sq9RDqa2I2A3M2Iy" target="_blank" class="footer-link" style="width: 100%; max-width: 250px; justify-content: center;">
                        <span>💬</span> Наша Telegram-группа
                    </a>
                </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 15px 0;">
            <p class="footer-disclaimer">
                ⚠️ <strong>Дисклеймер:</strong> Это неофициальный некоммерческий проект. 
                Всегда сверяйтесь с официальным расписанием на сайте колледжа.
            </p>
            <p class="footer-copy">TimeHub-Portal &copy; ${new Date().getFullYear()}</p>
        </div>
    `;

    return footer;
}