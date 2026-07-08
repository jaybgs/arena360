document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('adminTableBody');

    // Prompt for a simple admin password for basic protection
    const password = prompt('Enter Admin Password (hint: admin123)');
    if (password !== 'admin123') {
        document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;">Access Denied</h2>';
        return;
    }

    async function loadArticles() {
        try {
            const response = await fetch('/nibgate.json');
            const data = await response.json();
            renderTable(data.resources);
        } catch (err) {
            console.error('Failed to load nibgate metadata', err);
            tableBody.innerHTML = '<tr><td colspan="6">Failed to load articles.</td></tr>';
        }
    }

    function renderTable(resources) {
        tableBody.innerHTML = '';
        resources.forEach(resource => {
            const isGated = resource.access && resource.access.humans === 'paid';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${resource.id}</td>
                <td class="article-title">${resource.title}</td>
                <td><span style="text-transform:capitalize;">${resource.tags[0]}</span></td>
                <td>${resource.price} ${resource.currency}</td>
                <td><strong>${isGated ? 'Paid / Gated' : 'Free / Public'}</strong></td>
                <td>
                    <button class="toggle-btn ${isGated ? 'btn-free' : 'btn-gated'}" data-id="${resource.id}" data-current="${isGated}">
                        ${isGated ? 'Make Free' : 'Gate Content'}
                    </button>
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
                
                e.target.innerText = 'Updating...';
                e.target.disabled = true;

                try {
                    const res = await fetch('/api/admin/update-gate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, access: newAccess, password: 'admin123' })
                    });
                    
                    if (res.ok) {
                        loadArticles(); // Reload table
                    } else {
                        alert('Failed to update access status.');
                        e.target.disabled = false;
                        e.target.innerText = isCurrentlyGated ? 'Make Free' : 'Gate Content';
                    }
                } catch (error) {
                    console.error('Update failed', error);
                }
            });
        });
    }

    loadArticles();
});
