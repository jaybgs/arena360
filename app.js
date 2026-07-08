import articles from './data/articles.js';

document.addEventListener('DOMContentLoaded', () => {
    const blogGrid = document.getElementById('blogGrid');
    const navLinks = document.querySelectorAll('.nav-links a');
    const categoryTitle = document.getElementById('current-category');
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.querySelector('.sun');
    const moonIcon = document.querySelector('.moon');

    // Theme logic
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

    // Routing logic based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    navLinks.forEach(link => link.classList.remove('active'));
    
    if (categoryParam) {
        const activeLink = Array.from(navLinks).find(l => l.getAttribute('data-filter') === categoryParam);
        if (activeLink) activeLink.classList.add('active');
        
        categoryTitle.textContent = `${categoryParam} News`;
        const filtered = articles.filter(a => a.category === categoryParam);
        renderArticles(filtered);
    } else {
        const homeLink = Array.from(navLinks).find(l => l.getAttribute('data-filter') === 'All');
        if (homeLink) homeLink.classList.add('active');
        
        categoryTitle.textContent = 'Latest Stories';
        renderArticles(articles);
    }

    function renderArticles(items) {
        blogGrid.innerHTML = '';
        
        if (items.length === 0) {
            blogGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-secondary);">No articles found in this category.</p>';
            return;
        }

        items.forEach((item, index) => {
            const delay = index * 0.1; // Staggered animation effect could be added here
            const card = document.createElement('article');
            card.className = 'card';
            card.onclick = (e) => { 
                localStorage.setItem('currentArticleId', item.id);
                window.location.href = `article.html?id=${item.id}`; 
            };
            card.innerHTML = `
                <div class="card-img">
                    <span class="category-tag">${item.category}</span>
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-summary">${item.summary}</p>
                    <div class="card-footer">
                        <a href="article.html?id=${item.id}" class="read-more">Read Article <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                    </div>
                </div>
            `;
            blogGrid.appendChild(card);
        });
    }
});
