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
    if (tabId === 'billing') loadBilling();
}

async function handleLogin(e) {
    e.preventDefault();
    let phone = document.getElementById('sa-phone').value;
    phone = phone.replace(/\s+/g, '').trim(); // Remove all spaces
    const password = document.getElementById('sa-password').value.trim();
    const errEl = document.getElementById('login-err');
    
    try {
        const res = await fetch('/api/superadmin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        const data = await res.json();
        if (!res.ok) {
            if (data.debug) {
                console.error("Login failed. Debug info:", data.debug);
                errEl.innerHTML = `Login failed. <br>Server saw phone: '${data.debug.receivedPhone}'<br>Password matches: ${data.debug.matches}`;
            }
            throw new Error(data.error);
        }
        
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

async function loadBilling() {
    const container = document.getElementById('billing-container');
    container.innerHTML = '<div class="col-span-full text-center py-4">Loading billing data...</div>';
    try {
        const { clinics } = await apiCall('/api/superadmin/billing');
        container.innerHTML = clinics.map(c => {
            const badgeClass = c.plan === 'TRIAL' ? 'bg-surface-variant text-on-surface-variant' :
                               c.plan === 'BASIC' ? 'bg-primary-container text-on-primary-container' :
                               c.plan === 'PRO' ? 'bg-tertiary-container text-on-tertiary-container' :
                               'bg-[#FFD700] text-black'; 
            
            const docStr = c.usage.doctors.max === '∞' ? `${c.usage.doctors.used} / ∞` : `${c.usage.doctors.used} / ${c.usage.doctors.max}`;
            const apptStr = c.usage.appointments.max === '∞' ? `${c.usage.appointments.used} / ∞` : `${c.usage.appointments.used} / ${c.usage.appointments.max}`;
            
            const expDate = c.usage.planExpiresAt ? new Date(c.usage.planExpiresAt) : null;
            const daysLeft = expDate ? Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24)) : Infinity;
            const dateStr = expDate ? expDate.toLocaleDateString() : 'No expiry';
            const dateColor = daysLeft <= 7 ? 'text-error font-bold' : 'text-on-surface';

            return `
            <div class="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold">`+c.name+`</h3>
                        <div class="text-xs text-on-surface-variant font-mono mt-1">`+c.slug+`</div>
                    </div>
                    <span class="px-2 py-1 text-xs font-bold rounded `+badgeClass+`">`+c.usage.planLabel+`</span>
                </div>

                <div class="flex flex-col gap-2 mt-2">
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-on-surface-variant">Doctors</span>
                            <span class="font-medium">`+docStr+`</span>
                        </div>
                        <div class="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                            <div class="h-full bg-primary" style="width: `+c.usage.doctors.pct+`%"></div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-on-surface-variant">Appointments (This month)</span>
                            <span class="font-medium">`+apptStr+`</span>
                        </div>
                        <div class="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                            <div class="h-full bg-primary" style="width: `+c.usage.appointments.pct+`%"></div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-2 border-t border-outline-variant/30 pt-4">
                    <div class="text-sm">
                        <span class="text-on-surface-variant">Expires:</span> 
                        <span class="`+dateColor+`">`+dateStr+` `+(daysLeft <= 7 && daysLeft >= 0 ? '('+daysLeft+' days)' : '')+`</span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <select onchange="updateClinicPlan('`+c.id+`', this.value)" class="text-sm rounded border border-outline-variant px-2 py-2 bg-surface outline-none focus:border-primary">
                            <option value="">Upgrade...</option>
                            <option value="BASIC">To BASIC</option>
                            <option value="PRO">To PRO</option>
                            <option value="ENTERPRISE">To ENTERPRISE</option>
                        </select>
                        <button onclick="extendPlan('`+c.id+`', '`+(c.usage.planExpiresAt || '')+`')" class="bg-secondary text-on-secondary px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary/90 transition-colors">
                            Extend 30 Days
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = '<div class="col-span-full text-center py-4 text-error">'+err.message+'</div>';
    }
}

async function updateClinicPlan(id, newPlan) {
    if (!newPlan) return;
    if (!confirm('Are you sure you want to change the plan to '+newPlan+'?')) return;
    try {
        await apiCall('/api/superadmin/clinics/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: newPlan })
        });
        loadBilling();
    } catch (err) {
        alert('Failed to update plan: ' + err.message);
    }
}

async function extendPlan(id, currentExpiry) {
    let baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
    if (baseDate < new Date()) baseDate = new Date();
    
    const newDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (!confirm('Extend plan by 30 days? New expiry: ' + newDate.toLocaleDateString())) return;
    
    try {
        await apiCall('/api/superadmin/clinics/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planExpiresAt: newDate.toISOString() })
        });
        loadBilling();
    } catch (err) {
        alert('Failed to extend plan: ' + err.message);
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
