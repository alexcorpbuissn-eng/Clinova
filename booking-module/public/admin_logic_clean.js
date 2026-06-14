
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

          tbody.innerHTML = grouped.map((g, idx) => `
            <tr>
              <td>
                <span class="badge badge-scheduled" style="font-size: 0.85rem; padding: 6px 12px; background: #e0f2fe; color: #0369a1;">
                  ${g.specialty === 'Stomatolog' ? 'Stomatologiya' : g.specialty}
                </span>
              </td>
              <td><strong>${g.name}</strong></td>
              <td>${g.durationMinutes} min</td>
              <td>
                <input type="number" id="price-group-${idx}" value="${g.price}" style="padding:8px; border:1px solid var(--border); border-radius:6px; width:120px;" /> so'm
              </td>
              <td>
                <button onclick="saveGroupedProcedurePrice('${g.id}', ${idx})" class="btn" style="padding:8px 12px; font-size:0.8rem; width:auto;">Saqlash</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Xatolik yuz berdi</td></tr>';
      }
    }

    async function saveGroupedProcedurePrice(id, idx) {
      const priceStr = document.getElementById(`price-group-${idx}`).value;
      const price = parseInt(priceStr, 10);
      if (isNaN(price) || price < 0) {
        alert("Noto'g'ri narx kiritildi!");
        return;
      }
      try {
        const res = await fetch(`/api/admin/procedures/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: JSON.stringify({ price })
        });
        if (res.ok) {
          alert("Narx barcha shifokorlar uchun saqlandi!");
          loadProcedures();
        } else {
          alert("Saqlashda xatolik!");
        }
      } catch (e) {
        alert("Tarmoq xatosi!");
      }
    }

    const API = '';
    
    // Auth Check on load — verify token with server, don't just trust localStorage
    async function verifyAuthOnLoad() {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return; // no token, stay on login screen
        const res = await fetch('/api/admin/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showDashboard();
        } else {
          localStorage.removeItem('admin_token');
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
      if (tab === 'patients') loadPatients();
      if (tab === 'doctors') loadDoctors();
      if (tab === 'users') loadUsers();
      if (tab === 'procedures') loadProcedures();
      if (tab === 'schedule') loadScheduleTab();
      if (tab === 'leaves') loadLeaves();
      if (tab === 'purchases') loadPurchases();
    }

    // ---- PURCHASES (SKLAD) ----
    async function loadPurchases() {
      const tbody = document.getElementById('purchases-tbody');
      if(!tbody) return;
      tbody.innerHTML = adminLoaderHTML(6, 'Xarajatlar yuklanmoqda...');
      try {
        const data = await apiGet('/api/inventory/purchases');
        if (data.success) {
          if (data.purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Hech qanday xarajat kiritilmagan</td></tr>';
            return;
          }
          tbody.innerHTML = data.purchases.map(p => `
            <tr>
              <td>${new Date(p.createdAt).toLocaleString('ru-RU')}</td>
              <td><div style="font-weight:600; color:var(--navy);">${p.itemName}</div></td>
              <td>${p.sellerName}</td>
              <td><span style="font-weight:700; color:var(--teal);">${p.price.toLocaleString('ru-RU')} so'm</span></td>
              <td><span style="font-size:0.8rem; color:var(--text-muted);">${p.recordedBy || 'Noma\'lum'}</span></td>
              <td>
                <button class="btn" style="background:var(--red-bg); color:var(--red); padding:6px 12px; font-size:0.8rem; width:auto;" onclick="deletePurchase('${p.id}')">
                  <i class="fas fa-trash"></i> O'chirish
                </button>
              </td>
            </tr>
          `).join('');
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:var(--red); text-align:center;">Xato yuz berdi</td></tr>';
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
      tbody.innerHTML = adminLoaderHTML(6, 'Dam olish ro\'yxati yuklanmoqda...');
      try {
        const data = await apiGet('/api/admin/leaves');
        if (data.success) {
          if (data.leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Hech qanday dam olish kiritilmagan</td></tr>';
            return;
          }
          tbody.innerHTML = data.leaves.map(l => `
            <tr>
              <td><div style="font-weight:600; color:var(--navy);">${l.doctor.firstName} ${l.doctor.lastName}</div></td>
              <td>${new Date(l.startTime).toLocaleString('ru-RU')}</td>
              <td>${new Date(l.endTime).toLocaleString('ru-RU')}</td>
              <td>${l.reason || '-'}</td>
              <td><span style="font-size:0.8rem; color:var(--text-muted);">${new Date(l.createdAt).toLocaleDateString('ru-RU')}</span></td>
              <td>
                <button class="btn" style="background:var(--red-bg); color:var(--red); padding:6px 12px; font-size:0.8rem; width:auto;" onclick="deleteLeave('${l.id}')">Bekor qilish</button>
              </td>
            </tr>
          `).join('');
        }
      } catch(e) {}
    }

    async function openLeaveModal() {
      document.getElementById('leave-start').value = '';
      document.getElementById('leave-end').value = '';
      document.getElementById('leave-reason').value = '';
      
      const select = document.getElementById('leave-doc-select');
      select.innerHTML = '<option value="">Yuklanmoqda...</option>';
      document.getElementById('leave-modal').style.display = 'flex';
      
      try {
        const data = await apiGet('/api/admin/doctors');
        if (data.success) {
          select.innerHTML = '<option value="">Shifokor...</option>' + 
            data.doctors.map(d => `<option value="${d.id}">${d.firstName} ${d.lastName} (${d.specialty})</option>`).join('');
        }
      } catch(e) {}
    }

    function closeLeaveModal() {
      document.getElementById('leave-modal').style.display = 'none';
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
            body: JSON.stringify({ firstName, lastName, specialty, bio, photoUrl, telegramUsername })
          }).then(r => r.json());
        } else {
          res = await apiPost('/api/admin/doctors', { firstName, lastName, specialty, bio, photoUrl, telegramUsername });
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
      const loadingCol = adminLoaderHTML(8, 'Shifokorlar yuklanmoqda...');
      tbodyStom.innerHTML = loadingCol;
      tbodyLor.innerHTML = loadingCol;
      try {
        const data = await apiGet('/api/admin/stats');
        if (data.success) {
          const fmt = (n) => n.toLocaleString('uz-UZ') + ' so\'m';
          const stomatologs = data.stats.filter(d => d.specialty.toLowerCase().includes('stomatolog'));
          const lors = data.stats.filter(d => d.specialty.toLowerCase().includes('lor'));

          const renderRow = d => `
            <tr>
              <td>
                <strong>${d.firstName} ${d.lastName}</strong>
                ${!d.isActive ? '<span style="color:red;font-size:0.8em;display:block;">(Nofaol)</span>' : ''}
              </td>
              <td style="text-align:center">${d.daily}</td>
              <td style="text-align:center">${d.weekly}</td>
              <td style="text-align:center">${d.monthly}</td>
              <td style="text-align:center; font-weight:600">${d.totalPatients}</td>
              <td style="color:var(--teal-dark);font-weight:600">${fmt(d.monthlyRevenue)}</td>
              <td style="color:var(--navy);font-weight:600">${fmt(d.yearlyRevenue)}</td>
              <td style="text-align:center">
                <button onclick="openDoctorModal('${encodeURIComponent(JSON.stringify(d))}')" style="color:var(--blue); font-size:1.2rem; margin-right:8px; background:none; border:none; cursor:pointer;" title="Tahrirlash">✏️</button>
                <button onclick="showHistory('${d.firstName} ${d.lastName}', '${encodeURIComponent(JSON.stringify(d.monthlyHistory))}')" style="color:var(--teal); font-size:1.2rem; margin-right:8px; background:none; border:none; cursor:pointer;" title="Tarix">📅</button>
                <button onclick="toggleDoctorStatus('${d.id}', ${!d.isActive})" style="color:${d.isActive ? 'var(--red)' : 'var(--teal)'}; font-size:1.2rem; background:none; border:none; cursor:pointer;" title="${d.isActive ? 'Ochirish' : 'Faollashtirish'}">
                  ${d.isActive ? '❌' : '✅'}
                </button>
              </td>
            </tr>
          `;

          tbodyStom.innerHTML = stomatologs.length ? stomatologs.map(renderRow).join('') : '<tr><td colspan="8" style="text-align:center">Shifokor topilmadi</td></tr>';
          tbodyLor.innerHTML = lors.length ? lors.map(renderRow).join('') : '<tr><td colspan="8" style="text-align:center">Shifokor topilmadi</td></tr>';
        }
      } catch (err) {
        if(err.message !== 'Unauthorized') {
          tbodyStom.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red">Xatolik</td></tr>';
          tbodyLor.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red">Xatolik</td></tr>';
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

            tbody.innerHTML = data.users.map(u => `
              <tr>
                <td>
                  <strong>${u.name || 'Noma\'lum (Bemor emas)'}</strong><br>
                  <small style="color:var(--text-muted)">${u.telegramPhone}</small>
                </td>
                <td><span class="badge ${u.role === 'ADMIN' ? 'badge-cancelled' : u.role === 'DOCTOR' ? 'badge-scheduled' : 'badge-completed'}">${u.role}</span></td>
                <td>${u.doctorId && doctorMap[u.doctorId] ? doctorMap[u.doctorId] : (u.doctorId || '-')}</td>
                <td>${new Date(u.createdAt).toLocaleString('uz-UZ')}</td>
                <td>
                  <button onclick="assignDoctor('${u.id}')" style="color:var(--teal); background:none; border:none; cursor:pointer; font-weight:600; margin-right:10px">Bog'lash</button>
                  <button onclick="deleteUser('${u.id}')" style="color:var(--red); background:none; border:none; cursor:pointer; font-weight:600">O'chirish</button>
                </td>
              </tr>
            `).join('');
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

    async function loadScheduleTab() {
      const select = document.getElementById('schedule-doc-select');
      select.innerHTML = '<option value="">Shifokor yuklanmoqda...</option>';
      try {
        const data = await apiGet('/api/admin/doctors');
        if (data.success) {
          select.innerHTML = '<option value="">Shifokor tanlang...</option>' +
            data.doctors.map(d => `<option value="${d.id}" ${adminCurrentDoctorId === d.id ? 'selected' : ''}>Dr. ${d.firstName} ${d.lastName} (${d.specialty})</option>`).join('');
          
          if (adminCurrentDoctorId) {
            document.getElementById('admin-schedule-overview-dashboard').style.display = 'none';
            document.getElementById('admin-month-calendar-wrap').style.display = 'block';
            document.getElementById('admin-schedule-container').style.display = 'block';
            loadAdminScheduleGrid();
          } else {
            document.getElementById('admin-schedule-overview-dashboard').style.display = 'block';
            document.getElementById('admin-month-calendar-wrap').style.display = 'none';
            document.getElementById('admin-schedule-container').style.display = 'none';
            loadAdminScheduleDashboard();
          }
        }
      } catch (err) {
        select.innerHTML = '<option value="">Yuklashda xatolik</option>';
      }
    }

    function switchScheduleDoctor(docId) {
      adminCurrentDoctorId = docId || null;
      adminPendingChanges = {};
      adminCancelCopyState();
      
      if (adminCurrentDoctorId) {
        document.getElementById('admin-schedule-overview-dashboard').style.display = 'none';
        document.getElementById('admin-month-calendar-wrap').style.display = 'block';
        document.getElementById('admin-schedule-container').style.display = 'block';
        loadAdminScheduleGrid();
      } else {
        document.getElementById('admin-schedule-overview-dashboard').style.display = 'block';
        document.getElementById('admin-month-calendar-wrap').style.display = 'none';
        document.getElementById('admin-schedule-container').style.display = 'none';
        loadAdminScheduleDashboard();
      }
    }

    async function loadAdminScheduleDashboard() {
      const dashboard = document.getElementById('admin-schedule-overview-dashboard');
      if (!dashboard) return;
      
      dashboard.innerHTML = `
        <div style="background:#fff; border-radius:20px; border:1.5px solid var(--border); overflow:hidden;">
          ${adminLoaderDiv('Umumiy jadval statistikasi yuklanmoqda...')}
          <div class="admin-skeleton" style="padding: 12px 24px 24px;">
            <div class="admin-skeleton-row"><div class="admin-skeleton-bar" style="width:100%; height:60px; border-radius:12px;"></div></div>
            <div class="admin-skeleton-row" style="gap:12px;"><div class="admin-skeleton-bar" style="width:33%; height:50px; border-radius:10px;"></div><div class="admin-skeleton-bar" style="width:33%; height:50px; border-radius:10px;"></div><div class="admin-skeleton-bar" style="width:33%; height:50px; border-radius:10px;"></div></div>
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
          dashboard.innerHTML = '<div style="text-align:center; padding:40px; color:var(--red); background:#fff; border-radius:20px; border:1.5px solid var(--border);">Statistikani yuklab bo\'lmadi</div>';
          return;
        }
        
        const doctors = docsData.doctors;
        const slots = slotsData.slots;
        const nowMonthName = new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
        
        if (doctors.length === 0) {
          dashboard.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted); background:#fff; border-radius:20px; border:1.5px solid var(--border);">Shifokorlar topilmadi</div>';
          return;
        }
        
        let html = `
          <div style="margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
              <h2 style="font-size: 1.4rem; color: var(--navy); margin-bottom: 6px;">📊 Shifokorlar ish yuklamasi</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem;">${nowMonthName} oyi uchun shifokorlar jadvali va bandlik darajasi bo'yicha umumiy ko'rinish.</p>
            </div>
            <button onclick="loadAdminScheduleDashboard()" class="btn" style="width:auto; background:none; border:1.5px solid var(--border); color:var(--navy); padding:8px 16px; border-radius:10px; font-weight:600; display:flex; align-items:center; gap:8px;">🔄 Yangilash</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        `;
        
        for (const doc of doctors) {
          const docSlots = slots.filter(s => s.doctorId === doc.id);
          const total = docSlots.length;
          const booked = docSlots.filter(s => s.appointment && s.appointment.status !== 'CANCELLED').length;
          const free = total - booked;
          const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
          
          let pctColor = 'var(--teal)';
          let badgeBg = 'var(--teal-light)';
          let badgeText = 'var(--teal-dark)';
          if (pct > 60) {
            pctColor = '#3b82f6';
            badgeBg = '#eff6ff';
            badgeText = '#1d4ed8';
          }
          if (pct > 85) {
            pctColor = '#8b5cf6';
            badgeBg = '#f5f3ff';
            badgeText = '#6d28d9';
          }
          
          const progressBg = total > 0 ? `linear-gradient(to right, ${pctColor} ${pct}%, #f1f5f9 ${pct}%)` : '#f1f5f9';
          
          html += `
            <div style="background: #fff; border: 1.5px solid var(--border); border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.2s; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; min-height: 260px;" onmouseover="this.style.borderColor='var(--teal)'; this.style.boxShadow='0 10px 30px rgba(13,148,136,0.06)';" onmouseout="this.style.borderColor='var(--border)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.02)';">
              <div>
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Dr. ${doc.firstName} ${doc.lastName}</h3>
                    <span style="font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; background: ${badgeBg}; color: ${badgeText}; display: inline-block;">
                      ${doc.specialty === 'Stomatolog' ? 'Stomatologiya' : doc.specialty}
                    </span>
                  </div>
                  ${total > 0 ? `
                    <div style="text-align: right;">
                      <span style="font-size: 1.3rem; font-weight: 700; color: ${pctColor};">${pct}%</span>
                      <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Bandlik</div>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Progress bar -->
                <div style="margin-bottom: 24px;">
                  ${total > 0 ? `
                    <div style="width: 100%; height: 8px; border-radius: 4px; background: ${progressBg}; margin-bottom: 8px;"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                      <span>Qabul bandligi</span>
                      <span>${booked} / ${total} slot band</span>
                    </div>
                  ` : `
                    <div style="background: #f8fafc; border: 1px dashed var(--border); border-radius: 12px; padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">
                      📭 Ushbu oy uchun jadval belgilanmagan
                    </div>
                  `}
                </div>
              </div>
              
              <!-- Stats Row & Action Button -->
              <div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center;">
                  <div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--navy);">${total}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Jami slot</div>
                  </div>
                  <div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--teal-dark);">${free}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Bo'sh slot</div>
                  </div>
                  <div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: ${booked > 0 ? 'var(--navy)' : 'var(--text-muted)'};">${booked}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Band slot</div>
                  </div>
                </div>
                
                <button onclick="selectDoctorFromDashboard('${doc.id}')" class="btn" style="background: var(--navy); color: #fff; border: none; border-radius: 12px; padding: 12px; font-size: 0.85rem; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.background='var(--teal)'" onmouseout="this.style.background='var(--navy)'">
                  🗓️ Jadvalni boshqarish
                </button>
              </div>
            </div>
          `;
        }
        
        html += `</div>`;
        dashboard.innerHTML = html;
      } catch (err) {
        dashboard.innerHTML = '<div style="text-align:center; padding:40px; color:var(--red); background:#fff; border-radius:20px; border:1.5px solid var(--border);">Xatolik yuz berdi. Iltimos qayta urunib ko\'ring.</div>';
      }
    }

    function selectDoctorFromDashboard(docId) {
      const select = document.getElementById('schedule-doc-select');
      if (select) {
        select.value = docId;
        switchScheduleDoctor(docId);
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
            const name = displayDate.toLocaleDateString('uz-UZ', { weekday: 'long', timeZone: 'Asia/Tashkent' });
            const dateStr = d.getUTCDate();
            const monthStr = displayDate.toLocaleDateString('uz-UZ', { month: 'short', timeZone: 'Asia/Tashkent' });
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
              <span class="day-name" style="${isSunday ? 'color:#94a3b8;' : ''}">${displayDate.toLocaleDateString('uz-UZ', { weekday: 'short', timeZone: 'Asia/Tashkent' })}</span>
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
  
