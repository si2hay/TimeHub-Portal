// ui/footer.js: Подвал сайта (Telegram и дисклеймер)

export function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'app-footer glass-panel';

    footer.innerHTML = `
        <div class="footer-content">
            <p class="footer-disclaimer">
                ⚠️ <strong>Дисклеймер:</strong> Это неофициальный некоммерческий проект. 
                Всегда сверяйтесь с официальным расписанием на сайте колледжа.
            </p>
            <div class="footer-links">
                <a href="https://volgograd-college.gazprom.ru/ochnaya-forma-obucheniya/" target="_blank" class="footer-link official-link">
                    <span>🏫</span> Офиц. расписание
                </a>
                <a href="https://t.me/si2hay" target="_blank" class="footer-link">
                    <span>✈️</span> Telegram: @si2hay
                </a>
            </div>
            <p class="footer-copy">TimeHub-Portal &copy; ${new Date().getFullYear()}</p>
        </div>
    `;

    return footer;
}

export {};