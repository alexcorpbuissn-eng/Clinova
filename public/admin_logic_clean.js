
    function closeHistoryModal() { document.getElementById('history-modal').style.display = 'none'; }
    
    // Loading animation helper
    function adminLoaderHTML(cols, text = 'Yuklanmoqda...') {
      return `<tr><td colspan="${cols}">
        <div class="admin-loader">
          <div class="admin-loader-dots"><span></span><span></span><span></span></div>
          <div class="admin-loader-text">${text}</div>
          <div class="admin-skeleton">
            <div class="admin-skeleton-row"><div class="admin-skeleton-bar" style="width:30%; height:12px;"></div><div class="admin-skeleton-bar" style="width:20%;"></div><div class="admin-skeleton-bar" style="width:40%;"></div></div>
            <div class="admin-skeleton-row"><div class="admin-skeleton-bar" style="width:25%;"></div><div class="admin-skeleton-bar" style="width:35%; height:12px;"></div><div class="admin-skeleton-bar" style="width:15%;"></div></div>
            <div class="admin-skeleton-row"><div class="admin-skeleton-bar" style="width:40%; height:12px;"></div><div class="admin-skeleton-bar" style="width:20%;"></div><div class="admin-skeleton-bar" style="width:30%;"></div></div>
          </div>
        </div>
      </td></tr>`;
    }
    function adminLoaderDiv(text = 'Yuklanmoqda...') {
      return `<div class="admin-loader">
        <div class="admin-loader-dots"><span></span><span></span><span></span></div>
        <div class="admin-loader-text">${text}</div>
      </div>`;
    }
    function showHistory(name, historyJson) {
      const history = JSON.parse(decodeURIComponent(historyJson));
      document.getElementById('modal-title').textContent = `${name} - Daromad Tarixi`;
      document.getElementById('modal-tbody').innerHTML = history.map(h => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid var(--border)">${h.month}</td>
          <td style="padding:8px; border-bottom:1px solid var(--border); text-align:right; font-weight:600; color:var(--teal-dark)">
            ${h.revenue.toLocaleString('uz-UZ')} so'm
          </td>
        </tr>
      `).join('');
      document.getElementById('history-modal').style.display = 'flex';
    }

    let currentPromotePhone = null;
    function closeRoleModal() {
      document.getElementById('role-modal').style.display = 'none';
      document.getElementById('role-error').style.display = 'none';
      currentPromotePhone = null;
    }
    function promotePatient(phone, name) {
      currentPromotePhone = phone;
      document.getElementById('role-patient-name').textContent = name;
      
      // Copy doctors from new-user-doctor select
      const srcSelect = document.getElementById('new-user-doctor');
      const destSelect = document.getElementById('role-doctor-select');
      if (srcSelect && destSelect) {
        destSelect.innerHTML = srcSelect.innerHTML;
      }
      
      document.getElementById('role-select').value = 'RECEPTION';
      document.getElementById('role-doctor-select-group').style.display = 'none';
      document.getElementById('role-modal').style.display = 'flex';
    }
    function toggleRoleModalDoctorSelect() {
      const role = document.getElementById('role-select').value;
      document.getElementById('role-doctor-select-group').style.display = role === 'DOCTOR' ? 'block' : 'none';
    }
    async function savePatientRole() {
      const role = document.getElementById('role-select').value;
      const doctorId = document.getElementById('role-doctor-select').value;
      const btn = document.getElementById('btn-save-role');
      const errEl = document.getElementById('role-error');
      
      if (role === 'DOCTOR' && !doctorId) {
        errEl.textContent = 'Shifokor roli uchun shifokorni tanlash majburiy';
        errEl.style.display = 'block';
        return;
      }
      
      btn.disabled = true;
      errEl.style.display = 'none';
      
      try {
        const data = await apiPost('/api/admin/users', {
          telegramPhone: currentPromotePhone,
          role,
          doctorId: role === 'DOCTOR' ? doctorId : null
        });
        if (data.success) {
          alert("Lavozim muvaffaqiyatli belgilandi va Telegram orqali xabar yuborildi!");
          closeRoleModal();
          if (document.getElementById('tab-users').style.display !== 'none') {
            loadUsers();
          }
        } else {
          errEl.textContent = data.error || 'Xatolik yuz berdi';
          errEl.style.display = 'block';
        }
      } catch (e) {
        errEl.textContent = 'Tarmoq xatosi';
        errEl.style.display = 'block';
      } finally {
        btn.disabled = false;
      }
    }

    // ---- PROCEDURES (XIZMATLAR) ----
    async function loadProcedures() {
      const tbody = document.getElementById('proc-tbody');
      tbody.innerHTML = adminLoaderHTML(5, 'Xizmatlar yuklanmoqda...');
      try {
        const data = await apiGet('/api/admin/procedures');
        if (data.success) {
          if (data.procedures.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Xizmatlar topilmadi</td></tr>';
            return;
          }
          
          // Group procedures by specialty and name
          const grouped = [];
          const seenKeys = new Set();
          
          for (const p of data.procedures) {
            const key = `${p.doctor.specialty.toLowerCase()}_${p.name.trim().toLowerCase()}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              grouped.push({
                specialty: p.doctor.specialty,
                name: p.name,
                durationMinutes: p.durationMinutes,
                price: p.price,
                id: p.id
              });
            }
          }

          tbody.innerHTML = grouped.map((g, idx) => {
            const isDental = g.specialty === 'Stomatolog';
            const specName = isDental ? 'Stomatologiya' : g.specialty;
            const badgeClass = isDental ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container';
            
            return `
              <tr class="hover:bg-surface-container/30 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/30 group">
                <td class="py-4 px-6 border-r border-outline-variant/50">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeClass}">
                    <span class="material-symbols-outlined" style="font-size: 14px;">${isDental ? 'dentistry' : 'hearing'}</span>
                    ${specName}
                  </span>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 font-medium text-on-surface">${g.name}</td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined opacity-50" style="font-size: 16px;">schedule</span>
                      <input type="number" id="duration-group-${idx}" value="${g.durationMinutes}" class="w-28 bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 pl-9 pr-8 text-on-surface font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all group-hover:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-sm opacity-50">min</span>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="relative">
                      <input type="number" id="price-group-${idx}" value="${g.price}" class="w-36 bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 pl-4 pr-12 text-on-surface font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all group-hover:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-sm opacity-50">UZS</span>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-center">
                  <button onclick="saveGroupedProcedure('${g.id}', ${idx})" class="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm hover:bg-primary-container transition-colors shadow-sm hover:shadow-md active:scale-95">
                    <span class="material-symbols-outlined" style="font-size: 16px;">save</span> Saqlash
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Xatolik yuz berdi</td></tr>';
      }
    }

    async function saveGroupedProcedure(id, idx) {
      const priceStr = document.getElementById(`price-group-${idx}`).value;
      const price = parseInt(priceStr, 10);
      
      const durationStr = document.getElementById(`duration-group-${idx}`).value;
      const durationMinutes = parseInt(durationStr, 10);

      if (isNaN(price) || price < 0) {
        alert("Noto'g'ri narx kiritildi!");
        return;
      }
      
      if (isNaN(durationMinutes) || durationMinutes < 1) {
        alert("Noto'g'ri davomiylik kiritildi!");
        return;
      }

      try {
        const res = await fetch(`/api/admin/procedures/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: JSON.stringify({ price, durationMinutes })
        });
        if (res.ok) {
          alert("O'zgarishlar barcha shifokorlar uchun saqlandi!");
          loadProcedures();
        } else {
          const d = await res.json();
          alert(d.error || 'Xatolik yuz berdi');
        }
      } catch (err) {
        alert('Server xatosi');
      }
    }

    const API = '';
    
    // Auth Check on load — verify token with server, don't just trust localStorage
    async function verifyAuthOnLoad() {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) { showLogin(); return; }
        const res = await fetch('/api/admin/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showDashboard();
        } else {
          localStorage.removeItem('admin_token');
          showLogin();
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      }
    }
    verifyAuthOnLoad();

    // Phone Submit
    document.getElementById('phone-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      let phone = document.getElementById('telegram-phone').value;
      const errEl = document.getElementById('login-err');
      const btn = document.getElementById('btn-phone');

      let digits = phone.replace(/\D/g, '');
      if (digits.startsWith('998') && digits.length === 12) {
        phone = '+' + digits;
        document.getElementById('telegram-phone').value = phone;
      } else {
        errEl.textContent = "Iltimos, to'g'ri O'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX).";
        return;
      }

      errEl.textContent = '';
      btn.textContent = 'Yuborilmoqda...';
      btn.disabled = true;

      try {
        const res = await fetch(`${API}/api/public/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramPhone: phone })
        });
        const data = await res.json();
        if (res.ok && (data.success || data.action)) {
          if (data.action === 'deep_link') {
            errEl.innerHTML = `Avval bot orqali ro'yxatdan o'ting: <br><a href="${data.deepLink}" target="_blank" style="color:var(--teal); text-decoration:underline; margin-top:5px; display:inline-block">Botga o'tish</a>`;
          } else {
            document.getElementById('phone-form').style.display = 'none';
            document.getElementById('otp-form').style.display = 'block';
          }
        } else {
          errEl.textContent = data.error || "Xatolik yuz berdi";
        }
      } catch {
        errEl.textContent = "Tarmoq xatosi";
      }
      btn.textContent = 'Kodni Olish';
      btn.disabled = false;
    });

    // OTP Submit
    document.getElementById('otp-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('telegram-phone').value;
      const code = document.getElementById('otp-code').value;
      const errEl = document.getElementById('login-err');
      const btn = document.getElementById('btn-otp');

      errEl.textContent = '';
      btn.textContent = 'Tekshirilmoqda...';
      btn.disabled = true;

      try {
        const res = await fetch(`${API}/api/public/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramPhone: phone, code })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem('admin_token', data.token);
            showDashboard();
          } else {
            errEl.textContent = "Sizda admin huquqi yo'q!";
          }
        } else {
          errEl.textContent = data.error || "Xatolik yuz berdi";
        }
      } catch {
        errEl.textContent = "Tarmoq xatosi";
      }
      btn.textContent = 'Kirish';
      btn.disabled = false;
    });

    function logout() {
      localStorage.removeItem('admin_token');
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
    }

    function showDashboard() {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'flex';
      loadAppointments();
    }

    function toggleSidebar() {
      document.getElementById('admin-sidebar').classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('active');
    }

    function switchTab(tab) {
      if (window.innerWidth <= 768) {
        document.getElementById('admin-sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay').classList.remove('active');
      }
      
      // Reset all nav items
      document.querySelectorAll('.nav-item').forEach(el => {
          el.classList.remove('active', 'bg-secondary-container', 'text-on-secondary-container');
          el.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high');
      });
      
      // Show active tab
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      const contentEl = document.getElementById(`tab-${tab}`);
      if (contentEl) {
        contentEl.style.display = 'block';
      }

      // Highlight active nav
      const navEl = document.getElementById(`nav-${tab}`);
      if (navEl) {
          navEl.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high');
          navEl.classList.add('active', 'bg-secondary-container', 'text-on-secondary-container');
      }

      if (tab === 'appointments' || tab === 'dashboard') loadAppointments();
      if (tab === 'dashboard') setTimeout(renderDashboardChart, 100);
      if (tab === 'patients') loadPatients();
      if (tab === 'doctors') loadDoctors();
      if (tab === 'users') loadUsers();
      if (tab === 'procedures') loadProcedures();
      if (tab === 'leaves') loadLeaves();
      if (tab === 'purchases') loadPurchases();
    }

    let dashboardChartInstance = null;
    function renderDashboardChart() {
      const ctx = document.getElementById('dashboard-chart');
      if (!ctx || typeof Chart === 'undefined') return;
      
      if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
      }
      
      const labels = [];
      const dataRevenue = [];
      const dataAppointments = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
        dataRevenue.push(Math.floor(Math.random() * 2000000) + 500000);
        dataAppointments.push(Math.floor(Math.random() * 30) + 10);
      }

      dashboardChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: "Daromad (so'm)",
              data: dataRevenue,
              borderColor: '#2d6a4f',
              backgroundColor: 'rgba(45, 106, 79, 0.1)',
              yAxisID: 'y',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Qabullar',
              data: dataAppointments,
              borderColor: '#0077b6',
              backgroundColor: 'rgba(0, 119, 182, 0.1)',
              yAxisID: 'y1',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 13 }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: "Daromad (so'm)" }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'Qabullar' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    // ---- PURCHASES (SKLAD) ----
    async function loadPurchases() {
      const tbody = document.getElementById('purchases-tbody');
      if(!tbody) return;
      tbody.innerHTML = adminLoaderHTML(6, 'Xarajatlar yuklanmoqda...');
      try {
        const data = await apiGet('/api/inventory/purchases');
        if (data.success) {          if (data.purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-outline font-medium bg-surface-container-lowest"><div class="flex flex-col items-center gap-2"><span class="material-symbols-outlined text-[2rem] text-outline-variant">inventory_2</span>Hech qanday xarajat kiritilmagan</div></td></tr>';
            return;
          }
          tbody.innerHTML = data.purchases.map(p => `
            <tr class="hover:bg-surface-container-lowest transition-colors group">
              <td class="py-4 px-6 border-r border-outline-variant/50">${new Date(p.createdAt).toLocaleString('ru-RU')}</td>
              <td class="py-4 px-6 border-r border-outline-variant/50">
                <div class="font-semibold text-on-surface">${p.itemName}</div>
              </td>
              <td class="py-4 px-6 border-r border-outline-variant/50">${p.sellerName}</td>
              <td class="py-4 px-6 border-r border-outline-variant/50 text-right">
                <span class="font-bold text-primary">${p.price.toLocaleString('ru-RU')} so'm</span>
              </td>
              <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-outline text-sm">${p.recordedBy || "Noma'lum"}</td>
              <td class="py-4 px-6 text-center">
                <button class="bg-error/10 text-error hover:bg-error hover:text-on-error px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95 inline-flex items-center gap-1" onclick="deletePurchase('${p.id}')">
                  <span class="material-symbols-outlined text-[1.1rem]">delete</span> O'chirish
                </button>
              </td>
            </tr>
          `).join('');
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-error font-medium bg-surface-container-lowest">Xato yuz berdi</td></tr>';
      }
    }

    async function deletePurchase(id) {
      if (!confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) return;
      const res = await apiFetch(`/api/admin/purchases/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast("Xarajat o'chirildi");
        loadPurchases();
      } else {
        showToast(res.error || 'Xato', true);
      }
    }

    // ---- LEAVES / TIME OFF ----
    async function loadLeaves() {
      const tbody = document.getElementById('leave-tbody');
      tbody.innerHTML = `<div class="col-span-full py-12 flex flex-col items-center justify-center text-outline-variant"><span class="material-symbols-outlined animate-spin text-[2rem] mb-2">refresh</span>Dam olish ro'yxati yuklanmoqda...</div>`;
      try {
        const data = await apiGet('/api/admin/leaves');
        if (data.success) {
          if (data.leaves.length === 0) {
            tbody.innerHTML = `<div class="col-span-full py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center text-outline"><span class="material-symbols-outlined text-[3rem] text-outline-variant mb-4">event_available</span><p class="font-medium text-lg">Hech qanday dam olish kiritilmagan</p></div>`;
            return;
          }
          tbody.innerHTML = data.leaves.map(l => {
            const start = new Date(l.startTime);
            const end = new Date(l.endTime);
            const now = new Date();
            let timerHtml = '';
            
            if (now < start) {
              const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              timerHtml = `<div class="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1.5 mt-2"><span class="material-symbols-outlined" style="font-size:16px">timer</span>Boshlanishiga ${diffDays} kun qoldi</div>`;
            } else if (now >= start && now <= end) {
              const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              timerHtml = `<div class="bg-error/10 text-error px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1.5 mt-2"><span class="material-symbols-outlined" style="font-size:16px">hourglass_bottom</span>Tugashiga ${diffDays} kun qoldi</div>`;
            } else {
              timerHtml = `<div class="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1.5 mt-2"><span class="material-symbols-outlined" style="font-size:16px">done_all</span>Yakunlangan</div>`;
            }

            const isDental = l.doctor.specialty === 'Stomatolog';
            const badgeClass = isDental ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container';
            const specName = l.doctor.specialty || 'Shifokor';

            return `
            <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col">
              <button onclick="deleteLeave('${l.id}')" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-on-error" title="Bekor qilish">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
              </button>
              
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-lg">
                  ${l.doctor.firstName.charAt(0)}${l.doctor.lastName.charAt(0)}
                </div>
                <div>
                  <h4 class="font-headline-sm text-on-surface leading-tight">${l.doctor.firstName} ${l.doctor.lastName}</h4>
                  <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${badgeClass}">
                    <span class="material-symbols-outlined" style="font-size: 12px;">${isDental ? 'dentistry' : 'hearing'}</span>
                    ${specName}
                  </span>
                </div>
              </div>
              
              ${timerHtml}
              
              <div class="mt-5 grid grid-cols-2 gap-4">
                <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                  <div class="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Boshlanish</div>
                  <div class="font-medium text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-primary/70" style="font-size:16px">flight_takeoff</span>${start.toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                  <div class="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Tugash</div>
                  <div class="font-medium text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-error/70" style="font-size:16px">flight_land</span>${end.toLocaleDateString('ru-RU')}</div>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-outline-variant/30 flex-1">
                <div class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sabab</div>
                <p class="text-body-md text-on-surface line-clamp-2">${l.reason || '<span class="text-outline italic">Kiritilmagan</span>'}</p>
              </div>
            </div>
            `;
          }).join('');
        }
      } catch(e) {}
    }

    let leaveStartPicker = null;
    let leaveEndPicker = null;

    async function openLeaveModal() {
      document.getElementById('leave-start').value = '';
      document.getElementById('leave-end').value = '';
      document.getElementById('leave-reason').value = '';
      
      if (!leaveStartPicker) {
        leaveStartPicker = flatpickr('#leave-start', {
          locale: 'uz',
          dateFormat: 'Y-m-d',
        });
      } else {
        leaveStartPicker.clear();
      }
      
      if (!leaveEndPicker) {
        leaveEndPicker = flatpickr('#leave-end', {
          locale: 'uz',
          dateFormat: 'Y-m-d',
        });
      } else {
        leaveEndPicker.clear();
      }
      
      const hiddenInput = document.getElementById('leave-doc-select');
      const textSpan = document.getElementById('leave-custom-select-text');
      const dropdown = document.getElementById('leave-custom-select-dropdown');
      
      hiddenInput.value = '';
      textSpan.textContent = 'Yuklanmoqda...';
      dropdown.innerHTML = '<div class="px-4 py-3 text-on-surface-variant text-center">Yuklanmoqda...</div>';
      
      document.getElementById('leave-modal').style.display = 'flex';
      
      try {
        const data = await apiGet('/api/admin/doctors');
        if (data.success) {
          textSpan.textContent = 'Shifokorni tanlang...';
          dropdown.innerHTML = data.doctors.map(d => `
            <div onclick="selectLeaveDoc('${d.id}', '${d.firstName} ${d.lastName} (${d.specialty})')" class="px-4 py-3 hover:bg-surface-container cursor-pointer text-on-surface transition-colors flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">${d.firstName[0]}${d.lastName[0]}</div>
              <div>
                <div class="font-medium">${d.firstName} ${d.lastName}</div>
                <div class="text-xs text-on-surface-variant">${d.specialty}</div>
              </div>
            </div>
          `).join('');
        }
      } catch(e) {}
    }

    function toggleLeaveDocSelect(e) {
      if (e) e.stopPropagation();
      const dropdown = document.getElementById('leave-custom-select-dropdown');
      const arrow = document.getElementById('leave-custom-select-arrow');
      if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
      } else {
        dropdown.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
      }
    }

    function selectLeaveDoc(id, name) {
      document.getElementById('leave-doc-select').value = id;
      document.getElementById('leave-custom-select-text').textContent = name;
      toggleLeaveDocSelect();
    }

    // Close custom dropdown when clicking outside
    document.addEventListener('click', function(e) {
      const container = document.getElementById('leave-custom-select-container');
      if (container && !container.contains(e.target)) {
        const dropdown = document.getElementById('leave-custom-select-dropdown');
        const arrow = document.getElementById('leave-custom-select-arrow');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
          if(arrow) arrow.style.transform = 'rotate(0deg)';
        }
      }
    });

    function setLeaveQuickRange(days) {
      let start = new Date();
      if (leaveStartPicker && leaveStartPicker.selectedDates.length > 0) {
        start = leaveStartPicker.selectedDates[0];
      } else {
        if (leaveStartPicker) leaveStartPicker.setDate(start);
      }
      
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      if (leaveEndPicker) leaveEndPicker.setDate(end);
    }

    function closeLeaveModal() {
      document.getElementById('leave-modal').style.display = 'none';
      const dropdown = document.getElementById('leave-custom-select-dropdown');
      const arrow = document.getElementById('leave-custom-select-arrow');
      if (dropdown) dropdown.classList.add('hidden');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    async function submitLeave() {
      const doctorId = document.getElementById('leave-doc-select').value;
      const startStr = document.getElementById('leave-start').value;
      const endStr = document.getElementById('leave-end').value;
      const reason = document.getElementById('leave-reason').value;

      if(!doctorId || !startStr || !endStr) {
        alert("Shifokor, boshlanish va tugash sanasini tanlang!");
        return;
      }

      // Convert to Date objects spanning from 00:00 to 23:59
      const startDate = new Date(startStr + "T00:00:00");
      const endDate = new Date(endStr + "T23:59:59");
      
      const startTime = startDate.toISOString();
      const endTime = endDate.toISOString();

      try {
        const res = await apiPost('/api/admin/leaves', { doctorId, startTime, endTime, reason });
        if(res.success) {
          showToast(`Dam olish saqlandi. ${res.deletedSlots} ta bo'sh slotlar o'chirildi!`);
          closeLeaveModal();
          loadLeaves();
        } else {
          showToast(res.error || "Xatolik yuz berdi", "error");
        }
      } catch(e) { showToast("Tarmoq xatosi", "error"); }
    }

    async function deleteLeave(id) {
      if(!confirm("Bu dam olishni bekor qilasizmi? (O'chirilgan slotlar qayta tiklanmaydi!)")) return;
      try {
        const res = await apiDelete(`/api/admin/leaves?id=${id}`);
        if(res.success) {
          showToast("Bekor qilindi");
          loadLeaves();
        }
      } catch(e) { alert("Xatolik"); }
    }

    async function apiGet(endpoint) {
      const t = localStorage.getItem('admin_token');
      const res = await fetch(API + endpoint, { headers: { 'Authorization': `Bearer ${t}` } });
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Unauthorized'); }
      return res.json();
    }

    async function apiDelete(endpoint) {
      const t = localStorage.getItem('admin_token');
      const res = await fetch(API + endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${t}` } });
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Unauthorized'); }
      return res.json();
    }

    async function apiPatch(endpoint, body) {
      const t = localStorage.getItem('admin_token');
      const res = await fetch(API + endpoint, { 
        method: 'PATCH', 
        headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Unauthorized'); }
      return res.json();
    }

    async function apiPost(endpoint, body) {
      const t = localStorage.getItem('admin_token');
      const res = await fetch(API + endpoint, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Unauthorized'); }
      return res.json();
    }

    // Fetch Appointments
    async function loadAppointments() {
      const tbody = document.getElementById('appt-tbody');
      tbody.innerHTML = adminLoaderHTML(6, 'Qabullar yuklanmoqda...');
      try {
        const data = await apiGet('/api/admin/appointments');
        if (data.success) {
          if (data.appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Qabullar mavjud emas</td></tr>';
            return;
          }
          tbody.innerHTML = data.appointments.map(a => {
            const _d = new Date(a.slot.startTime);
            const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
            const date = `${_d.getDate()}-${uzMonths[_d.getMonth()]}`;
            const time = _d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Tashkent' });
            const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
            const pPhone = a.patient ? a.patient.phone : a.patientPhone;
            
            const isCancelledAdmin = a.status === 'CANCELLED' && a.cancelledBy === 'ADMIN';
            const isCancelledPatient = a.status === 'CANCELLED' && a.cancelledBy === 'PATIENT';
            const isNoShow = a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW';
            const isNoShowResolved = a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_RESOLVED';
            const isNoShowUnreachable = a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_UNREACHABLE';

            const rowClass = isCancelledAdmin ? 'row-cancelled-admin' : 
                             (isCancelledPatient ? 'row-cancelled-patient' : 
                             (isNoShow || isNoShowResolved || isNoShowUnreachable ? 'row-noshow' : ''));
            
            let statusCell = `<span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>`;
            if (a.status === 'COMPLETED' && a.visit) {
              const pm = a.visit.paymentMethod;
              const pmText = pm === 'CASH' ? 'Naqd' : (pm === 'CARD' ? 'Karta' : (pm === 'TRANSFER' ? "O'tkazma" : pm || 'Aniqlanmagan'));
              const amount = a.visit.paidAmount || a.visit.price || 0;
              const amountText = amount > 0 ? ` - ${amount.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm` : '';
              statusCell += ` <span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; margin-left:4px;" title="To'lov turi va summa">💳 ${pmText}${amountText}</span>`;
            }
            if (isCancelledAdmin) {
              statusCell += ` <span class="badge badge-cancelled-admin" title="Admin tomonidan bekor qilindi">🛡 Admin</span>`;
            } else if (isCancelledPatient) {
              statusCell += ` <span class="badge badge-cancelled-patient" title="Bemor tomonidan bekor qilindi">👤 Bemor</span>`;
            } else if (isNoShow) {
              statusCell += ` <span class="badge badge-noshow" title="Bemor kelmadi (Bog'lanish kutilmoqda)">⚠️ Kelmadi (Kutilmoqda)</span>`;
            } else if (isNoShowResolved) {
              statusCell += ` <span class="badge badge-noshow" style="background:#dcfce7; color:#15803d; border: 1px solid #bbf7d0;" title="Bemor kelmadi (Telefon orqali bog'lanildi)">✅ Kelmadi (Bog'lanildi)</span>`;
            } else if (isNoShowUnreachable) {
              statusCell += ` <span class="badge badge-noshow" style="background:#fee2e2; color:#b91c1c; border: 1px solid #fecaca;" title="Bemor kelmadi (Javob bermadi)">📵 Kelmadi (Javobsiz, ${a.callAttempts || 0} marta)</span>`;
            }

            let actions = '';
            if (a.status === 'SCHEDULED') {
              actions = `
                <div style="display:flex;gap:6px">
                  <button class="btn" style="padding:6px 12px; font-size:0.8rem; width:auto; background:var(--green); border-color:var(--green)" onclick="attendAppt('${a.id}')">Keldi</button>
                  <button class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem; width:auto" onclick="deleteAppt('${a.id}')">Bekor qilish</button>
                </div>
              `;
            }

            return `
              <tr class="${rowClass} hover:bg-surface-container/30 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/30">
                <td class="py-4 px-6 border-r border-outline-variant/50 font-medium"><strong>${pName}</strong></td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center font-mono text-xs">${pPhone}</td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center"><div style="font-size:0.85rem">Dr. ${a.doctor.lastName}<br><span class="text-on-surface-variant opacity-80">${a.procedure?.name || 'Birlamchi ko\'rik'}</span></div></td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center"><div style="font-size:0.85rem"><strong>${date}</strong><br>${time}</div></td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">${statusCell}</td>
                <td class="py-4 px-6 text-center">${actions}</td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red">Xatolik yuz berdi</td></tr>';
      }
    }

    // Cancel Appointment
    async function deleteAppt(id) {
      if (!confirm("Haqiqatan ham bu qabulni bekor qilmoqchimisiz? Bo'sh vaqt yana hammaga ko'rinadigan bo'ladi.")) return;
      try {
        const data = await apiDelete(`/api/admin/appointments/${id}`);
        if (data.success) {
          alert("Qabul muvaffaqiyatli bekor qilindi.");
          loadAppointments();
        } else {
          alert(data.error || "Xatolik yuz berdi");
        }
      } catch (e) {
        if(e.message !== 'Unauthorized') alert("Tarmoq xatosi");
      }
    }

    // Mark as attended
    async function attendAppt(id) {
      if (!confirm("Bemor kelganini tasdiqlaysizmi? Bu qabul Qabul Daftariga tushadi.")) return;
      try {
        const data = await apiPatch(`/api/admin/appointments/${id}`, { action: 'ATTEND' });
        if (data.success) {
          loadAppointments();
        } else {
          alert(data.error || "Xatolik yuz berdi");
        }
      } catch (e) {
        if(e.message !== 'Unauthorized') alert("Tarmoq xatosi");
      }
    }

    // Fetch Patients
    async function loadPatients() {
      const tbody = document.getElementById('pat-tbody');
      tbody.innerHTML = adminLoaderHTML(6, 'Bemorlar yuklanmoqda...');
      try {
        const data = await apiGet('/api/admin/patients');
        if (data.success) {
          if (data.patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Bemorlar mavjud emas</td></tr>';
            return;
          }
          tbody.innerHTML = data.patients.map(p => {
            const escapedName = `${p.firstName.replace(/'/g, "\\'")} ${p.lastName.replace(/'/g, "\\'")}`;
            return `
              <tr class="hover:bg-surface-container/30 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/30">
                <td class="py-4 px-6 border-r border-outline-variant/50 font-medium"><strong>${p.firstName} ${p.lastName}</strong></td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center font-mono text-xs">${p.phone}</td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-primary">${p.telegramUsername ? '@' + p.telegramUsername : (p.telegramChatId || '<span class="text-on-surface-variant opacity-50">Yo\'q</span>')}</td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">${p.cancellationsToday > 0 ? `<span class="bg-error-container text-on-error-container px-2 py-1 rounded-full text-xs font-bold">${p.cancellationsToday}</span>` : '<span class="text-outline-variant">-</span>'}</td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center font-bold">${p._count.appointments}</td>
                <td class="py-4 px-6 text-center">
                  <button class="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2 mx-auto" 
                          onclick="promotePatient('${p.telegramPhone}', '${escapedName}')">
                    <span class="material-symbols-outlined text-[16px]">key</span> Lavozim
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red">Xatolik yuz berdi</td></tr>';
      }
    }

    // ---- DOCTOR ADD/EDIT ----
    function openDoctorModal(docStr) {
      document.getElementById('role-error').style.display = 'none'; // reset just in case
      const modal = document.getElementById('doctor-modal');
      const doc = docStr ? JSON.parse(decodeURIComponent(docStr)) : null;
      
      if (doc) {
        document.getElementById('doctor-modal-title').textContent = "Shifokorni tahrirlash";
        document.getElementById('edit-doc-id').value = doc.id;
        document.getElementById('edit-doc-first').value = doc.firstName || '';
        document.getElementById('edit-doc-last').value = doc.lastName || '';
        document.getElementById('edit-doc-specialty').value = doc.specialty || 'Stomatolog';
        document.getElementById('edit-doc-bio').value = doc.bio || '';
        document.getElementById('edit-doc-photo').value = doc.photoUrl || '';
        document.getElementById('edit-doc-tg').value = doc.telegramUsername || '';
        document.getElementById('edit-doc-work-start').value = doc.workStartTime || '09:00';
        document.getElementById('edit-doc-work-end').value = doc.workEndTime || '18:00';
        document.getElementById('edit-doc-break-start').value = doc.breakStartTime || '13:00';
        document.getElementById('edit-doc-break-end').value = doc.breakEndTime || '14:00';
        
        if (doc.photoUrl) {
          document.getElementById('photo-preview-img').src = doc.photoUrl;
          document.getElementById('photo-preview-container').style.display = 'block';
          document.getElementById('photo-drop-text').style.display = 'none';
        } else {
          document.getElementById('photo-preview-img').src = '';
          document.getElementById('photo-preview-container').style.display = 'none';
          document.getElementById('photo-drop-text').style.display = 'block';
        }
      } else {
        document.getElementById('doctor-modal-title').textContent = "Yangi shifokor qo'shish";
        document.getElementById('edit-doc-id').value = '';
        document.getElementById('edit-doc-first').value = '';
        document.getElementById('edit-doc-last').value = '';
        document.getElementById('edit-doc-specialty').value = 'Stomatolog';
        document.getElementById('edit-doc-bio').value = '';
        document.getElementById('edit-doc-photo').value = '';
        document.getElementById('edit-doc-tg').value = '';
        document.getElementById('edit-doc-work-start').value = '09:00';
        document.getElementById('edit-doc-work-end').value = '18:00';
        document.getElementById('edit-doc-break-start').value = '13:00';
        document.getElementById('edit-doc-break-end').value = '14:00';
        
        document.getElementById('photo-preview-img').src = '';
        document.getElementById('photo-preview-container').style.display = 'none';
        document.getElementById('photo-drop-text').style.display = 'block';
      }
      modal.style.display = 'flex';
    }

    function closeDoctorModal() {
      document.getElementById('doctor-modal').style.display = 'none';
    }

    // Photo Upload Logic
    const dropZone = document.getElementById('photo-drop-zone');
    const fileInput = document.getElementById('edit-doc-photo-file');
    const photoUrlInput = document.getElementById('edit-doc-photo');
    const photoPreview = document.getElementById('photo-preview-img');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoDropText = document.getElementById('photo-drop-text');

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--teal)';
      dropZone.style.backgroundColor = '#f0fdf4';
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border)';
      dropZone.style.backgroundColor = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border)';
      dropZone.style.backgroundColor = 'transparent';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handlePhotoUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handlePhotoUpload(e.target.files[0]);
      }
    });

    async function handlePhotoUpload(file) {
      if (!file.type.startsWith('image/')) {
        alert('Faqat rasm yuklash mumkin!');
        return;
      }
      
      photoDropText.innerHTML = 'Yuklanmoqda... ⏳';
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 600;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get base64 string
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          photoUrlInput.value = dataUrl;
          photoPreview.src = dataUrl;
          photoPreviewContainer.style.display = 'block';
          photoDropText.style.display = 'none';
        };
        img.onerror = function() {
          alert('Rasmni yuklashda xatolik yuz berdi');
          photoDropText.innerHTML = '📷 <span>Rasmni shu yerga tashlang yoki tanlash uchun bosing</span>';
        };
        img.src = e.target.result;
      };
      reader.onerror = function() {
        alert('Faylni o`qishda xatolik yuz berdi');
        photoDropText.innerHTML = '📷 <span>Rasmni shu yerga tashlang yoki tanlash uchun bosing</span>';
      };
      reader.readAsDataURL(file);
    }

    async function submitDoctorModal() {
      const id = document.getElementById('edit-doc-id').value;
      const firstName = document.getElementById('edit-doc-first').value;
      const lastName = document.getElementById('edit-doc-last').value;
      const specialty = document.getElementById('edit-doc-specialty').value;
      const bio = document.getElementById('edit-doc-bio').value;
      const photoUrl = document.getElementById('edit-doc-photo').value;
      const telegramUsername = document.getElementById('edit-doc-tg').value;
      const workStartTime = document.getElementById('edit-doc-work-start').value;
      const workEndTime = document.getElementById('edit-doc-work-end').value;
      const breakStartTime = document.getElementById('edit-doc-break-start').value;
      const breakEndTime = document.getElementById('edit-doc-break-end').value;
      
      if(!firstName || !lastName || !specialty) {
        alert("Ism, familiya va mutaxassislikni kiriting!");
        return;
      }

      try {
        let res;
        if (id) {
          res = await fetch(`/api/admin/doctors/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
            body: JSON.stringify({ firstName, lastName, specialty, bio, photoUrl, telegramUsername, workStartTime, workEndTime, breakStartTime, breakEndTime })
          }).then(r => r.json());
        } else {
          res = await apiPost('/api/admin/doctors', { firstName, lastName, specialty, bio, photoUrl, telegramUsername, workStartTime, workEndTime, breakStartTime, breakEndTime });
        }

        if(res.success) {
          showToast("Muvaffaqiyatli saqlandi!");
          closeDoctorModal();
          loadDoctors();
        } else {
          alert("Xatolik: " + res.error);
        }
      } catch(e) { alert("Tarmoq xatosi"); }
    }

    async function toggleDoctorStatus(id, isActive) {
      if(!confirm(`Shifokorni ${isActive ? 'faollashtirishni' : 'o\'chirishni'} xohlaysizmi?`)) return;
      try {
        const res = await fetch(`/api/admin/doctors/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: JSON.stringify({ isActive })
        }).then(r => r.json());
        if(res.success) {
          showToast("Holat o'zgartirildi!");
          loadDoctors();
        }
      } catch(e) { alert("Xatolik"); }
    }

    async function loadDoctors() {
      if (!localStorage.getItem('admin_token')) return;
      const tbodyStom = document.getElementById('doc-stomatolog-tbody');
      const tbodyLor = document.getElementById('doc-lor-tbody');
      const loadingCol = '<div class="col-span-full text-center py-8 text-on-surface-variant text-body-lg">Shifokorlar yuklanmoqda...</div>';
      tbodyStom.innerHTML = loadingCol;
      tbodyLor.innerHTML = loadingCol;
      try {
        const data = await apiGet('/api/admin/stats');
        if (data.success) {
          const fmt = (n) => n.toLocaleString('uz-UZ') + ' so\'m';
          const stomatologs = data.stats.filter(d => d.specialty.toLowerCase().includes('stomatolog'));
          const lors = data.stats.filter(d => d.specialty.toLowerCase().includes('lor'));

          const renderCard = d => `
            <div class="bg-surface-container-lowest rounded-2xl border ${!d.isActive ? 'border-error/30 opacity-75' : 'border-outline-variant/30'} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative">
              <!-- Header -->
              <div class="p-5 border-b border-outline-variant/20 flex justify-between items-start bg-surface-container-low/30 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div class="flex items-center gap-4 z-10">
                  <div class="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md font-bold shadow-inner">
                    ${d.firstName.charAt(0)}${d.lastName.charAt(0)}
                  </div>
                  <div>
                    <h5 class="font-headline-sm text-on-surface leading-tight">${d.firstName} ${d.lastName}</h5>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant">${d.specialty || 'Shifokor'}</span>
                      ${!d.isActive ? '<span class="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-error-container text-on-error-container">Nofaol</span>' : '<span class="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Faol</span>'}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Stats Body -->
              <div class="p-5 flex-1 flex flex-col">
                <div class="grid grid-cols-3 gap-2 mb-5">
                  <div class="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-center">
                    <div class="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Bugun</div>
                    <div class="font-headline-md text-primary">${d.daily}</div>
                  </div>
                  <div class="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-center">
                    <div class="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Hafta</div>
                    <div class="font-headline-md text-primary">${d.weekly}</div>
                  </div>
                  <div class="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-center">
                    <div class="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Oy</div>
                    <div class="font-headline-md text-primary">${d.monthly}</div>
                  </div>
                </div>
                
                <div class="bg-surface rounded-xl p-4 border border-outline-variant/20 flex-1 space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-on-surface-variant">Jami Bemorlar:</span>
                    <span class="font-bold text-on-surface">${d.totalPatients}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-on-surface-variant">Oylik Tushum:</span>
                    <span class="font-bold text-[#0f5238]">${fmt(d.monthlyRevenue)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-on-surface-variant">Yillik Tushum:</span>
                    <span class="font-bold text-on-surface">${fmt(d.yearlyRevenue)}</span>
                  </div>
                </div>
              </div>
              
              <div class="px-5 pb-5">
                <button onclick="openDoctorSchedule('${d.id}', '${d.firstName} ${d.lastName}')" class="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-md hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
                  <span class="material-symbols-outlined text-[18px]">edit_calendar</span> Jadvalni boshqarish
                </button>
              </div>

              <!-- Actions -->
              <div class="p-3 border-t border-outline-variant/20 bg-surface-container-low/10 flex items-center justify-between">
                 <button onclick="showHistory('${d.firstName} ${d.lastName}', '${encodeURIComponent(JSON.stringify(d.monthlyHistory))}')" class="text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined" style="font-size: 16px;">calendar_month</span> Tarix
                 </button>
                 <div class="flex gap-1">
                   <button onclick="openDoctorModal('${encodeURIComponent(JSON.stringify(d))}')" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors" title="Tahrirlash">
                    <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
                   </button>
                   <button onclick="toggleDoctorStatus('${d.id}', ${!d.isActive})" class="w-8 h-8 rounded-full flex items-center justify-center ${d.isActive ? 'text-error hover:bg-error-container' : 'text-primary hover:bg-primary-container'} transition-colors" title="${d.isActive ? 'O\'chirish' : 'Faollashtirish'}">
                    <span class="material-symbols-outlined" style="font-size: 18px;">${d.isActive ? 'person_off' : 'person_check'}</span>
                   </button>
                 </div>
              </div>
            </div>
          `;

          tbodyStom.innerHTML = stomatologs.length ? stomatologs.map(renderCard).join('') : '<div class="col-span-full text-center py-8 text-on-surface-variant">Shifokor topilmadi</div>';
          tbodyLor.innerHTML = lors.length ? lors.map(renderCard).join('') : '<div class="col-span-full text-center py-8 text-on-surface-variant">Shifokor topilmadi</div>';
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') {
          tbodyStom.innerHTML = '<div class="col-span-full text-center py-8 text-error">Xatolik yuz berdi</div>';
          tbodyLor.innerHTML = '<div class="col-span-full text-center py-8 text-error">Xatolik yuz berdi</div>';
        }
      }
    }
    
    // ---- USERS (Ruxsatlar) ----
    function toggleDoctorSelect() {
      const role = document.getElementById('new-user-role').value;
      document.getElementById('doctor-select-group').style.display = role === 'DOCTOR' ? 'block' : 'none';
    }

    async function loadUsers() {
      if (!localStorage.getItem('admin_token')) return;
      try {
        const data = await apiGet('/api/admin/users');
        const tbody = document.getElementById('users-tbody');
        if (data.success) {
          if (data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Foydalanuvchilar yo\'q</td></tr>';
          } else {
            // Also load doctors for mapping doctorId to name
            const dData = await apiGet('/api/admin/doctors');
            let doctorMap = {};
            if (dData.success) {
              const select = document.getElementById('new-user-doctor');
              select.innerHTML = '<option value="">Shifokorni tanlang...</option>' + 
                dData.doctors.map(d => {
                  doctorMap[d.id] = `${d.firstName} ${d.lastName}`;
                  return `<option value="${d.id}">${d.firstName} ${d.lastName} (${d.specialty})</option>`;
                }).join('');
            }

            tbody.innerHTML = data.users.map(u => {
              const roleColors = {
                'ADMIN': 'bg-error-container text-on-error-container',
                'DOCTOR': 'bg-primary-container text-on-primary-container',
                'RECEPTION': 'bg-[#e8def8] text-[#1d192b]'
              };
              const roleNames = {
                'ADMIN': 'Administrator',
                'DOCTOR': 'Shifokor',
                'RECEPTION': 'Qabulxona'
              };
              const colorClass = roleColors[u.role] || 'bg-surface-variant text-on-surface-variant';
              const rName = roleNames[u.role] || u.role;
              const doctorAssigned = u.doctorId && doctorMap[u.doctorId] ? doctorMap[u.doctorId] : (u.doctorId || '-');
              
              const nName = u.name || "Noma\'lum (Bemor emas)";
              const initials = (u.name && u.name.length >= 2) ? u.name.substring(0, 2).toUpperCase() : 'U';

              return `
              <tr class="hover:bg-surface-container/30 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/30 group">
                <td class="py-4 px-6 border-r border-outline-variant/50">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colorClass}">
                      ${initials}
                    </div>
                    <div>
                      <div class="font-headline-sm text-on-surface leading-tight">${nName}</div>
                      <div class="font-mono text-xs text-on-surface-variant opacity-80 mt-0.5">${u.telegramPhone}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">
                  <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}">${rName}</span>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-sm font-medium text-on-surface-variant">
                  ${doctorAssigned !== '-' ? `<span class="flex items-center justify-center gap-1 text-primary"><span class="material-symbols-outlined" style="font-size:16px;">stethoscope</span> ${doctorAssigned}</span>` : '<span class="opacity-50">-</span>'}
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-xs text-on-surface-variant">
                  ${new Date(u.createdAt).toLocaleString('uz-UZ', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td class="py-4 px-6 text-center">
                  <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="assignDoctor('${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors" title="Shifokorga bog'lash">
                      <span class="material-symbols-outlined" style="font-size: 18px;">link</span>
                    </button>
                    <button onclick="deleteUser('${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors" title="O'chirish">
                      <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `}).join('');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function createUser() {
      const phone = document.getElementById('new-user-phone').value.trim();
      const role = document.getElementById('new-user-role').value;
      const doctorId = document.getElementById('new-user-doctor').value;
      const errEl = document.getElementById('user-err');
      
      if (!phone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone)) {
        errEl.textContent = 'To\'g\'ri telefon raqam kiriting (+998 XX XXX XX XX)';
        errEl.style.color = 'var(--red)';
        return;
      }
      if (role === 'DOCTOR' && !doctorId) {
        errEl.textContent = 'Shifokorni tanlang';
        errEl.style.color = 'var(--red)';
        return;
      }
      
      errEl.textContent = 'Qo\'shilmoqda...';
      errEl.style.color = 'var(--text-muted)';
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: JSON.stringify({ telegramPhone: phone, role, doctorId: role === 'DOCTOR' ? doctorId : null })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          errEl.textContent = 'Muvaffaqiyatli qo\'shildi!';
          errEl.style.color = 'var(--green)';
          document.getElementById('new-user-phone').value = '';
          loadUsers();
          setTimeout(() => { errEl.textContent = ''; }, 3000);
        } else {
          errEl.textContent = data.error || 'Xatolik yuz berdi';
          errEl.style.color = 'var(--red)';
        }
      } catch (e) {
        errEl.textContent = 'Tarmoq xatosi';
        errEl.style.color = 'var(--red)';
      }
    }

    let currentAssignUserId = null;

    function closeModal() {
      document.getElementById('assign-modal').classList.remove('active');
    }

    async function assignDoctor(userId) {
      currentAssignUserId = userId;
      const dData = await apiGet('/api/admin/doctors');
      if (!dData.success) return;
      
      const list = document.getElementById('modal-doc-list');
      list.innerHTML = dData.doctors.map(d => `
        <div class="modal-item" onclick="submitAssign('${d.id}')">
          <div>
            <strong>${d.firstName} ${d.lastName}</strong><br/>
            <span>${d.specialty}</span>
          </div>
          <span style="color:var(--teal); font-weight:600">Tanlash →</span>
        </div>
      `).join('');
      
      document.getElementById('assign-modal').classList.add('active');
    }

    async function submitAssign(docId) {
      try {
        const data = await apiPatch(`/api/admin/users/${currentAssignUserId}`, { doctorId: docId });
        if (data.success) {
          alert("Shifokor bog'landi!");
          closeModal();
          loadUsers();
        } else {
          alert(data.error || "Xatolik");
        }
      } catch (err) {
        alert("Xatolik");
      }
    }

    async function unlinkDoctor() {
      if (!confirm("Ushbu foydalanuvchini shifokor profilidan uzmoqchimisiz?")) return;
      try {
        const data = await apiPatch(`/api/admin/users/${currentAssignUserId}`, { doctorId: null });
        if (data.success) {
          alert("Bog'liqlik uzildi!");
          closeModal();
          loadUsers();
        } else {
          alert(data.error || "Xatolik");
        }
      } catch (err) {
        alert("Xatolik");
      }
    }

    async function deleteUser(id) {
      if (!confirm('Haqiqatan ham bu foydalanuvchini o\'chirmoqchimisiz?')) return;
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          loadUsers();
        } else {
          alert(data.error || 'Xatolik yuz berdi');
        }
      } catch (e) {
        alert('Tarmoq xatosi');
      }
    }

    // ---- Universal Phone number formatting (+998 xx xxx xx xx) ----
    function applyPhoneFormatter(input) {
      if (!input) return;
      const prefix = '+998 ';
      const formatNumber = (val) => {
        let digits = val.replace(/\D/g, '');
        if (digits.startsWith('998')) digits = digits.slice(3);
        digits = digits.slice(0, 9);
        let res = prefix;
        if (digits.length > 0) res += digits.slice(0, 2);
        if (digits.length > 2) res += ' ' + digits.slice(2, 5);
        if (digits.length > 5) res += ' ' + digits.slice(5, 7);
        if (digits.length > 7) res += ' ' + digits.slice(7, 9);
        return res;
      };
      input.addEventListener('focus', () => { if (!input.value || input.value.trim() === '') input.value = prefix; });
      input.addEventListener('keydown', (e) => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && input.selectionStart <= prefix.length && input.selectionEnd <= prefix.length) e.preventDefault();
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
        if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
      });
      input.addEventListener('input', (e) => { e.target.value = formatNumber(e.target.value); });
      input.addEventListener('blur', () => { if (input.value === prefix || input.value.trim() === '+998') input.value = ''; });
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        e.target.value = formatNumber(text);
      });
    }
    document.querySelectorAll('input[type="tel"]').forEach(applyPhoneFormatter);

    // ---- Schedule Tab Logic ----
    let adminAllSlots = [];
    let adminPendingChanges = {};
    let adminCopiedSchedule = null;
    let adminCopiedDayLabel = '';
    let adminCurrentDoctorId = null;

    // Monthly Calendar State
    let adminCalendarCurrentDate = new Date();
    let adminSelectedStartDate = null;

    const ADMIN_START_HOUR = 9;
    const ADMIN_END_HOUR = 17;
    const ADMIN_INTERVAL = 30;

    function getLocalISO(date) {
      // Shift to Tashkent (UTC+5) and extract date parts
      const tashkent = new Date(date.getTime() + 5 * 60 * 60 * 1000);
      const year = tashkent.getUTCFullYear();
      const month = String(tashkent.getUTCMonth() + 1).padStart(2, '0');
      const day = String(tashkent.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function parseTashkentDateTime(isoDateStr, timeStr) {
      return new Date(`${isoDateStr}T${timeStr}:00+05:00`);
    }

    function openDoctorSchedule(docId, docName) {
      document.getElementById('doctors-list-view').classList.add('hidden');
      document.getElementById('doctor-schedule-view').classList.remove('hidden');
      document.getElementById('schedule-doctor-name').innerText = `${docName} jadvali`;
      
      adminCurrentDoctorId = docId;
      adminPendingChanges = {};
      adminCancelCopyState();
      
      document.getElementById('admin-month-calendar-wrap').style.display = 'block';
      document.getElementById('admin-schedule-container').style.display = 'block';
      
      loadAdminScheduleGrid();
    }

    function closeDoctorSchedule() {
      document.getElementById('doctors-list-view').classList.remove('hidden');
      document.getElementById('doctor-schedule-view').classList.add('hidden');
      adminCurrentDoctorId = null;
    }

    async function loadAdminScheduleDashboard() {
      const dashboard = document.getElementById('admin-schedule-overview-dashboard');
      if (!dashboard) return;
      
      dashboard.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
          ${adminLoaderDiv('Umumiy jadval statistikasi yuklanmoqda...')}
          <div class="p-6">
            <div class="animate-pulse flex space-x-4">
              <div class="flex-1 space-y-6 py-1">
                <div class="h-12 bg-surface-container rounded-xl w-full"></div>
                <div class="space-y-3">
                  <div class="grid grid-cols-3 gap-4">
                    <div class="h-10 bg-surface-container rounded-lg col-span-1"></div>
                    <div class="h-10 bg-surface-container rounded-lg col-span-1"></div>
                    <div class="h-10 bg-surface-container rounded-lg col-span-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      try {
        const [docsData, slotsData] = await Promise.all([
          apiGet('/api/admin/doctors'),
          (async () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const from = new Date(year, month, 1).toISOString();
            const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
            return apiGet(`/api/admin/slots?from=${from}&to=${to}`);
          })()
        ]);
        
        if (!docsData.success || !slotsData.success) {
          dashboard.innerHTML = '<div class="text-center p-10 text-error bg-error-container rounded-2xl border border-error/20 font-medium">Statistikani yuklab bo\'lmadi</div>';
          return;
        }
        
        const doctors = docsData.doctors;
        const slots = slotsData.slots;
        const nowMonthName = `${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][new Date().getMonth()]} ${new Date().getFullYear()}`;
        
        if (doctors.length === 0) {
          dashboard.innerHTML = '<div class="text-center p-10 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/30 font-medium">Shifokorlar topilmadi</div>';
          return;
        }
        
        let html = `
          <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 class="font-headline-md text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-[28px]">monitoring</span> Shifokorlar ish yuklamasi
              </h2>
              <p class="font-body-sm text-on-surface-variant mt-1">${nowMonthName} oyi uchun shifokorlar jadvali va bandlik darajasi bo'yicha umumiy ko'rinish.</p>
            </div>
            <button onclick="loadAdminScheduleDashboard()" class="flex items-center gap-2 border border-outline-variant text-on-surface-variant bg-surface-container-lowest px-4 py-2 rounded-full font-label-md hover:bg-surface-container hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-[18px]">refresh</span> Yangilash
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        `;
        
        for (const doc of doctors) {
          const docSlots = slots.filter(s => s.doctorId === doc.id);
          const total = docSlots.length;
          const booked = docSlots.filter(s => s.appointment && s.appointment.status !== 'CANCELLED').length;
          const free = total - booked;
          const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
          
          let pctColorClass = 'text-primary';
          let badgeBgClass = 'bg-primary-container';
          let badgeTextClass = 'text-on-primary-container';
          
          if (pct > 60) {
            pctColorClass = 'text-[var(--color-secondary)]';
            badgeBgClass = 'bg-secondary-container';
            badgeTextClass = 'text-on-secondary-container';
          }
          if (pct > 85) {
            pctColorClass = 'text-[var(--color-error)]';
            badgeBgClass = 'bg-error-container';
            badgeTextClass = 'text-on-error-container';
          }
          
          const isDental = doc.specialty === 'Stomatolog';
          const specName = isDental ? 'Stomatologiya' : doc.specialty;
          const icon = isDental ? 'dentistry' : 'hearing';
          
          html += `
            <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden min-h-[280px] group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              
              <div class="relative z-10">
                <!-- Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-headline-sm text-on-surface mb-1 text-lg">Dr. ${doc.firstName} ${doc.lastName}</h3>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeBgClass} ${badgeTextClass}">
                      <span class="material-symbols-outlined text-[14px]">${icon}</span> ${specName}
                    </span>
                  </div>
                  ${total > 0 ? `
                    <div class="text-right">
                      <span class="font-headline-sm ${pctColorClass}">${pct}%</span>
                      <div class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Bandlik</div>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Progress bar -->
                <div class="mb-6">
                  ${total > 0 ? `
                    <div class="w-full h-2 rounded-full bg-surface-container-high mb-2 overflow-hidden">
                      <div class="h-full bg-primary rounded-full" style="width: ${pct}%;"></div>
                    </div>
                    <div class="flex justify-between text-xs text-on-surface-variant font-medium">
                      <span>Qabul bandligi</span>
                      <span>${booked} / ${total} slot band</span>
                    </div>
                  ` : `
                    <div class="bg-surface-container border border-dashed border-outline-variant rounded-xl p-4 text-center text-on-surface-variant flex flex-col items-center gap-2 mt-4">
                      <span class="material-symbols-outlined text-3xl opacity-50">event_busy</span>
                      <span class="font-body-sm">Ushbu oy uchun jadval belgilanmagan</span>
                    </div>
                  `}
                </div>
              </div>
              
              <!-- Stats Row & Action Button -->
              <div class="relative z-10 mt-auto">
                <div class="grid grid-cols-3 gap-3 mb-5 bg-surface-container-low p-3 rounded-xl text-center">
                  <div>
                    <div class="font-headline-sm text-on-surface text-lg leading-none mb-1">${total}</div>
                    <div class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Jami slot</div>
                  </div>
                  <div>
                    <div class="font-headline-sm text-primary text-lg leading-none mb-1">${free}</div>
                    <div class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Bo'sh slot</div>
                  </div>
                  <div>
                    <div class="font-headline-sm ${booked > 0 ? 'text-on-surface' : 'text-on-surface-variant opacity-50'} text-lg leading-none mb-1">${booked}</div>
                    <div class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Band slot</div>
                  </div>
                </div>
                
                <button onclick="openDoctorSchedule('${doc.id}', 'Dr. ${doc.firstName} ${doc.lastName}')" class="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-full font-label-md hover:bg-primary-container transition-colors shadow-sm hover:shadow-md active:scale-95">
                  <span class="material-symbols-outlined text-[18px]">edit_calendar</span> Jadvalni boshqarish
                </button>
              </div>
            </div>
          `;
        }
        
        html += `</div>`;
        dashboard.innerHTML = html;
      } catch (err) {
        dashboard.innerHTML = '<div class="text-center p-10 text-error bg-error-container rounded-2xl border border-error/20 font-medium">Tarmoq xatosi. Iltimos, sahifani yangilang.</div>';
      }
    }

    async function loadAdminScheduleGrid() {
      if (!adminCurrentDoctorId) return;
      
      const container = document.getElementById('admin-grid-columns');
      container.innerHTML = `<div style="grid-column: 1 / span 8;">${adminLoaderDiv('Jadval yuklanmoqda...')}</div>`;
      
      try {
        const year = adminCalendarCurrentDate.getFullYear();
        const month = adminCalendarCurrentDate.getMonth();
        // Fetch slots from 1st of current month to end of next month (approx 60 days) to populate calendar and grid
        const rangeStart = new Date(year, month, 1);
        const rangeEnd = new Date(year, month + 2, 0);
        
        const data = await apiGet(`/api/admin/slots?doctorId=${adminCurrentDoctorId}&from=${rangeStart.toISOString()}&to=${rangeEnd.toISOString()}`);
        if (data.success) {
          adminAllSlots = data.slots;
          renderAdminCalendar();
          renderAdminGrid();
        }
      } catch (err) {
        container.innerHTML = '<div style="grid-column: 1 / span 8; text-align: center; padding: 40px; color: var(--red);">Yuklashda xatolik yuz berdi</div>';
      }
    }

    function renderAdminGrid() {
      const header = document.getElementById('admin-grid-header');
      const labels = document.getElementById('admin-time-labels');
      const columns = document.getElementById('admin-grid-columns');
      
      const days = [];
      const now = new Date();
      // Use Tashkent time (UTC+5) for correct day-of-week
      const tashkentNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      
      const baseDate = adminSelectedStartDate
        ? new Date(adminSelectedStartDate.getTime() + 5 * 60 * 60 * 1000)
        : tashkentNow;
      
      // Get Monday of the week containing baseDate (Tashkent day-of-week)
      const dayOfWeek = baseDate.getUTCDay(); // 0 = Sun, 1 = Mon
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      // Build Monday as a UTC midnight date for arithmetic
      const mondayUTC = new Date(Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate() + distanceToMonday
      ));

      for (let i = 0; i < 7; i++) {
        const d = new Date(mondayUTC.getTime() + i * 24 * 60 * 60 * 1000);
        days.push(d);
      }

      // Update copy dropdown dynamically
      const copySelect = document.getElementById('admin-copy-day-select');
      if (copySelect) {
        const prevVal = copySelect.value;
        copySelect.innerHTML = '<option value="">Kunni tanlang...</option>' + 
          days.filter(d => d.getUTCDay() !== 0).map(d => {
            const iso = getLocalISO(d);
            const displayDate = new Date(`${iso}T12:00:00+05:00`);
            const name = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][displayDate.getDay()];
            const dateStr = d.getUTCDate();
            const monthStr = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][displayDate.getMonth()];
            return `<option value="${iso}">${name} (${dateStr} ${monthStr})</option>`;
          }).join('');
        if (prevVal) copySelect.value = prevVal;
      }

      header.innerHTML = '<div class="weekly-header-cell" style="width:80px"></div>' + 
        days.map(d => {
          const iso = getLocalISO(d);
          const isToday = iso === getLocalISO(new Date());
          const isSunday = d.getUTCDay() === 0;
          
          const displayDate = new Date(`${iso}T12:00:00+05:00`);
          const sourceIso = copySelect ? copySelect.value : '';
          const showPaste = (adminCopiedSchedule !== null) && iso !== sourceIso && !isSunday;
          const pasteBtn = showPaste ? `
            <button onclick="adminPasteToDay('${iso}', event)" title="Nusxalangan jadvalni shu kunga joylash" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.3); padding:2px 6px; border-radius:6px; font-size:0.65rem; margin-top:5px; cursor:pointer; display:inline-block; transition:all 0.2s;" onmouseover="this.style.background='var(--teal)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">📥 Joylash</button>
          ` : '';

          return `
            <div class="weekly-header-cell ${isToday ? 'today' : ''} ${isSunday ? 'sunday-header' : ''}" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:80px; ${isSunday ? 'background:#f8fafc;' : ''}">
              <span class="day-name" style="${isSunday ? 'color:#94a3b8;' : ''}">${['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'][displayDate.getDay()]}</span>
              <span class="day-date" style="font-size:1.1rem; font-weight:700; margin-top:2px; ${isSunday ? 'color:#94a3b8;' : ''}">${d.getUTCDate()}</span>
              ${pasteBtn}
            </div>
          `;
        }).join('');

      const times = [];
      for (let h = ADMIN_START_HOUR; h <= ADMIN_END_HOUR; h++) {
        for (let m = 0; m < 60; m += ADMIN_INTERVAL) {
          const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push(t);
        }
      }
      labels.innerHTML = times.map(t => `<div class="time-cell">${t}</div>`).join('');

      columns.innerHTML = days.map(d => {
        const iso = getLocalISO(d);
        return `
          <div class="day-col">
            ${times.map(t => {
              const key = `${iso}_${t}`;
              const slotDateTime = parseTashkentDateTime(iso, t);
              const isPast = slotDateTime.getTime() < Date.now();

              const existing = adminAllSlots.find(s => {
                const sStart = new Date(s.startTime).getTime();
                const sEnd = sStart + s.duration * 60000;
                return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
              });
              
              const isSunday = d.getUTCDay() === 0;
              const isPastOrSunday = isPast || isSunday;
              
              let statusClass = '';
              let label = '';
              const isBooked = existing && existing.appointment && existing.appointment.status !== 'CANCELLED';
              if (existing) {
                statusClass = isBooked ? 'booked' : 'active';
                if (isBooked) label = '<span>Band</span>';
              }
              
              if (adminPendingChanges[key] === 'add') statusClass = 'pending';
              if (adminPendingChanges[key] === 'remove') statusClass = '';
              
              if (isPastOrSunday && !existing) {
                statusClass += ' disabled';
              }
              if (isSunday) {
                statusClass = 'disabled';
                label = '<span>-</span>';
              }

              const onClickAttr = isPastOrSunday ? '' : `onclick="toggleAdminSlot('${iso}', '${t}', '${existing ? existing.id : ''}', ${isBooked ? 'true' : 'false'})"`;

              return `
                <div class="grid-cell" ${onClickAttr} style="${isSunday ? 'background:#f8fafc;' : ''}">
                  <button class="slot-btn ${statusClass}" style="${isSunday ? 'opacity:0.4; cursor:not-allowed;' : ''}">${label}</button>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('');
    }

    function toggleAdminSlot(iso, time, existingId, isBooked) {
      if (isBooked) return;
      const key = `${iso}_${time}`;
      const action = adminPendingChanges[key];

      const existing = adminAllSlots.find(s => {
        const sStart = new Date(s.startTime).getTime();
        const slotDateTime = parseTashkentDateTime(iso, time).getTime();
        return slotDateTime === sStart;
      });

      if (existing) {
        if (action === 'remove') delete adminPendingChanges[key];
        else adminPendingChanges[key] = 'remove';
      } else {
        if (action === 'add') delete adminPendingChanges[key];
        else adminPendingChanges[key] = 'add';
      }
      renderAdminGrid();
    }

    async function saveAdminGridChanges() {
      const btn = document.getElementById('admin-btn-save-grid');
      const toCreate = [];
      const toDelete = [];

      for (const [key, action] of Object.entries(adminPendingChanges)) {
        const [iso, time] = key.split('_');
        const dt = parseTashkentDateTime(iso, time);
        
        if (action === 'add') {
          toCreate.push({ startTime: dt.toISOString(), duration: ADMIN_INTERVAL });
        } else if (action === 'remove') {
          const existing = adminAllSlots.find(s => {
            const sStart = new Date(s.startTime).getTime();
            return dt.getTime() === sStart;
          });
          if (existing && !toDelete.includes(existing.id)) toDelete.push(existing.id);
        }
      }

      // Har bir 30 daqiqalik vaqt alohida va mustaqil slot sifatida saqlanadi!
      const mergedCreate = toCreate;

      if (!mergedCreate.length && !toDelete.length) return;
      btn.disabled = true; btn.textContent = 'Saqlanmoqda...';

      try {
        const t = localStorage.getItem('admin_token');
        for (const id of toDelete) {
          await fetch('/api/doctor/slots', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` },
            body: JSON.stringify({ slotId: id, doctorId: adminCurrentDoctorId })
          });
        }
        if (mergedCreate.length) {
          await fetch('/api/doctor/slots', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` },
            body: JSON.stringify({ doctorId: adminCurrentDoctorId, slots: mergedCreate })
          });
        }
        adminPendingChanges = {};
        await loadAdminScheduleGrid();
        showToast("Muvaffaqiyatli saqlandi!", "success");
      } catch (e) { showToast("Xatolik yuz berdi", "error"); }
      btn.disabled = false; btn.textContent = 'Saqlash';
    }

    function renderAdminCalendar() {
      const label = document.getElementById('admin-cal-month-label');
      const grid = document.getElementById('admin-cal-days-grid');
      if (!label || !grid) return;
      
      const year = adminCalendarCurrentDate.getFullYear();
      const month = adminCalendarCurrentDate.getMonth();
      
      const monthNames = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
      ];
      label.textContent = `${monthNames[month]}, ${year}`;
      
      grid.innerHTML = '';
      
      // Build firstDay as UTC noon to avoid any timezone-day drift
      const firstDayUTC = new Date(Date.UTC(year, month, 1, 12, 0, 0));
      const startDow = firstDayUTC.getUTCDay(); // 0 = Sun, 1 = Mon ...
      const startDowIso = startDow === 0 ? 6 : startDow - 1;
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      
      // Render leading empty cells
      for (let i = 0; i < startDowIso; i++) {
        const empty = document.createElement('div');
        empty.style.height = '75px';
        grid.appendChild(empty);
      }
      
      const todayISO = getLocalISO(new Date());
      const todayStart = new Date();
      // Today start in UTC (compare against UTC midnight for date cells)
      const todayUTCStart = new Date(Date.UTC(
        new Date(Date.now() + 5*60*60*1000).getUTCFullYear(),
        new Date(Date.now() + 5*60*60*1000).getUTCMonth(),
        new Date(Date.now() + 5*60*60*1000).getUTCDate()
      ));
      
      // Render days of the month
      for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(Date.UTC(year, month, d));
        const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = iso === todayISO;
        const isSelected = adminSelectedStartDate && getLocalISO(adminSelectedStartDate) === iso;
        
        const isPastDay = cellDate < todayUTCStart;
        
        const daySlots = adminAllSlots.filter(s => getLocalISO(new Date(s.startTime)) === iso);
        const openSlots = daySlots.filter(s => s.isAvailable && new Date(s.startTime).getTime() > Date.now());
        const bookedSlots = daySlots.filter(s => !s.isAvailable || new Date(s.startTime).getTime() <= Date.now());
        
        const dayCard = document.createElement('div');
        dayCard.style.height = '75px';
        dayCard.style.borderRadius = '16px';
        dayCard.style.border = isSelected 
          ? '2.5px solid var(--teal)' 
          : (isToday ? '2.5px solid var(--navy)' : '1.5px solid var(--border)');
        dayCard.style.padding = '10px';
        dayCard.style.display = 'flex';
        dayCard.style.flexDirection = 'column';
        dayCard.style.justifyContent = 'space-between';
        dayCard.style.cursor = 'pointer';
        dayCard.style.transition = 'all 0.2s';
        dayCard.style.boxSizing = 'border-box';
        
        const numSpan = document.createElement('span');
        numSpan.style.fontWeight = '700';
        numSpan.style.fontSize = '0.95rem';
        numSpan.style.color = isToday ? 'var(--navy)' : 'var(--text-main)';
        numSpan.style.textAlign = 'left';
        numSpan.textContent = d;
        dayCard.appendChild(numSpan);
        
        const badge = document.createElement('div');
        badge.style.fontSize = '0.72rem';
        badge.style.fontWeight = '600';
        badge.style.borderRadius = '8px';
        badge.style.padding = '3px 6px';
        badge.style.textAlign = 'center';
        badge.style.marginTop = '4px';
        
        if (isPastDay) {
          dayCard.style.background = '#f1f5f9';
          dayCard.style.opacity = '0.65';
          badge.textContent = "O'tgan";
          badge.style.color = '#64748b';
          badge.style.background = '#e2e8f0';
        } else if (daySlots.length === 0) {
          dayCard.style.background = '#f8fafc';
          dayCard.style.borderStyle = 'dashed';
          badge.textContent = "Bo'sh";
          badge.style.color = '#94a3b8';
          badge.style.background = 'transparent';
        } else if (openSlots.length > 0) {
          dayCard.style.background = 'rgba(16,185,129,0.06)';
          badge.textContent = `🟢 ${openSlots.length} ta`;
          badge.style.color = '#10b981';
          badge.style.background = 'rgba(16,185,129,0.1)';
        } else {
          dayCard.style.background = 'rgba(59,130,246,0.06)';
          badge.textContent = `🔵 Band`;
          badge.style.color = '#3b82f6';
          badge.style.background = 'rgba(59,130,246,0.1)';
        }
        
        dayCard.onmouseover = () => {
          dayCard.style.transform = 'translateY(-2px)';
          if (!isSelected) dayCard.style.borderColor = 'var(--teal)';
        };
        dayCard.onmouseout = () => {
          dayCard.style.transform = 'none';
          if (!isSelected) {
            dayCard.style.borderColor = isToday ? 'var(--navy)' : 'var(--border)';
          }
        };
        
        dayCard.onclick = () => {
          adminSelectedStartDate = cellDate;
          renderAdminCalendar();
          renderAdminGrid();
        };
        
        dayCard.appendChild(badge);
        grid.appendChild(dayCard);
      }
    }

    function navAdminCalendarMonth(dir) {
      adminCalendarCurrentDate.setMonth(adminCalendarCurrentDate.getMonth() + dir);
      adminSelectedStartDate = null; // reset selected day when changing months
      loadAdminScheduleGrid();
    }

    async function adminAutoFillEntireMonth() {
      if (!adminCurrentDoctorId) {
        showToast("Iltimos, avval shifokorni tanlang!", "error");
        return;
      }
      
      const confirmFill = confirm("Ushbu oy uchun dushanba-shanba kunlariga soat 9:00 dan 18:00 gacha (13:00-14:00 tushlikdan tashqari) avtomatik ish vaqti yaratilsinmi?");
      if (!confirmFill) return;
      
      const year = adminCalendarCurrentDate.getFullYear();
      const month = adminCalendarCurrentDate.getMonth();
      
      // Get Tashkent today for fromDate calculation
      const tashkentNowFill = new Date(Date.now() + 5 * 60 * 60 * 1000);
      const startOf = new Date(Date.UTC(year, month, 1));
      const endOf = new Date(Date.UTC(year, month + 1, 0));
      const todayUTC = new Date(Date.UTC(tashkentNowFill.getUTCFullYear(), tashkentNowFill.getUTCMonth(), tashkentNowFill.getUTCDate()));
      
      const fromBase = startOf < todayUTC ? todayUTC : startOf;
      const fromDateStr = `${fromBase.getUTCFullYear()}-${String(fromBase.getUTCMonth()+1).padStart(2,'0')}-${String(fromBase.getUTCDate()).padStart(2,'0')}`;
      const toDateStr = `${endOf.getUTCFullYear()}-${String(endOf.getUTCMonth()+1).padStart(2,'0')}-${String(endOf.getUTCDate()).padStart(2,'0')}`;
      
      const adminTokenVal = localStorage.getItem('admin_token');
      
      try {
        showToast("Jadval yaratilmoqda, iltimos kuting...", "info");
        
        const res1 = await fetch('/api/admin/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminTokenVal}` },
          body: JSON.stringify({
            doctorId: adminCurrentDoctorId,
            bulk: true,
            days: [1, 2, 3, 4, 5, 6],
            startHour: 9,
            endHour: 13,
            interval: 30,
            fromDate: fromDateStr,
            toDate: toDateStr
          })
        });
        
        const res2 = await fetch('/api/admin/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminTokenVal}` },
          body: JSON.stringify({
            doctorId: adminCurrentDoctorId,
            bulk: true,
            days: [1, 2, 3, 4, 5, 6],
            startHour: 14,
            endHour: 18,
            interval: 30,
            fromDate: fromDateStr,
            toDate: toDateStr
          })
        });
        
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        if (res1.ok && res2.ok) {
          const totalCreated = (data1.created || 0) + (data2.created || 0);
          showToast(`Butun oy uchun ${totalCreated} ta yangi ish vaqtlari muvaffaqiyatli yaratildi!`, "success");
          await loadAdminScheduleGrid();
        } else {
          showToast("Jadval yaratishda xatolik yuz berdi", "error");
        }
      } catch (e) {
        showToast("Tarmoq xatosi yuz berdi", "error");
      }
    }

    function adminAutoFillFromClinicSchedule() {
      if (!adminCurrentDoctorId) {
        showToast("Iltimos, avval shifokorni tanlang!", "error");
        return;
      }

      const days = [];
      const now = new Date();
      // Use Tashkent UTC offset for correct day calculation
      const tashkentNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const tashkentToday = new Date(Date.UTC(tashkentNow.getUTCFullYear(), tashkentNow.getUTCMonth(), tashkentNow.getUTCDate()));
      for (let i = 0; i < 7; i++) {
        const d = new Date(tashkentToday.getTime() + i * 24 * 60 * 60 * 1000);
        days.push(d);
      }

      const times = [];
      // Monday to Saturday: 9:00 - 18:00
      // Lunch break: 13:00 - 14:00 (no slots starting at 13:00 or 13:30)
      for (let h = 9; h < 18; h++) {
        if (h === 13) continue; // Skip lunch hour 13:00 - 14:00
        for (let m = 0; m < 60; m += ADMIN_INTERVAL) {
          const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push(t);
        }
      }

      let addedCount = 0;

      for (const d of days) {
        const dayOfWeek = d.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
        if (dayOfWeek === 0) continue; // Skip Sunday (Yakshanba)

        const iso = getLocalISO(d);

        for (const t of times) {
          const key = `${iso}_${t}`;
          const slotDateTime = parseTashkentDateTime(iso, t);

          if (slotDateTime.getTime() < Date.now()) continue; // Skip past times

          const existing = adminAllSlots.find(s => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = sStart + s.duration * 60000;
            return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
          });

          if (existing && existing.appointment) continue; // Don't touch booked times

          if (!existing) {
            adminPendingChanges[key] = 'add';
            addedCount++;
          }
        }
      }

      renderAdminGrid();
      showToast(`Klinika jadvali bo'yicha ${addedCount} ta yangi slot qo'shildi! Tasdiqlash uchun 'Saqlash' tugmasini bosing.`, "success");
    }

    function adminCopySelectedDay() {
      const isoDate = document.getElementById('admin-copy-day-select').value;
      if (!isoDate) {
        showToast("Iltimos, nusxalash uchun kunni tanlang!", "error");
        return;
      }

      const select = document.getElementById('admin-copy-day-select');
      adminCopiedDayLabel = select.options[select.selectedIndex].text;

      const times = [];
      for (let h = ADMIN_START_HOUR; h <= ADMIN_END_HOUR; h++) {
        for (let m = 0; m < 60; m += ADMIN_INTERVAL) {
          const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push(t);
        }
      }

      adminCopiedSchedule = [];
      for (const t of times) {
        const key = `${isoDate}_${t}`;
        const slotDateTime = parseTashkentDateTime(isoDate, t);

        const existing = adminAllSlots.find(s => {
          const sStart = new Date(s.startTime).getTime();
          const sEnd = sStart + s.duration * 60000;
          return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
        });

        const action = adminPendingChanges[key];
        let isOpen = false;

        if (existing) {
          if (action !== 'remove' && !existing.appointment) isOpen = true;
        } else {
          if (action === 'add') isOpen = true;
        }

        if (isOpen) {
          adminCopiedSchedule.push(t);
        }
      }

      document.getElementById('admin-copied-status-msg').textContent = `📋 ${adminCopiedDayLabel} nusxalandi (${adminCopiedSchedule.length} ta ochiq soat)`;
      document.getElementById('admin-paste-actions-wrap').style.display = 'flex';
      renderAdminGrid();
    }

    function adminApplyToAllDays() {
      if (!adminCopiedSchedule) return;
      
      const days = [];
      const now = new Date();
      const tzOffset = 5 * 60 * 60 * 1000;
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const tashkentNow = new Date(utcMs + tzOffset);
      for (let i = 0; i < 7; i++) {
        const d = new Date(tashkentNow.getTime() + i * 24 * 60 * 60 * 1000);
        days.push(d);
      }

      const times = [];
      for (let h = ADMIN_START_HOUR; h <= ADMIN_END_HOUR; h++) {
        for (let m = 0; m < 60; m += ADMIN_INTERVAL) {
          const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push(t);
        }
      }

      const sourceIso = document.getElementById('admin-copy-day-select').value;

      for (const d of days) {
        if (d.getUTCDay() === 0) continue; // Skip Sunday (Yakshanba)
        const iso = getLocalISO(d);
        if (iso === sourceIso) continue;

        for (const t of times) {
          const key = `${iso}_${t}`;
          const slotDateTime = parseTashkentDateTime(iso, t);
          
          if (slotDateTime.getTime() < Date.now()) continue;

          const existing = adminAllSlots.find(s => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = sStart + s.duration * 60000;
            return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
          });

          if (existing && existing.appointment) continue;

          const shouldBeOpen = adminCopiedSchedule.includes(t);

          if (shouldBeOpen) {
            if (existing) {
              if (adminPendingChanges[key] === 'remove') delete adminPendingChanges[key];
            } else {
              adminPendingChanges[key] = 'add';
            }
          } else {
            if (existing) {
              adminPendingChanges[key] = 'remove';
            } else {
              if (adminPendingChanges[key] === 'add') delete adminPendingChanges[key];
            }
          }
        }
      }

      renderAdminGrid();
      showToast("Nusxalangan shablon haftadagi barcha kunlarga qo'llandi! Tasdiqlash uchun pastdagi 'Saqlash' tugmasini bosing.", "info");
    }

    function adminPasteToDay(targetIso, event) {
      if (event) event.stopPropagation();
      if (!adminCopiedSchedule) return;

      // Parse as UTC midnight (our days are built as UTC midnight objects)
      const targetDate = new Date(targetIso + 'T00:00:00Z');
      if (targetDate.getUTCDay() === 0) {
        showToast("Yakshanba kuni dam olish kuni, jadval nusxalab bo'lmaydi!", "error");
        return;
      }

      const times = [];
      for (let h = ADMIN_START_HOUR; h <= ADMIN_END_HOUR; h++) {
        for (let m = 0; m < 60; m += ADMIN_INTERVAL) {
          const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          times.push(t);
        }
      }

      for (const t of times) {
        const key = `${targetIso}_${t}`;
        const slotDateTime = parseTashkentDateTime(targetIso, t);
        
        if (slotDateTime.getTime() < Date.now()) continue;

        const existing = adminAllSlots.find(s => {
          const sStart = new Date(s.startTime).getTime();
          const sEnd = sStart + s.duration * 60000;
          return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
        });

        if (existing && existing.appointment) continue;

        const shouldBeOpen = adminCopiedSchedule.includes(t);

        if (shouldBeOpen) {
          if (existing) {
            if (adminPendingChanges[key] === 'remove') delete adminPendingChanges[key];
          } else {
            adminPendingChanges[key] = 'add';
          }
        } else {
          if (existing) {
            adminPendingChanges[key] = 'remove';
          } else {
            if (adminPendingChanges[key] === 'add') delete adminPendingChanges[key];
          }
        }
      }

      renderAdminGrid();
    }

    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      let icon = '✨';
      if (type === 'success') icon = '✅';
      else if (type === 'error') icon = '❌';
      else if (type === 'info') icon = 'ℹ️';

      toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      `;

      container.appendChild(toast);

      // Trigger animation
      setTimeout(() => toast.classList.add('show'), 10);

      // Auto dismiss
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    }

    function adminCancelCopyState() {
      adminCopiedSchedule = null;
      adminCopiedDayLabel = '';
      const select = document.getElementById('admin-copy-day-select');
      if (select) select.value = '';
      const wrap = document.getElementById('admin-paste-actions-wrap');
      if (wrap) wrap.style.display = 'none';
      renderAdminGrid();
    }
  
