var currentPassword = '';

document.addEventListener('DOMContentLoaded', function() {
    console.log('[ADMIN] Script loaded and DOMContentLoaded fired');

    var loginForm = document.getElementById('loginForm');
    var loginWrapper = document.getElementById('loginWrapper');
    var adminPanel = document.getElementById('adminPanel');
    var passwordInput = document.getElementById('adminPassword');
    var loginError = document.getElementById('loginError');
    var tableBody = document.getElementById('adminTableBody');
    var logoutBtn = document.getElementById('logoutBtn');

    // Theme logic
    var themeToggle = document.getElementById('themeToggle');
    var sunIcon = document.querySelector('.sun');
    var moonIcon = document.querySelector('.moon');

    themeToggle.addEventListener('click', function() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    });

    // Check if session exists
    if (sessionStorage.getItem('adminAuth') === 'admin123') {
        currentPassword = 'admin123';
        showAdminPanel();
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pwd = passwordInput.value.trim();
        console.log('[ADMIN] Login attempt');
        if (pwd === 'admin123') {
            currentPassword = pwd;
            sessionStorage.setItem('adminAuth', pwd);
            showAdminPanel();
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
        return false;
    });

    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('adminAuth');
        currentPassword = '';
        adminPanel.style.display = 'none';
        loginWrapper.style.display = 'flex';
        passwordInput.value = '';
        loginError.style.display = 'none';
    });

    function showAdminPanel() {
        loginWrapper.style.display = 'none';
        adminPanel.style.display = 'block';
        loadArticles();
    }

    function loadArticles() {
        console.log('[ADMIN] Loading articles...');
        var url = '/nibgate.json?all=true&t=' + Date.now();
        fetch(url)
            .then(function(response) {
                console.log('[ADMIN] Fetch response status:', response.status);
                return response.json();
            })
            .then(function(data) {
                console.log('[ADMIN] Loaded', data.content.length, 'articles');
                renderTable(data.content);
            })
            .catch(function(err) {
                console.error('[ADMIN] Failed to load articles:', err);
                tableBody.innerHTML = '<tr><td colspan="6">Failed to load articles.</td></tr>';
            });
    }

    function renderTable(resources) {
        tableBody.innerHTML = '';
        resources.forEach(function(resource) {
            var isGated = resource.access && resource.access.humans === 'paid';
            var price = resource.price || '0.00';
            var recipient = resource.recipient || '0x0000000000000000000000000000000000000000';

            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + resource.id + '</td>' +
                '<td class="article-title" title="' + resource.title + '">' + resource.title + '</td>' +
                '<td><span style="text-transform:capitalize;">' + resource.tags[0] + '</span></td>' +
                '<td><span class="status-badge ' + (isGated ? 'badge-gated' : 'badge-free') + '">' + (isGated ? 'Locked' : 'Public') + '</span></td>' +
                '<td>' +
                    '<div class="price-container">' +
                        '<input type="number" step="0.01" min="0" class="price-input" id="price-' + resource.id + '" value="' + price + '">' +
                        '<span style="font-size:0.8rem;color:var(--text-muted)">USDC</span>' +
                    '</div>' +
                '</td>' +
                '<td>' +
                    '<input type="text" class="price-input" style="width:250px; font-size:0.8rem;" id="recipient-' + resource.id + '" value="' + recipient + '">' +
                '</td>' +
                '<td>' +
                    '<button class="action-btn toggle-btn ' + (isGated ? 'btn-free' : 'btn-gated') + '" data-id="' + resource.id + '" data-current="' + isGated + '">' +
                        (isGated ? 'Make Free' : 'Gate Content') +
                    '</button>' +
                '</td>';
            tableBody.appendChild(tr);
        });

        // Attach click handlers to every Gate Content / Make Free button
        var buttons = document.querySelectorAll('.toggle-btn');
        console.log('[ADMIN] Found', buttons.length, 'toggle buttons');
        
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', handleToggleClick);
        }
    }

    function handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = e.target;
        var id = btn.getAttribute('data-id');
        var isCurrentlyGated = btn.getAttribute('data-current') === 'true';
        var newAccess = isCurrentlyGated ? 'free' : 'paid';
        var priceEl = document.getElementById('price-' + id);
        var recipientEl = document.getElementById('recipient-' + id);
        var currentPrice = priceEl ? priceEl.value : '0.00';
        var currentRecipient = recipientEl ? recipientEl.value : '';

        console.log('[ADMIN] Button clicked for article:', id);
        console.log('[ADMIN] Setting access to:', newAccess);
        console.log('[ADMIN] Price:', currentPrice);
        console.log('[ADMIN] Recipient:', currentRecipient);

        btn.innerText = 'Saving...';
        btn.disabled = true;

        var payload = JSON.stringify({
            id: id,
            access: newAccess,
            price: currentPrice,
            recipient: currentRecipient,
            password: currentPassword
        });

        console.log('[ADMIN] Sending POST to /api/admin/update-gate with:', payload);

        fetch('/api/admin/update-gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        })
        .then(function(res) {
            console.log('[ADMIN] Response status:', res.status);
            return res.json().then(function(data) {
                return { status: res.status, ok: res.ok, body: data };
            });
        })
        .then(function(result) {
            console.log('[ADMIN] Response body:', JSON.stringify(result.body));
            if (result.ok) {
                console.log('[ADMIN] Update successful! Reloading table...');
                loadArticles();
            } else {
                var msg = result.body.details || result.body.error || 'Unknown error';
                console.error('[ADMIN] Update failed:', msg);
                alert('Failed to update: ' + msg);
                btn.disabled = false;
                btn.innerText = isCurrentlyGated ? 'Make Free' : 'Gate Content';
            }
        })
        .catch(function(error) {
            console.error('[ADMIN] Network error:', error);
            alert('Network error: ' + error.message);
            btn.disabled = false;
            btn.innerText = isCurrentlyGated ? 'Make Free' : 'Gate Content';
        });
    }
});

console.log('[ADMIN] admin-v2.js file parsed successfully');
