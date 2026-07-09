let currentPassword = '';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginWrapper = document.getElementById('loginWrapper');
    const adminPanel = document.getElementById('adminPanel');
    const passwordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const tableBody = document.getElementById('adminTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Theme logic
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.querySelector('.sun');
    const moonIcon = document.querySelector('.moon');

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

    // Check if session exists
    if (sessionStorage.getItem('adminAuth') === 'admin123') {
        currentPassword = 'admin123';
        showAdminPanel();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = passwordInput.value.trim();
        console.log("Attempting login with password length: ", pwd.length);
        // Simple client side check before server validation
        if (pwd === 'admin123') {
            currentPassword = pwd;
            sessionStorage.setItem('adminAuth', pwd);
            showAdminPanel();
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminAuth');
        currentPassword = '';
        adminPanel.style.display = 'none';
        loginWrapper.style.display = 'flex';
        passwordInput.value = '';
        loginError.style.display = 'none';
    });

    async function showAdminPanel() {
        loginWrapper.style.display = 'none';
        adminPanel.style.display = 'block';
        await loadArticles();
    }

    async function loadArticles() {
        try {
            const response = await fetch('/nibgate.json?all=true');
            const data = await response.json();
            renderTable(data.content);
        } catch (err) {
            console.error('Failed to load nibgate metadata', err);
            tableBody.innerHTML = '<tr><td colspan="6">Failed to load articles.</td></tr>';
        }
    }

    function renderTable(resources) {
        tableBody.innerHTML = '';
        resources.forEach(resource => {
            const isGated = resource.access && resource.access.humans === 'paid';
            const price = resource.price || '0.00';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${resource.id}</td>
                <td class="article-title" title="${resource.title}">${resource.title}</td>
                <td><span style="text-transform:capitalize;">${resource.tags[0]}</span></td>
                <td><span class="status-badge ${isGated ? 'badge-gated' : 'badge-free'}">${isGated ? 'Locked' : 'Public'}</span></td>
                <td>
                    <div class="price-container">
                        <input type="number" step="0.01" min="0" class="price-input" id="price-${resource.id}" value="${price}">
                        <span style="font-size:0.8rem;color:var(--text-muted)">USDC</span>
                    </div>
                </td>
                <td>
                    <div class="action-container">
                        <button class="action-btn save-btn" data-id="${resource.id}">Save Price</button>
                        <button class="action-btn toggle-btn ${isGated ? 'btn-free' : 'btn-gated'}" data-id="${resource.id}" data-current="${isGated}">
                            ${isGated ? 'Make Free' : 'Gate Content'}
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const isCurrentlyGated = e.target.getAttribute('data-current') === 'true';
                const newAccess = isCurrentlyGated ? 'free' : 'paid';
                const currentPrice = document.getElementById(`price-${id}`).value;
                
                await updateResource(e.target, id, newAccess, currentPrice);
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const toggleBtn = document.querySelector(`.toggle-btn[data-id="${id}"]`);
                const access = toggleBtn.getAttribute('data-current') === 'true' ? 'paid' : 'free';
                const currentPrice = document.getElementById(`price-${id}`).value;
                
                const originalText = e.target.innerText;
                e.target.innerText = 'Saving...';
                
                await updateResource(null, id, access, currentPrice);
                
                e.target.innerText = 'Saved!';
                setTimeout(() => e.target.innerText = originalText, 1500);
            });
        });
    }

    async function updateResource(btnEl, id, newAccess, newPrice) {
        if (btnEl) {
            btnEl.innerText = 'Updating...';
            btnEl.disabled = true;
        }

        try {
            const res = await fetch('/api/admin/update-gate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, access: newAccess, price: newPrice, password: currentPassword })
            });
            
            if (res.ok) {
                await loadArticles();
            } else {
                alert('Failed to update. Unauthorized?');
                if (btnEl) btnEl.disabled = false;
            }
        } catch (error) {
            console.error('Update failed', error);
            if (btnEl) btnEl.disabled = false;
        }
    }
});
