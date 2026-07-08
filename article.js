import articles from './data/articles.js';

document.addEventListener('DOMContentLoaded', async () => {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.querySelector('.sun');
    const moonIcon = document.querySelector('.moon');

    // Theme logic (reused for consistency)
    const toggleTheme = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    };

    themeToggle.addEventListener('click', toggleTheme);
    
    // Initialize theme based on preference or existing logic if any
    
    // Article loading logic
    const urlParams = new URLSearchParams(window.location.search);
    let idParam = urlParams.get('id');
    
    // Fallback to localStorage if URL parameter is stripped
    if (!idParam) {
        idParam = localStorage.getItem('currentArticleId');
    }
    
    const articleContainer = document.getElementById('articleContainer');

    if (!idParam) {
        articleContainer.innerHTML = '<h2>Article not found (No ID provided).</h2><p>Please return home and try clicking the article again.</p><a href="index.html" class="back-link">Return to Home</a>';
        return;
    }

    const article = articles.find(a => String(a.id) === String(idParam));

    if (!article) {
        articleContainer.innerHTML = '<h2>Article not found (Invalid ID).</h2><a href="index.html" class="back-link">Return to Home</a>';
        return;
    }

    // Update page title
    document.title = `${article.title} - Arena360`;

    // Check gating with backend
    try {
        const accessRes = await fetch(`/api/nibgate/access?id=${idParam}`);
        if (accessRes.status === 402) {
            articleContainer.innerHTML = `
                <a href="javascript:history.back()" class="back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Articles
                </a>
                <div class="article-header">
                    <span class="article-category">${article.category}</span>
                    <h1 class="article-title">${article.title}</h1>
                </div>
                <div style="position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 2rem;">
                    <img src="${article.image}" alt="${article.title}" class="article-image" style="filter: blur(15px); transform: scale(1.1); margin-bottom: 0;">
                    <div class="article-content" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: rgba(0,0,0,0.6); color: white; padding: 40px; z-index: 10;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 20px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <h2 style="margin-bottom: 15px; font-size: 2rem;">Premium Content</h2>
                        <p style="margin-bottom: 25px; font-size: 1.2rem;">This article is gated. You must unlock it to continue reading.</p>
                        <button class="unlock-btn" data-nibgate-unlock style="background: var(--primary-color); color: white; border: none; padding: 15px 40px; border-radius: 30px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s;">Unlock with Nibgate</button>
                    </div>
                </div>
            `;
            return;
        }
    } catch (e) {
        console.error('Gating check failed', e);
    }

    // Render the full article
    articleContainer.innerHTML = `
        <a href="javascript:history.back()" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Articles
        </a>
        <div class="article-header">
            <span class="article-category">${article.category}</span>
            <h1 class="article-title">${article.title}</h1>
        </div>
        <img src="${article.image}" alt="${article.title}" class="article-image">
        <div class="article-content">
            <p><strong>${article.summary}</strong></p>
            ${article.content}
        </div>
    `;
});
