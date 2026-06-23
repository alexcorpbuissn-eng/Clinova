let token = localStorage.getItem('sa_token') || '';

async function apiCall(endpoint, options = {}) {
    if (!options.headers) options.headers = {};
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const res = await fetch(endpoint, options);
    if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
}

function logout() {
    localStorage.removeItem('sa_token');
    token = '';
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').style.display = 'flex';
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'bg-secondary-container', 'text-on-secondary-container');
    });
    const activeBtn = document.getElementById('nav-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-secondary-container', 'text-on-secondary-container');
    }

    if (tabId === 'dashboard') loadStats();
    if (tabId === 'clinics') loadClinics();
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('sa-phone').value;
    const password = document.getElementById('sa-password').value;
    const errEl = document.getElementById('login-err');
    
    try {
        const res = await fetch('/api/superadmin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        token = data.token;
        localStorage.setItem('sa_token', token);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').classList.remove('hidden');
        switchTab('dashboard');
    } catch (err) {
        errEl.innerText = err.message;
    }
}

async function loadStats() {
    try {
        const { stats } = await apiCall('/api/superadmin/stats');
        document.getElementById('stat-total').innerText = stats.totalClinics;
        document.getElementById('stat-active').innerText = stats.activeClinics;
        document.getElementById('stat-doctors').innerText = stats.totalDoctors;
        document.getElementById('stat-appts').innerText = stats.totalAppointments;
        
        const planHtml = Object.entries(stats.clinicsByPlan).map(([plan, count]) => 
            `<div class="flex justify-between py-2 border-b border-outline-variant/20 last:border-0">
                <span class="font-label-md">${plan}</span>
                <span class="font-bold">${count}</span>
            </div>`
        ).join('');
        document.getElementById('stat-plans').innerHTML = planHtml || '<div class="text-sm text-on-surface-variant">No data</div>';
    } catch (err) {
        console.error(err);
    }
}

async function loadClinics() {
    const tbody = document.getElementById('clinics-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading...</td></tr>';
    try {
        const { clinics } = await apiCall('/api/superadmin/clinics');
        tbody.innerHTML = clinics.map(c => `
            <tr class="hover:bg-surface-container-low transition-colors">
                <td class="py-3 px-6 border-r border-outline-variant/30 font-medium">${c.name}</td>
                <td class="py-3 px-6 border-r border-outline-variant/30 font-mono text-xs">${c.slug}</td>
                <td class="py-3 px-6 border-r border-outline-variant/30 text-center">
                    <select onchange="updateClinic('${c.id}', 'plan', this.value)" class="text-xs rounded border border-outline-variant px-2 py-1 bg-surface outline-none focus:border-primary">
                        <option value="TRIAL" ${c.plan === 'TRIAL' ? 'selected' : ''}>TRIAL</option>
                        <option value="BASIC" ${c.plan === 'BASIC' ? 'selected' : ''}>BASIC</option>
                        <option value="PRO" ${c.plan === 'PRO' ? 'selected' : ''}>PRO</option>
                        <option value="ENTERPRISE" ${c.plan === 'ENTERPRISE' ? 'selected' : ''}>ENTERPRISE</option>
                    </select>
                </td>
                <td class="py-3 px-6 border-r border-outline-variant/30 text-center">
                    <button onclick="updateClinic('${c.id}', 'isActive', ${!c.isActive})" class="px-3 py-1 rounded-full text-xs font-bold ${c.isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}">
                        ${c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                </td>
                <td class="py-3 px-6 border-r border-outline-variant/30 text-center">${c._count.doctors}</td>
                <td class="py-3 px-6 border-r border-outline-variant/30 text-center">${c._count.appointments}</td>
                <td class="py-3 px-6 text-center">
                    <button onclick="deleteClinic('${c.id}')" class="text-error hover:bg-error-container p-2 rounded transition" title="Deactivate">
                        <span class="material-symbols-outlined text-[18px]">block</span>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-error">${err.message}</td></tr>`;
    }
}

async function updateClinic(id, field, value) {
    try {
        await apiCall('/api/superadmin/clinics/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });
        loadClinics();
    } catch (err) {
        alert('Failed to update: ' + err.message);
        loadClinics();
    }
}

async function deleteClinic(id) {
    if (!confirm('Are you sure you want to deactivate this clinic?')) return;
    try {
        await apiCall('/api/superadmin/clinics/' + id, { method: 'DELETE' });
        loadClinics();
    } catch (err) {
        alert('Failed to deactivate: ' + err.message);
    }
}

function openCreateModal() {
    document.getElementById('create-modal').style.display = 'flex';
    document.getElementById('create-form').reset();
    document.getElementById('create-err').innerText = '';
    document.getElementById('create-result').classList.add('hidden');
}

function closeCreateModal() {
    document.getElementById('create-modal').style.display = 'none';
}

function generateSlug() {
    const name = document.getElementById('new-name').value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    document.getElementById('new-slug').value = slug;
}

async function handleCreateClinic(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-create');
    btn.disabled = true;
    btn.innerText = 'Yaratilmoqda...';
    
    const data = {
        name: document.getElementById('new-name').value,
        slug: document.getElementById('new-slug').value,
        address: document.getElementById('new-address').value,
        phone: document.getElementById('new-phone').value,
        adminPhone: document.getElementById('new-admin-phone').value,
    };
    
    try {
        const res = await apiCall('/api/superadmin/clinics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        document.getElementById('create-form').style.display = 'none';
        document.getElementById('create-result').classList.remove('hidden');
        document.getElementById('res-slug').innerText = res.clinic.slug;
        document.getElementById('res-admin-phone').innerText = res.admin.telegramPhone;
        document.getElementById('res-note').innerText = res.admin.note;
        
        loadClinics();
        if (document.getElementById('tab-dashboard').classList.contains('hidden') === false) {
            loadStats();
        }
    } catch (err) {
        document.getElementById('create-err').innerText = err.message;
    } finally {
        btn.disabled = false;
        btn.innerText = 'Yaratish';
    }
}

window.onload = () => {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('create-form').addEventListener('submit', handleCreateClinic);
    document.getElementById('new-name').addEventListener('input', generateSlug);
    
    if (token) {
        document.getElementById('dashboard').classList.remove('hidden');
        switchTab('dashboard');
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
};
