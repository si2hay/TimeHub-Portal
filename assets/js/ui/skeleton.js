// ui/skeleton.js: Красивые заглушки загрузки

export function renderScheduleSkeleton() {
    return `
        <div class="skeleton-card glass-panel">
            <div class="skeleton-time">
                <div class="skeleton-num shimmer"></div>
                <div class="skeleton-clock shimmer"></div>
            </div>
            <div class="skeleton-info">
                <div class="skeleton-title shimmer"></div>
                <div class="skeleton-details shimmer"></div>
            </div>
        </div>
        <div class="skeleton-card glass-panel">
            <div class="skeleton-time">
                <div class="skeleton-num shimmer"></div>
                <div class="skeleton-clock shimmer"></div>
            </div>
            <div class="skeleton-info">
                <div class="skeleton-title shimmer"></div>
                <div class="skeleton-details shimmer"></div>
            </div>
        </div>
        <div class="skeleton-card glass-panel">
            <div class="skeleton-time">
                <div class="skeleton-num shimmer"></div>
                <div class="skeleton-clock shimmer"></div>
            </div>
            <div class="skeleton-info">
                <div class="skeleton-title shimmer"></div>
                <div class="skeleton-details shimmer"></div>
            </div>
        </div>
    `;
}