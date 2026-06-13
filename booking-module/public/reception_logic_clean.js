const API = '';
  let adminToken = null;
  let visitSource = 'WALKIN';
  let doctorsList = [];
  let selectedSlotId = null;

  // --- Custom Confirm Logic ---
  let confirmCallback = null;
  function showConfirm(title, message, icon, confirmText, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-icon').textContent = icon || '⚠️';
    document.getElementById('btn-confirm-yes').textContent = confirmText || 'Tasdiqlash';
    
    confirmCallback = callback;
    document.getElementById('confirm-modal').style.display = 'flex';
  }
  function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    confirmCallback = null;
  }
  document.getElementById('btn-confirm-yes').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
  });

  // --- Cancel Reason Modal Logic ---
  let cancelReasonCallback = null;
  function showCancelReason(callback) {
    document.getElementById('cancel-reason-input').value = '';
    document.getElementById('cancel-reason-err').style.display = 'none';
    cancelReasonCallback = callback;
    document.getElementById('cancel-reason-modal').style.display = 'flex';
  }
  function closeCancelReasonModal() {
    document.getElementById('cancel-reason-modal').style.display = 'none';
    cancelReasonCallback = null;
  }
  function submitCancelWithReason() {
    const reason = document.getElementById('cancel-reason-input').value.trim();
    if (!reason) {
      document.getElementById('cancel-reason-err').style.display = 'block';
      return;
    }
    if (cancelReasonCallback) cancelReasonCallback(reason);
    closeCancelReasonModal();
  }

  // ── Date/Time setup ─────────────────────────────────────────────
  let serviceSelectInstance = null;
  function initServiceSelect() {
    if (serviceSelectInstance) serviceSelectInstance.destroy();
    serviceSelectInstance = new TomSelect('#f-service', {
      create: false,
      plugins: ['remove_button'],
      sortField: { field: "text", direction: "asc" },
      placeholder: "Xizmatlarni tanlang..."
    });
  }

  let startPicker, endPicker, reschedulePicker;
  function initDatePicker() {
    startPicker = flatpickr("#f-start-date", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      defaultDate: new Date()
    });
    endPicker = flatpickr("#f-end-date", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      defaultDate: new Date(Date.now() + 30 * 60000) // +30 min default
    });
    reschedulePicker = flatpickr("#reschedule-date", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      defaultDate: new Date(Date.now() + 24 * 60 * 60000) // Tomorrow default
    });
  }

  function setDefaultDate() {
    if (startPicker) startPicker.setDate(new Date());
    if (endPicker) endPicker.setDate(new Date(Date.now() + 30 * 60000));
  }

  function updateClock() {
    const now = new Date();
    document.getElementById('top-date').textContent = now.toLocaleString('uz-UZ', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent'
    });
  }

  // ── Auth ─────────────────────────────────────────────────────────
  async function verifyAuthOnLoad() {
    const t = localStorage.getItem('reception_token');
    if (!t) return;
    try {
      const res = await fetch('/api/admin/visits', { headers: { 'Authorization': `Bearer ${t}` } });
      if (res.ok) { adminToken = t; showApp(); }
      else localStorage.removeItem('reception_token');
    } catch {}
  }

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
    btn.textContent = 'Yuborilmoqda...'; btn.disabled = true;
    try {
      const res = await fetch('/api/public/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramPhone: phone })
      });
      const data = await res.json();
      if (res.ok && (data.success || data.action)) {
        if (data.action === 'deep_link') {
          errEl.innerHTML = `Avval bot orqali ro'yxatdan o'ting: <a href="${data.deepLink}" target="_blank" style="color:var(--teal);text-decoration:underline;">Botga o'tish</a>`;
        } else {
          document.getElementById('phone-form').style.display = 'none';
          document.getElementById('otp-form').style.display = 'block';
        }
      } else { errEl.textContent = data.error || 'Xatolik'; }
    } catch { errEl.textContent = 'Tarmoq xatosi'; }
    btn.textContent = 'Kodni Olish'; btn.disabled = false;
  });

  document.getElementById('otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('telegram-phone').value;
    const code = document.getElementById('otp-code').value;
    const errEl = document.getElementById('login-err');
    const btn = document.getElementById('btn-otp');
    errEl.textContent = '';
    btn.textContent = 'Tekshirilmoqda...'; btn.disabled = true;
    try {
      const res = await fetch('/api/public/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramPhone: phone, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('reception_token', data.token);
          adminToken = data.token;
          showApp();
        } else {
          errEl.textContent = "Sizda admin huquqi yo'q!";
        }
      } else { errEl.textContent = data.error || 'Xatolik'; }
    } catch { errEl.textContent = 'Tarmoq xatosi'; }
    btn.textContent = 'Kirish'; btn.disabled = false;
  });

  function logout() {
    localStorage.removeItem('reception_token');
    adminToken = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('phone-form').style.display = '';
    document.getElementById('otp-form').style.display = 'none';
    document.getElementById('otp-code').value = '';
  }

  async function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initDatePicker();
    initServiceSelect();
    updateClock();
    setInterval(updateClock, 30000);
    setInterval(pollAppointments, 30000); // Smart polling
    await loadDoctors();
    await loadAppointments();
    await loadIssues();
    await loadActiveVisits();
    await loadVisits();
    await loadAllPatientsForAutocomplete();

    // Initialize auto-formatting mask for patient phone
    const fPhone = document.getElementById('f-phone');
    if (fPhone) {
      fPhone.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
        if (!x[1]) {
          e.target.value = '+998 ';
          return;
        }
        if (x[1] !== '998') {
          x[1] = '998';
        }
        let val = '+998';
        if (x[2]) val += ' ' + x[2];
        if (x[3]) val += ' ' + x[3];
        if (x[4]) val += ' ' + x[4];
        if (x[5]) val += ' ' + x[5];
        e.target.value = val;
      });

      fPhone.addEventListener('focus', function(e) {
        if (!e.target.value) {
          e.target.value = '+998 ';
        }
      });
    }

    const fTgPhone = document.getElementById('f-tg-phone');
    if (fTgPhone) {
      fTgPhone.addEventListener('input', function(e) {
        let valStr = e.target.value;
        if (!valStr) return;
        let x = valStr.replace(/\D/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
        if (!x[1]) {
          e.target.value = '';
          return;
        }
        if (x[1] !== '998') {
          x[1] = '998';
        }
        let val = '+998';
        if (x[2]) val += ' ' + x[2];
        if (x[3]) val += ' ' + x[3];
        if (x[4]) val += ' ' + x[4];
        if (x[5]) val += ' ' + x[5];
        e.target.value = val;
      });

      fTgPhone.addEventListener('focus', function(e) {
        if (!e.target.value) {
          e.target.value = '+998 ';
        }
      });
    }
  }

  let lastApptFetchTime = new Date().toISOString();

  async function pollAppointments() {
    try {
      const res = await fetch(`/api/admin/appointments?since=${lastApptFetchTime}`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (data.success && data.appointments && data.appointments.length > 0) {
        showToast(`Yangi ${data.appointments.length} ta qabul yozildi!`, 'info');
        loadAppointments(); // Full reload to update UI
        loadIssues();
      }
      lastApptFetchTime = new Date().toISOString();
    } catch (e) { console.error('Polling error', e); }
  }

  // ── Tabs ──────────────────────────────────────────────────────
  function switchMainTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.tab-btn[onclick*="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === 'tab-qabullar') loadAppointments();
    if (tabId === 'tab-active') loadActiveVisits();
    if (tabId === 'tab-history') loadVisits();
    if (tabId === 'tab-patients') loadPatientsTab();
    if (tabId === 'tab-issues') loadIssues();
  }

  // ── Load Appointments ─────────────────────────────────────────
  function formatShortDate(dateInput) {
    const d = new Date(dateInput);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  function renderAppointmentTable(list, isOverdue) {
    const tbody = list.map(a => {
      const date = formatShortDate(a.slot.startTime);
      const time = new Date(a.slot.startTime).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' });
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
      const pPhone = a.patient ? a.patient.phone : (a.patientPhone || 'Yo\'q');
      
      let actionButtons = '';
      if (isOverdue) {
        actionButtons = `
          <div style="display:flex;gap:6px">
            <button class="btn-action btn-start" style="background:var(--teal);" onclick="resolvePastAppointment('${a.id}', 'YES')">Keldi</button>
            <button class="btn-action btn-cancel" style="background:#fee2e2; color:#ef4444;" onclick="resolvePastAppointment('${a.id}', 'NO')">Kelmadi</button>
          </div>
        `;
      } else {
        actionButtons = `
          <div style="display:flex;gap:6px">
            <button class="btn-action btn-start" onclick="startAppointment('${a.id}', this)">Boshlash</button>
            <button class="btn-action btn-cancel" onclick="deleteAppt('${a.id}')">Bekor</button>
          </div>
        `;
      }
      
      return `<tr>
        <td>
          <strong>${pName}</strong><br>
          <a href="tel:${pPhone}" style="color: var(--teal); font-size: 0.8rem; text-decoration: none; font-weight: 500;">📞 ${pPhone}</a>
        </td>
        <td><div style="font-size:0.8rem">Dr. ${a.doctor.lastName}<br><span style="color:var(--text-muted)">${a.procedure?.name || 'Ko\'rik'}</span></div></td>
        <td><div style="font-size:0.8rem; color:${isOverdue ? '#c2410c' : 'inherit'}"><strong>${date}</strong><br>${time}</div></td>
        <td>${actionButtons}</td>
      </tr>`;
    }).join('');

    return `<table>
      <thead><tr><th>Bemor</th><th>Shifokor / Xizmat</th><th>Sana / Vaqt</th><th>Amal</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  }

  function renderMissedTable(list) {
    const tbody = list.map(a => {
      const date = formatShortDate(a.slot.startTime);
      const time = new Date(a.slot.startTime).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' });
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
      const pPhone = a.patient ? a.patient.phone : (a.patientPhone || 'Yo\'q');
      const attempts = a.callAttempts || 0;
      
      const isDeleteDisabled = attempts < 3;
      const deleteTooltip = isDeleteDisabled 
        ? "Kamida 3 marta qo'ng'iroq qilinishi shart!" 
        : "Qabulni o'chirish";

      return `<tr style="background:#fff5f5;">
        <td>
          <strong style="color:var(--red);">${pName}</strong><br>
          <a href="tel:${pPhone}" style="color: var(--red); font-size: 0.85rem; text-decoration: underline; font-weight: 600;">📞 ${pPhone}</a>
        </td>
        <td><div style="font-size:0.8rem">Dr. ${a.doctor.lastName}<br><span style="color:var(--text-muted)">${a.procedure?.name || 'Ko\'rik'}</span></div></td>
        <td><div style="font-size:0.8rem; color:var(--red)"><strong>${date}</strong><br>${time}</div></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-action btn-start" style="background:#10b981;" onclick="openContactedModal('${a.id}', '${encodeURIComponent(JSON.stringify(a))}')">
              📞 Bog'lanildi
            </button>
            <button class="btn-action" style="background:#f59e0b; color:white;" onclick="updateCallStatus('${a.id}', 'NO_ANSWER')">
              Javob bermadi (${attempts}/3)
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `<table>
      <thead><tr><th>Bemor</th><th>Shifokor / Xizmat</th><th>Sana / Vaqt</th><th>Amal</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  }

  function renderResolvedMissedTable(list) {
    const tbody = list.map(a => {
      const date = formatShortDate(a.slot.startTime);
      const time = new Date(a.slot.startTime).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' });
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
      const pPhone = a.patient ? a.patient.phone : (a.patientPhone || 'Yo\'q');

      return `<tr style="background:#f0fdf4; border-left: 4px solid var(--teal);">
        <td>
          <strong style="color:var(--teal); text-decoration: line-through;">${pName}</strong><br>
          <span style="color: var(--teal); font-size: 0.85rem; font-weight: 500;">📞 ${pPhone}</span>
        </td>
        <td><div style="font-size:0.8rem">Dr. ${a.doctor.lastName}<br><span style="color:var(--text-muted)">${a.procedure?.name || 'Ko\'rik'}</span></div></td>
        <td><div style="font-size:0.8rem; color:var(--teal)"><strong>${date}</strong><br>${time}</div></td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
              ✅ Bog'lanildi
            </span>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `<table>
      <thead><tr><th>Bemor</th><th>Shifokor / Xizmat</th><th>Sana / Vaqt</th><th>Holati</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  }

  function renderUnreachableMissedTable(list) {
    const tbody = list.map(a => {
      const date = formatShortDate(a.slot.startTime);
      const time = new Date(a.slot.startTime).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' });
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
      const pPhone = a.patient ? a.patient.phone : (a.patientPhone || 'Yo\'q');

      return `<tr style="background:#f1f5f9; border-left: 4px solid #64748b;">
        <td>
          <strong style="color:#475569; text-decoration: line-through;">${pName}</strong><br>
          <span style="color: #64748b; font-size: 0.85rem; font-weight: 500;">📞 ${pPhone}</span>
        </td>
        <td><div style="font-size:0.8rem; color:#475569;">Dr. ${a.doctor.lastName}<br><span style="color:#94a3b8;">${a.procedure?.name || 'Ko\'rik'}</span></div></td>
        <td><div style="font-size:0.8rem; color:#475569;"><strong>${date}</strong><br>${time}</div></td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="background: #64748b; color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);">
              🔇 Bog'lanib bo'lmadi
            </span>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `<table>
      <thead><tr><th>Bemor</th><th>Shifokor / Xizmat</th><th>Sana / Vaqt</th><th>Holati</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  }

  function renderCancelledTable(list) {
    const tbody = list.map(a => {
      const date = formatShortDate(a.slot.startTime);
      const time = new Date(a.slot.startTime).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Tashkent' });
      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Noma\'lum');
      const pPhone = a.patient ? a.patient.phone : (a.patientPhone || 'Yo\'q');
      const canceller = a.cancelledBy === 'PATIENT' ? 'Bemor' : 'Admin';
      const note = a.cancelNote || 'Sabab ko\'rsatilmagan';

      return `<tr style="background:#fff7ed; border-left: 4px solid #f97316;">
        <td>
          <strong style="color:#c2410c; text-decoration: line-through;">${pName}</strong><br>
          <span style="color:#ea580c; font-size:0.85rem; font-weight:500;">📞 ${pPhone}</span>
        </td>
        <td><div style="font-size:0.8rem; color:#c2410c;">Dr. ${a.doctor.lastName}<br><span style="color:#f97316;">${a.procedure?.name || 'Ko\'rik'}</span></div></td>
        <td><div style="font-size:0.8rem; color:#c2410c;"><strong>${date}</strong><br>${time}</div></td>
        <td>
          <div style="font-size:0.8rem; color:#7c2d12;">
            <strong>Kim bekor qildi:</strong> ${canceller}<br>
            <strong>Sabab:</strong> <span style="font-style:italic;">"${note}"</span>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `<table>
      <thead><tr><th>Bemor</th><th>Shifokor / Xizmat</th><th>Sana / Vaqt</th><th>Bekor qilinish tafsilotlari</th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  }

  async function loadAppointments() {
    const container = document.getElementById('appointments-container');
    try {
      const res = await fetch('/api/admin/appointments', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (!data.success) return;

      const now = new Date();
      const scheduled = data.appointments.filter(a => a.status === 'SCHEDULED');
      
      const upcoming = [];
      const overdue = [];
      
      scheduled.forEach(a => {
        const slotTime = new Date(a.slot.startTime);
        if (slotTime < now) {
          overdue.push(a);
        } else {
          upcoming.push(a);
        }
      });
      
      const missed = data.appointments.filter(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW');
      const missedResolved = data.appointments.filter(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_RESOLVED');
      const missedUnreachable = data.appointments.filter(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_UNREACHABLE');

      let html = '';
      
      // 1. Upcoming Appointments
      html += `<h3 style="font-size: 1rem; color: var(--navy); margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">📅 Bugungi / Kutilayotgan Qabullar</h3>`;
      if (upcoming.length === 0) {
        html += `<div class="empty-state" style="padding: 20px;">Kutilayotgan qabullar yo'q.</div>`;
      } else {
        html += renderAppointmentTable(upcoming, false);
      }
      
      // 2. Overdue/Forgot Appointments
      html += `<h3 style="font-size: 1rem; color: #c2410c; margin: 30px 0 10px 0; display: flex; align-items: center; gap: 8px;">⚠️ Kechikkan / Unutilgan Qabullar</h3>`;
      if (overdue.length === 0) {
        html += `<div class="empty-state" style="padding: 20px; color: var(--text-muted);">Kechikkan qabullar yo'q.</div>`;
      } else {
        html += renderAppointmentTable(overdue, true);
      }
      
      // 3. No Shows (Bog'lanish kerak)
      html += `<h3 style="font-size: 1rem; color: var(--red); margin: 30px 0 10px 0; display: flex; align-items: center; gap: 8px;">📞 Kelmadi (Telefon qilish kerak)</h3>`;
      if (missed.length === 0) {
        html += `<div class="empty-state" style="padding: 20px; color: var(--text-muted);">Ro'yxat bo'sh.</div>`;
      } else {
        html += renderMissedTable(missed);
      }
      
      container.innerHTML = html;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty-state" style="color:red;">Xatolik yuz berdi.</div>';
    }
  }

  async function loadIssues() {
    const container = document.getElementById('issues-container');
    container.innerHTML = '<div class="empty-state">Yuklanmoqda...</div>';
    try {
      const res = await fetch('/api/admin/appointments', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (!data.success) return;

      const missedResolved = data.appointments.filter(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_RESOLVED');
      const missedUnreachable = data.appointments.filter(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_UNREACHABLE');
      const cancelledGeneral = data.appointments.filter(a => a.status === 'CANCELLED' && (a.cancelledBy === 'ADMIN' || a.cancelledBy === 'PATIENT'));

      let html = '';
      
      // Resolved No Shows (Bog'lanilganlar)
      html += `<h3 style="font-size: 1rem; color: var(--teal); margin: 30px 0 10px 0; display: flex; align-items: center; gap: 8px;">✅ Kelmadi - Bog'lanilganlar</h3>`;
      if (missedResolved.length === 0) {
        html += `<div class="empty-state" style="padding: 20px; color: var(--text-muted);">Ro'yxat bo'sh.</div>`;
      } else {
        html += renderResolvedMissedTable(missedResolved);
      }
      
      // Unreachable No Shows (Bog'lanib bo'lmadi)
      html += `<h3 style="font-size: 1rem; color: #475569; margin: 30px 0 10px 0; display: flex; align-items: center; gap: 8px;">🔇 Kelmadi - Bog'lanib bo'lmadi</h3>`;
      if (missedUnreachable.length === 0) {
        html += `<div class="empty-state" style="padding: 20px; color: var(--text-muted);">Ro'yxat bo'sh.</div>`;
      } else {
        html += renderUnreachableMissedTable(missedUnreachable);
      }

      // Cancelled Appointments (Bekor qilinganlar)
      html += `<h3 style="font-size: 1rem; color: #ea580c; margin: 30px 0 10px 0; display: flex; align-items: center; gap: 8px;">❌ Bekor qilingan qabullar</h3>`;
      if (cancelledGeneral.length === 0) {
        html += `<div class="empty-state" style="padding: 20px; color: var(--text-muted);">Ro'yxat bo'sh.</div>`;
      } else {
        html += renderCancelledTable(cancelledGeneral);
      }
      
      container.innerHTML = html;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty-state" style="color:red;">Xatolik yuz berdi.</div>';
    }
  }

  function deleteAppt(id, callAttempts = 3) {
    if (callAttempts < 3) {
      showToast("Bemorga kamida 3 marta qo'ng'iroq qilinishi shart! (Joriy: " + callAttempts + "/3)", "error");
      return;
    }
    
    showCancelReason(async (reason) => {
      try {
        const res = await fetch(`/api/admin/appointments/${id}`, { 
          method: 'DELETE', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}` 
          },
          body: JSON.stringify({ cancelNote: reason })
        });
        if (res.ok) {
          showToast("Qabul muvaffaqiyatli o'chirildi!", "success");
          loadAppointments();
          loadIssues();
        } else {
          const data = await res.json();
          showToast(data.error || "O'chirishda xatolik yuz berdi", "error");
        }
      } catch {
        showToast("Tarmoq xatosi", "error");
      }
    });
  }

  async function updateCallStatus(id, action) {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/call-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'RESOLVE') {
          showToast("Bemor bilan bog'lanildi va ro'yxatdan olindi!", "success");
        } else {
          if (data.appointment.callAttempts >= 3) {
            showToast("Bemor 3 marta javob bermadi va Muammoli qabullarga o'tkazildi!", "error");
          } else {
            showToast("Javob bermadi deb belgilandi! (Joriy: " + data.appointment.callAttempts + "/3)", "info");
          }
        }
        loadAppointments();
        loadIssues();
      } else {
        showToast(data.error || "Xatolik yuz berdi", "error");
      }
    } catch {
      showToast("Tarmoq xatoligi", "error");
    }
  }

  let currentContactedApptId = null;
  let currentContactedApptData = null;

  function openContactedModal(id, encodedData) {
    currentContactedApptId = id;
    currentContactedApptData = JSON.parse(decodeURIComponent(encodedData));
    document.getElementById('contacted-modal').style.display = 'flex';
  }

  function closeContactedModal() {
    document.getElementById('contacted-modal').style.display = 'none';
    currentContactedApptId = null;
    currentContactedApptData = null;
  }

  function handleContactedChoice(choice) {
    if (!currentContactedApptId) return;
    
    if (choice === 'KELMADI') {
      updateCallStatus(currentContactedApptId, 'RESOLVE');
      closeContactedModal();
    } else if (choice === 'RESCHEDULE') {
      const a = currentContactedApptData;
      document.getElementById('contacted-modal').style.display = 'none';
      openRescheduleModal(a);
    }
  }

  let selectedRescheduleSlotId = null;
  let rescheduleApptData = null;

  function openRescheduleModal(apptData) {
    rescheduleApptData = apptData;
    selectedRescheduleSlotId = null;
    document.getElementById('reschedule-modal').style.display = 'flex';
    document.getElementById('reschedule-slots-list').innerHTML = '';
    
    const btnSave = document.getElementById('btn-save-reschedule');
    btnSave.style.opacity = '0.5';
    btnSave.style.pointerEvents = 'none';

    if (apptData.doctorId) {
      loadRescheduleSlots(apptData.doctorId, apptData.procedureId);
    } else {
      document.getElementById('reschedule-slots-list').innerHTML = '<div style="color:var(--red); text-align:center;">Shifokor topilmadi.</div>';
    }
  }

  function closeRescheduleModal() {
    document.getElementById('reschedule-modal').style.display = 'none';
    rescheduleApptData = null;
    selectedRescheduleSlotId = null;
    // We should clear currentContactedApptId if they cancel, so they can re-open it
    currentContactedApptId = null; 
    currentContactedApptData = null;
  }

  async function loadRescheduleSlots(docId, procId) {
    const listEl = document.getElementById('reschedule-slots-list');
    const loadingEl = document.getElementById('reschedule-slots-loading');
    
    listEl.innerHTML = '';
    loadingEl.style.display = 'block';

    try {
      let url = `/api/public/doctors/${docId}/slots`;
      if (procId) {
        url += `?procedureId=${procId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      loadingEl.style.display = 'none';

      if (!data.success || !data.slots || data.slots.length === 0) {
        listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--red); text-align:center; padding:10px;">Bo\'sh vaqtlar topilmadi. Avval shifokor uchun yangi ish soatlari yarating.</div>';
        return;
      }

      // Group slots by Tashkent day
      const grouped = {};
      const tzOffset = 5 * 60 * 60 * 1000;

      data.slots.forEach(s => {
        const utcMs = new Date(s.startTime).getTime();
        const tNow = new Date(utcMs + tzOffset);
        const dayIso = tNow.toISOString().slice(0, 10);
        if (!grouped[dayIso]) grouped[dayIso] = [];
        grouped[dayIso].push(s);
      });

      const sortedDays = Object.keys(grouped).sort();
      
      const now = new Date();
      const tashkentShift = new Date(now.getTime() + tzOffset);
      const ty = tashkentShift.getUTCFullYear();
      const tm = String(tashkentShift.getUTCMonth() + 1).padStart(2, '0');
      const td = String(tashkentShift.getUTCDate()).padStart(2, '0');
      const tashkentToday = `${ty}-${tm}-${td}`;
      
      const tomorrowShift = new Date(tashkentShift.getTime() + 24 * 60 * 60 * 1000);
      const ty2 = tomorrowShift.getUTCFullYear();
      const tm2 = String(tomorrowShift.getUTCMonth() + 1).padStart(2, '0');
      const td2 = String(tomorrowShift.getUTCDate()).padStart(2, '0');
      const tashkentTomorrow = `${ty2}-${tm2}-${td2}`;

      const weekDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

      sortedDays.forEach(dayIso => {
        const slotsForDay = grouped[dayIso].sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
        const dayDate = new Date(dayIso);
        const wDay = weekDays[dayDate.getDay()];
        let headerText = `${dayIso} (${wDay})`;
        
        if (dayIso === tashkentToday) headerText = `Bugun (${wDay})`;
        else if (dayIso === tashkentTomorrow) headerText = `Ertaga (${wDay})`;

        const section = document.createElement('div');
        section.innerHTML = `<div style="font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:8px; margin-top:8px;">${headerText}</div>`;
        const pillsWrap = document.createElement('div');
        pillsWrap.style.display = 'flex';
        pillsWrap.style.flexWrap = 'wrap';
        pillsWrap.style.gap = '8px';

        slotsForDay.forEach(s => {
          const sUtc = new Date(s.startTime).getTime();
          const sLocal = new Date(sUtc + tzOffset);
          const hh = String(sLocal.getUTCHours()).padStart(2, '0');
          const mm = String(sLocal.getUTCMinutes()).padStart(2, '0');
          const timeStr = `${hh}:${mm}`;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'slot-pill';
          btn.textContent = timeStr;
          btn.onclick = () => selectRescheduleSlot(s.id, btn);
          pillsWrap.appendChild(btn);
        });

        section.appendChild(pillsWrap);
        listEl.appendChild(section);
      });
    } catch (err) {
      loadingEl.style.display = 'none';
      listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--red); text-align:center; padding:10px;">Xatolik yuz berdi</div>';
    }
  }

  function selectRescheduleSlot(slotId, btnEl) {
    selectedRescheduleSlotId = slotId;
    const parent = document.getElementById('reschedule-slots-list');
    const all = parent.querySelectorAll('.slot-pill');
    all.forEach(el => el.classList.remove('selected'));
    btnEl.classList.add('selected');
    
    const btnSave = document.getElementById('btn-save-reschedule');
    btnSave.style.opacity = '1';
    btnSave.style.pointerEvents = 'auto';
  }

  async function submitReschedule() {
    if (!selectedRescheduleSlotId || !rescheduleApptData || !currentContactedApptId) return;

    const btn = document.getElementById('btn-save-reschedule');
    const oldTxt = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const a = rescheduleApptData;
      const pName = a.patient ? a.patient.firstName : (a.patientFirst || '');
      const pLast = a.patient ? a.patient.lastName : (a.patientLast || '');
      const phone = a.patient ? a.patient.phone : (a.patientPhone || '');
      
      const payload = {
        slotId: selectedRescheduleSlotId,
        procedureId: a.procedureId,
        patientName: `${pName} ${pLast}`.trim(),
        firstName: pName,
        lastName: pLast,
        patientPhone: phone,
        telegramPhone: a.patient ? (a.patient.telegramPhone || '') : '',
        note: `Ko'chirilgan qabul. ${a.description || ''}`.trim()
      };

      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Booked successfully, now resolve the old one silently
        await fetch(`/api/admin/appointments/${currentContactedApptId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ action: 'RESOLVE' })
        });

        showToast("Qabul muvaffaqiyatli ko'chirildi!", "success");
        closeRescheduleModal();
        loadAppointments();
        loadIssues();
      } else {
        showToast(data.error || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      showToast("Tarmoq xatosi", "error");
    }
    
    btn.textContent = oldTxt;
    btn.disabled = false;
  }

  function resolvePastAppointment(id, answer) {
    if (answer === 'NO') {
      showConfirm(
        "Bemor kelmadi",
        "Haqiqatan ham bemor kelmadi deb belgilamoqchimisiz? Kelmadi ro'yxatiga tushadi va telefon raqami ko'rsatiladi.",
        "🛑",
        "Tasdiqlash",
        async () => {
          try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
              body: JSON.stringify({ action: 'NOSHOW' })
            });
            if (res.ok) {
              loadAppointments();
              loadIssues();
            } else {
              const data = await res.json();
              showToast(data.error || "Xatolik yuz berdi", "error");
            }
          } catch {
            showToast("Tarmoq xatosi", "error");
          }
        }
      );
    } else if (answer === 'YES') {
      startAppointment(id, null, true);
    }
  }

  async function startAppointment(id, btnElement, isPast = false) {
    if (btnElement) {
      btnElement.disabled = true;
      btnElement.textContent = '...';
    }
    // 1. Get appt details
    try {
      const resAll = await fetch('/api/admin/appointments', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const dataAll = await resAll.json();
      const a = dataAll.appointments.find(x => x.id === id);
      if (!a) return;

      const apptDate = new Date(a.slot.startTime);
      const today = new Date();
      
      if (!isPast) {
        if (apptDate.getFullYear() !== today.getFullYear() || 
            apptDate.getMonth() !== today.getMonth() || 
            apptDate.getDate() !== today.getDate()) {
          alert("Faqat bugungi qabullarni boshlash mumkin!");
          if (btnElement) {
            btnElement.disabled = false;
            btnElement.textContent = 'Boshlash';
          }
          return;
        }
      }

      const pName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a.patientFirst ? `${a.patientFirst} ${a.patientLast}` : 'Bemor');
      
      // 2. Create IN_PROGRESS visit
      const vRes = await fetch('/api/admin/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
          doctorId: a.doctorId,
          patientId: a.patientId || null,
          appointmentId: a.id,
          patientName: pName,
          serviceName: a.procedure?.name || 'Ko\'rik',
          price: a.procedure?.price || 0,
          source: 'BOOKED',
          status: 'IN_PROGRESS',
          startTime: a.slot.startTime
        })
      });

      if (vRes.ok) {
        const vData = await vRes.json();
        // 3. Mark appointment as COMPLETED
        await fetch(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ action: 'ATTEND' })
        });
        
        if (isPast) {
          await loadActiveVisits();
          finishVisit(vData.visit.id);
        } else {
          switchMainTab('tab-active');
        }
      }
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi");
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.textContent = 'Boshlash';
      }
    }
  }

  // ── Source toggle ─────────────────────────────────────────────
  function setSource(src) {
    visitSource = src;
    document.getElementById('btn-walkin').classList.toggle('active', src === 'WALKIN');
    document.getElementById('btn-booked').classList.toggle('active', src === 'BOOKED');
  }

  // ── Load doctors ─────────────────────────────────────────────
  async function loadDoctors() {
    try {
      const res = await fetch('/api/admin/doctors', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (data.success) {
        doctorsList = data.doctors;
        const sel = document.getElementById('f-doctor');
        sel.innerHTML = '<option value="" disabled selected hidden>Shifokor tanlang...</option>';
        data.doctors.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.id;
          opt.textContent = `Dr. ${d.firstName} ${d.lastName} (${d.specialty})`;
          opt.dataset.docId = d.id;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => {
          selectedSlotId = null;
          loadProceduresForDoctor(sel.value);
          loadAvailableSlots();
        });
      }
    } catch {}
  }

  async function loadProceduresForDoctor(doctorId) {
    const sel = document.getElementById('f-service');
    if (serviceSelectInstance) { serviceSelectInstance.destroy(); serviceSelectInstance = null; }
    sel.innerHTML = '<option value="">Yuklanmoqda...</option>';
    if (!doctorId) { 
      sel.innerHTML = '<option value="" disabled selected hidden>Xizmatni tanlang...</option><option value="__custom__">Boshqa (qo\'lda kiriting)</option>'; 
      initServiceSelect();
      return; 
    }
    try {
      const res = await fetch(`/api/public/doctors/${doctorId}/procedures`);
      const data = await res.json();
      sel.innerHTML = '<option value="" disabled selected hidden>Xizmatni tanlang...</option>';
      if (data.procedures?.length) {
        data.procedures.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.name;
          opt.textContent = `${p.name} (${p.durationMinutes} min)`;
          opt.dataset.duration = p.durationMinutes;
          opt.dataset.id = p.id;
          opt.dataset.price = p.price;
          sel.appendChild(opt);
        });
      }
      const customOpt = document.createElement('option');
      customOpt.value = '__custom__';
      customOpt.textContent = 'Boshqa (qo\'lda kiriting)';
      sel.appendChild(customOpt);
    } catch {
      sel.innerHTML = '<option value="" disabled selected hidden>Xizmatni tanlang...</option><option value="__custom__">Boshqa (qo\'lda kiriting)</option>';
    }
    initServiceSelect();
  }

  document.getElementById('f-service').addEventListener('change', function() {
    selectedSlotId = null;
    const selectedOpts = Array.from(this.selectedOptions);
    const values = selectedOpts.map(opt => opt.value);
    
    document.getElementById('f-service-custom').style.display = values.includes('__custom__') ? '' : 'none';
    
    // Auto-calculate end time and total price
    let totalDuration = 0;
    let totalPrice = 0;
    
    selectedOpts.forEach(opt => {
      if (opt.value !== '__custom__') {
        totalDuration += parseInt(opt.dataset.duration || '0');
        totalPrice += parseInt(opt.dataset.price || '0');
      }
    });

    if (totalDuration === 0) totalDuration = 30; // Default if nothing or only custom is selected

    const durInput = document.getElementById('f-manual-duration');
    if (durInput) durInput.value = totalDuration;

    if (startPicker && endPicker) {
      const start = startPicker.selectedDates[0] || new Date();
      const end = new Date(start.getTime() + totalDuration * 60000);
      endPicker.setDate(end);
    }

    if (totalPrice > 0) {
      document.getElementById('f-price').value = totalPrice.toLocaleString('uz-UZ').replace(/,/g, '.');
    } else {
      document.getElementById('f-price').value = '';
    }

    loadAvailableSlots();
  });

  // ── Submit visit ─────────────────────────────────────────────
  async function submitVisit(status = 'COMPLETED') {
    let btn;
    if (status === 'IN_PROGRESS') {
      btn = document.getElementById('btn-start');
    } else if (status === 'SCHEDULED') {
      btn = document.getElementById('btn-book');
    } else {
      btn = document.getElementById('btn-submit');
    }
    const toast = document.getElementById('success-toast');
    const errEl = document.getElementById('err-form');
    toast.style.display = 'none'; errEl.style.display = 'none';

    const doctorId = document.getElementById('f-doctor').value;
    const firstName = document.getElementById('f-patient').value.trim();
    const lastName = document.getElementById('f-patient-surname').value.trim();
    const patientName = `${firstName} ${lastName}`;
    const patientPhone = document.getElementById('f-phone').value.trim();
    const rawTgPhone = document.getElementById('f-tg-phone').value.trim();
    const telegramPhone = (rawTgPhone === '+998' || rawTgPhone === '+998 ') ? '' : rawTgPhone;

    const selectedServiceOpts = Array.from(document.getElementById('f-service').selectedOptions);
    const serviceValues = selectedServiceOpts.map(opt => opt.value);
    
    let serviceName = serviceValues.map(val => {
      return val === '__custom__' ? document.getElementById('f-service-custom').value.trim() : val;
    }).filter(Boolean).join(' + ');
    const priceStr = document.getElementById('f-price').value.replace(/\D/g, ''); 
    const price = parseInt(priceStr, 10);
    const startTime = document.getElementById('f-start-date').value;
    const endTime = document.getElementById('f-end-date').value;
    const paymentMethod = 'CASH';
    
    const visitType = document.querySelector('input[name="f-visit-type"]:checked').value;
    let note = document.getElementById('f-note').value.trim();
    if (visitType === 'repeat') {
      note = `Takroriy qabul. ${note}`.trim();
    }

    if (!doctorId || !firstName || !lastName || !serviceName || !price) {
      errEl.textContent = 'Iltimos, barcha majburiy maydonlarni to\'ldiring.';
      errEl.style.display = 'block';
      return;
    }

    if (!patientPhone || !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(patientPhone)) {
      errEl.textContent = 'Iltimos, to\'g\'ri telefon raqamini kiriting (+998 XX XXX XX XX).';
      errEl.style.display = 'block';
      return;
    }

    if (telegramPhone && !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(telegramPhone)) {
      errEl.textContent = 'Iltimos, to\'g\'ri Telegram raqamini kiriting (+998 XX XXX XX XX).';
      errEl.style.display = 'block';
      return;
    }

    if (status === 'SCHEDULED') {
      if (serviceVal === '__custom__') {
        errEl.textContent = 'Qabulni bron qilish uchun ro\'yxatdan xizmatni tanlang. Qo\'lda kiritish xizmati bilan bron qilish mumkin emas.';
        errEl.style.display = 'block';
        return;
      }
      if (!selectedSlotId) {
        errEl.textContent = 'Iltimos, shifokorning bo\'sh vaqtlaridan birini tanlang.';
        errEl.style.display = 'block';
        return;
      }
    }

    btn.disabled = true; const oldTxt = btn.textContent; btn.textContent = '...';
    try {
      if (status === 'SCHEDULED') {
        const serviceSel = document.getElementById('f-service');
        const selectedOpts = Array.from(serviceSel.selectedOptions);
        const validOpt = selectedOpts.find(opt => opt.value !== '__custom__');
        const procedureId = validOpt ? validOpt.dataset.id : null;

        const res = await fetch('/api/admin/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ 
            slotId: selectedSlotId, 
            procedureId, 
            patientName, 
            firstName, 
            lastName, 
            patientPhone, 
            telegramPhone, 
            note 
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.textContent = "✅ Qabul muvaffaqiyatli bron qilindi!";
          toast.style.display = 'block';
          setTimeout(() => toast.style.display = 'none', 4000);
          // Reset form
          document.getElementById('f-patient').value = '';
          document.getElementById('f-patient-surname').value = '';
          document.getElementById('f-phone').value = '';
          document.getElementById('f-tg-phone').value = '';
          document.getElementById('f-price').value = '';
          document.getElementById('f-note').value = '';
          document.querySelector('input[name="f-visit-type"][value="new"]').checked = true;
          if (serviceSelectInstance) serviceSelectInstance.clear();
          else document.getElementById('f-service').selectedIndex = 0;
          document.getElementById('f-service-custom').style.display = 'none';
          selectedSlotId = null;
          setDefaultDate();
          loadAppointments();
          loadIssues();
          loadActiveVisits();
          loadVisits();
          loadAvailableSlots();
        } else {
          errEl.textContent = data.error || 'Bron qilishda xatolik yuz berdi';
          errEl.style.display = 'block';
        }
      } else {
        let finalPatientId = null;
        if (patientPhone) {
          const pRes = await fetch('/api/reception/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ firstName, lastName, phone: patientPhone, telegramPhone })
          });
          if (pRes.ok) {
            const pData = await pRes.json();
            finalPatientId = pData.patient?.id;
          }
        }

        const res = await fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ doctorId, patientId: finalPatientId, patientName, serviceName, price, source: visitSource, startTime, endTime, status, note, paymentMethod })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.textContent = "✅ Tashrif muvaffaqiyatli qayd etildi!";
          toast.style.display = 'block';
          setTimeout(() => toast.style.display = 'none', 4000);
          // Reset form
          document.getElementById('f-patient').value = '';
          document.getElementById('f-patient-surname').value = '';
          document.getElementById('f-phone').value = '';
          document.getElementById('f-tg-phone').value = '';
          document.getElementById('f-price').value = '';
          document.getElementById('f-note').value = '';
          document.querySelector('input[name="f-visit-type"][value="new"]').checked = true;
          if (serviceSelectInstance) serviceSelectInstance.clear();
          else document.getElementById('f-service').selectedIndex = 0;
          document.getElementById('f-service-custom').style.display = 'none';
          selectedSlotId = null;
          setDefaultDate();
          loadAppointments();
          loadIssues();
          loadActiveVisits();
          loadVisits();
          loadAvailableSlots();
        } else {
          errEl.textContent = data.error || 'Xatolik yuz berdi';
          errEl.style.display = 'block';
        }
      }
    } catch {
      errEl.textContent = 'Tarmoq xatosi';
      errEl.style.display = 'block';
    }
    btn.disabled = false; btn.textContent = oldTxt;
  }

  // ── Save Draft ───────────────────────────────────────────────
  async function submitDraft() {
    const btn = document.getElementById('btn-draft');
    const toast = document.getElementById('success-toast');
    const errEl = document.getElementById('err-form');
    toast.style.display = 'none'; errEl.style.display = 'none';

    const doctorId = document.getElementById('f-doctor').value;
    // We must find the patient in the DB to save a draft (so they can see it in their profile).
    // The patientId is populated if they were selected from the dropdown, but we also search by phone.
    const phone = document.getElementById('f-phone').value.trim();
    if (!doctorId) {
      errEl.textContent = "Iltimos, shifokorni tanlang.";
      errEl.style.display = 'block'; return;
    }
    if (!phone) {
      errEl.textContent = "Iltimos, bemor telefon raqamini kiriting (yoki bemorni qidiruvdan tanlang).";
      errEl.style.display = 'block'; return;
    }

    const serviceSel = document.getElementById('f-service');
    const selectedOpts = Array.from(serviceSel.selectedOptions);
    const validOpt = selectedOpts.find(opt => opt.value !== '__custom__');
    const procedureId = validOpt ? validOpt.dataset.id : null;

    if (!procedureId) {
      errEl.textContent = "Saqlab qo'yish uchun aniq xizmat (protsedura) tanlanishi shart (qo'lda kiritish mumkin emas).";
      errEl.style.display = 'block'; return;
    }

    btn.disabled = true; const oldTxt = btn.textContent; btn.textContent = '...';
    try {
      // Find or create patient by phone
      let finalPatientId = null;
      const pFirstName = document.getElementById('f-patient').value.trim();
      const pLastName = document.getElementById('f-patient-surname').value.trim();
      
      const pRes = await fetch('/api/reception/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ firstName: pFirstName || "Noma'lum", lastName: pLastName || "Noma'lum", phone: phone })
      });
      const pData = await pRes.json();
      
      if (pRes.ok && pData.patient) {
        finalPatientId = pData.patient.id;
      } else {
        errEl.textContent = "Bemor yaratishda xatolik: " + (pData.error || '');
        errEl.style.display = 'block'; btn.disabled = false; btn.textContent = oldTxt; return;
      }

      const customDuration = document.getElementById('f-manual-duration').value;

      const res = await fetch('/api/reception/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ doctorId, patientId: finalPatientId, procedureId, customDuration })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.textContent = "⏳ Saqlandi! Bemor o'z profilidan davom ettirishi mumkin.";
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 4000);
        // Reset form
        document.getElementById('f-patient').value = '';
        document.getElementById('f-patient-surname').value = '';
        document.getElementById('f-phone').value = '';
        document.getElementById('f-tg-phone').value = '';
        document.getElementById('f-price').value = '';
        document.getElementById('f-note').value = '';
        if (serviceSelectInstance) serviceSelectInstance.clear();
        else document.getElementById('f-service').selectedIndex = 0;
        selectedSlotId = null;
        setDefaultDate();
      } else {
        errEl.textContent = data.error || 'Xatolik yuz berdi';
        errEl.style.display = 'block';
      }
    } catch {
      errEl.textContent = 'Tarmoq xatosi';
      errEl.style.display = 'block';
    }
    btn.disabled = false; btn.textContent = oldTxt;
  }

  // ── Load active treatments ───────────────────────────────────
  let activeVisits = [];
  async function loadActiveVisits() {
    try {
      const res = await fetch('/api/admin/visits?limit=100', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (data.success) {
        activeVisits = data.visits.filter(v => v.status === 'IN_PROGRESS');
        renderActiveVisits();
      }
    } catch {}
  }

  function renderActiveVisits() {
    const section = document.getElementById('active-treatments-section');
    const container = document.getElementById('active-visits-container');
    
    if (activeVisits.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    container.innerHTML = activeVisits.map(v => `
      <div class="active-card" id="card-${v.id}">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <div class="patient">${v.patientName}</div>
            <div class="doctor">Dr. ${v.doctor.lastName} — ${v.serviceName}</div>
          </div>
          <div class="status-dot"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
          <div class="timer" id="timer-${v.id}" data-end="${v.endTime || ''}">
            ⏳ --:--
          </div>
          <button class="finish-btn" onclick="finishVisit('${v.id}')">Tugatish</button>
        </div>
      </div>
    `).join('');
    updateTimers();
  }

  function updateTimers() {
    activeVisits.forEach(v => {
      const el = document.getElementById(`timer-${v.id}`);
      if (!el || !v.endTime) return;
      
      const end = new Date(v.endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        el.textContent = '✅ Vaqt tugadi';
        el.style.color = 'var(--red)';
        return;
      }

      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      el.textContent = `⏳ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    });
  }
  setInterval(updateTimers, 1000);

  // ── Payment Modal Logic ──────────────────────────────────────
  let currentVisitId = null;
  function finishVisit(id) {
    const v = activeVisits.find(x => x.id === id);
    if (!v) return;
    currentVisitId = id;
    
    document.getElementById('m-patient').textContent = v.patientName;
    document.getElementById('m-doctor').textContent = `Dr. ${v.doctor.firstName} ${v.doctor.lastName}`;
    document.getElementById('m-service').textContent = v.serviceName;
    document.getElementById('m-total').textContent = v.price.toLocaleString('uz-UZ') + ' so\'m';
    
    const paidInput = document.getElementById('m-paid-amount');
    paidInput.value = v.price.toLocaleString('uz-UZ');
    document.getElementById('m-full-pay').checked = true;
    paidInput.disabled = true;

    document.getElementById('payment-modal').style.display = 'flex';
  }

  function toggleFullPay() {
    const cb = document.getElementById('m-full-pay');
    cb.checked = !cb.checked;
    const input = document.getElementById('m-paid-amount');
    input.disabled = cb.checked;
    if (cb.checked) {
      const v = activeVisits.find(x => x.id === currentVisitId);
      if (v) input.value = v.price.toLocaleString('uz-UZ');
    }
  }

  function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    currentVisitId = null;
  }

  async function savePayment() {
    const btn = document.getElementById('btn-save-payment');
    const paidStr = document.getElementById('m-paid-amount').value.replace(/\D/g, '');
    const paidAmount = parseInt(paidStr);
    const paymentMethod = document.getElementById('m-payment-method').value;

    btn.disabled = true; btn.textContent = 'Saqlanmoqda...';
    try {
      const res = await fetch(`/api/admin/visits/${currentVisitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ 
          status: 'COMPLETED', 
          paidAmount,
          paymentMethod,
          endTime: new Date().toISOString()
        })
      });
      if (res.ok) {
        closePaymentModal();
        loadActiveVisits();
        loadVisits();
      }
    } catch {}
    btn.disabled = false; btn.textContent = 'Tugatish va Saqlash';
  }

  // ── Load visits (history) ───────────────────────────────────
  async function loadVisits() {
    const container = document.getElementById('visits-container');
    try {
      const res = await fetch('/api/admin/visits?limit=30', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      const data = await res.json();
      if (!data.success) return;
      
      const history = data.visits.filter(v => v.status === 'COMPLETED');
      if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">Hozircha tashriflar yo\'q.</div>';
        return;
      }

      const tbody = history.map(v => {
        const _d = new Date(v.startTime);
        const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
        const timeStr = _d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Tashkent' });
        const start = `${_d.getDate()} ${uzMonths[_d.getMonth()]} ${timeStr}`;
        const isFullPaid = v.paidAmount >= v.price;
        let payMethodText = '';
        if (v.paymentMethod) {
          const methodMap = { CASH: "Naqd", CARD: "Karta", TRANSFER: "O'tkazma" };
          payMethodText = `<span style="font-size:0.75rem; color:var(--text-muted); display:block;">(${methodMap[v.paymentMethod] || v.paymentMethod})</span>`;
        }
        const paymentStatus = isFullPaid 
          ? `<span style="color:var(--green)">✅ ${v.price.toLocaleString()}</span>${payMethodText}`
          : `<span style="color:var(--red)">⚠️ ${v.paidAmount.toLocaleString()} / ${v.price.toLocaleString()}</span>${payMethodText}`;

        const sourceBadge = v.source === 'BOOKED'
          ? '<span class="source-badge booked">📱 Online</span>'
          : '<span class="source-badge walkin">🚶 Offline</span>';
          
        return `<tr>
          <td>${start}</td>
          <td><strong>${v.patientName}</strong></td>
          <td>Dr. ${v.doctor.lastName}</td>
          <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${v.serviceName}</td>
          <td class="price-cell">${paymentStatus}</td>
          <td>${sourceBadge}</td>
        </tr>`;
      }).join('');
      container.innerHTML = `<table>
        <thead><tr><th>Vaqt</th><th>Bemor</th><th>Shifokor</th><th>Xizmat</th><th>To'lov</th><th>Tur</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table>`;
    } catch {
      container.innerHTML = '<div class="empty-state" style="color:red;">Xatolik yuz berdi.</div>';
    }
  }

  // ── Init ─────────────────────────────────────────────────────
  verifyAuthOnLoad();

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

  function updateDurationAndSlots() {
    const durInput = document.getElementById('f-manual-duration');
    if (!durInput) return;
    const dur = parseInt(durInput.value) || 30;
    
    if (startPicker && endPicker) {
      const start = startPicker.selectedDates[0] || new Date();
      const end = new Date(start.getTime() + dur * 60000);
      endPicker.setDate(end);
    }
    
    loadAvailableSlots();
  }

  function onAutoPatientInput(val) {
    const resDiv = document.getElementById('f-auto-patient-results');
    if (!val || val.length < 2) {
      resDiv.style.display = 'none';
      return;
    }
    const term = val.toLowerCase();
    const filtered = allPatients.filter(p => 
      p.firstName.toLowerCase().includes(term) || 
      (p.lastName && p.lastName.toLowerCase().includes(term)) || 
      (p.phone && p.phone.includes(term))
    ).slice(0, 5);

    if (filtered.length === 0) {
      resDiv.innerHTML = '<div style="padding:10px; color:var(--text-muted); font-size:0.9rem;">Bemor topilmadi...</div>';
    } else {
      resDiv.innerHTML = filtered.map(p => `
        <div style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;" onmousedown="selectAutoPatient('${p.id}')">
          <div style="font-weight:600; color:var(--navy);">${p.firstName} ${p.lastName || ''}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${p.phone || ''}</div>
        </div>
      `).join('');
    }
    resDiv.style.display = 'block';
  }

  function selectAutoPatient(id) {
    const p = allPatients.find(x => x.id === id);
    if (p) {
      document.getElementById('f-patient').value = p.firstName || '';
      document.getElementById('f-patient-surname').value = p.lastName || '';
      const fPhone = document.getElementById('f-phone');
      fPhone.value = p.phone || '';
      fPhone.dispatchEvent(new Event('input'));

      const fTgPhone = document.getElementById('f-tg-phone');
      fTgPhone.value = p.telegramPhone || '';
      fTgPhone.dispatchEvent(new Event('input'));
      
      document.getElementById('f-auto-patient').value = '';
    }
    document.getElementById('f-auto-patient-results').style.display = 'none';
  }

  async function loadAvailableSlots() {
    const docId = document.getElementById('f-doctor').value;
    const serviceSel = document.getElementById('f-service');
    const groupEl = document.getElementById('free-slots-group');
    const listEl = document.getElementById('free-slots-list');
    const loadingEl = document.getElementById('free-slots-loading');

    if (!docId) {
      groupEl.style.display = 'none';
      if (document.getElementById('f-duration-group')) document.getElementById('f-duration-group').style.display = 'none';
      return;
    }

    groupEl.style.display = 'block';
    if (document.getElementById('f-duration-group')) document.getElementById('f-duration-group').style.display = 'block';
    listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:10px;">Yuklanmoqda...</div>';
    loadingEl.style.display = 'inline';

    try {
      const manualDurInput = document.getElementById('f-manual-duration');
      const customDur = manualDurInput ? manualDurInput.value : '';
      
      let url = `/api/public/doctors/${docId}/slots`;
      if (customDur) {
        url += `?duration=${customDur}`;
      } else {
        const selectedOpt = serviceSel.options[serviceSel.selectedIndex];
        const procId = (selectedOpt && selectedOpt.value !== '__custom__') ? (selectedOpt.dataset.id || '') : '';
        if (procId) {
          url += `?procedureId=${procId}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();
      loadingEl.style.display = 'none';

      if (!data.success || !data.slots || data.slots.length === 0) {
        listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--red); text-align:center; padding:10px;">Bo\'sh vaqtlar topilmadi. Avval shifokor uchun yangi ish soatlari yarating.</div>';
        return;
      }

      // Group slots by Tashkent day
      const grouped = {};
      const tzOffset = 5 * 60 * 60 * 1000;

      data.slots.forEach(s => {
        const utcMs = new Date(s.startTime).getTime();
        const tNow = new Date(utcMs + tzOffset);
        const dayIso = tNow.toISOString().slice(0, 10); // YYYY-MM-DD in Tashkent timezone

        if (!grouped[dayIso]) {
          grouped[dayIso] = [];
        }
        grouped[dayIso].push(s);
      });

      // Render grouped slots
      const sortedDays = Object.keys(grouped).sort();
      
      // Get relative day names for Tashkent today & tomorrow
      const now = new Date();
      const tashkentShift = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const ty = tashkentShift.getUTCFullYear();
      const tm = String(tashkentShift.getUTCMonth() + 1).padStart(2, '0');
      const td = String(tashkentShift.getUTCDate()).padStart(2, '0');
      const tashkentToday = `${ty}-${tm}-${td}`;
      
      const tomorrowShift = new Date(tashkentShift.getTime() + 24 * 60 * 60 * 1000);
      const ty2 = tomorrowShift.getUTCFullYear();
      const tm2 = String(tomorrowShift.getUTCMonth() + 1).padStart(2, '0');
      const td2 = String(tomorrowShift.getUTCDate()).padStart(2, '0');
      const tashkentTomorrow = `${ty2}-${tm2}-${td2}`;

      listEl.innerHTML = sortedDays.map(dayIso => {
        let dayTitle = '';
        const dObj = new Date(dayIso);
        const formattedDate = dObj.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
        
        if (dayIso === tashkentToday) {
          dayTitle = `Bugun (${formattedDate})`;
        } else if (dayIso === tashkentTomorrow) {
          dayTitle = `Ertaga (${formattedDate})`;
        } else {
          const weekday = dObj.toLocaleDateString('uz-UZ', { weekday: 'long' });
          dayTitle = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} (${formattedDate})`;
        }

        const slotsHtml = grouped[dayIso].map(s => {
          const sDate = new Date(s.startTime);
          const tTimeStr = sDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
          
          return `
            <button type="button" class="slot-pill" data-start="${s.startTime}" data-duration="${s.duration}" onclick="selectFreeSlot('${s.startTime}', ${s.duration}, '${s.id}', this)">
              ${tTimeStr}
            </button>
          `;
        }).join('');

        return `
          <div class="free-day-group" style="border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
              <span>📅 ${dayTitle}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${slotsHtml}
            </div>
          </div>
        `;
      }).join('');

      // Remove border-bottom from the last group
      const groups = listEl.querySelectorAll('.free-day-group');
      if (groups.length > 0) {
        groups[groups.length - 1].style.borderBottom = 'none';
        groups[groups.length - 1].style.paddingBottom = '0';
      }

    } catch (err) {
      console.error(err);
      loadingEl.style.display = 'none';
      listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--red); text-align:center; padding:10px;">Yuklashda xatolik yuz berdi</div>';
    }
  }

  function selectFreeSlot(startTimeISO, durationMinutes, slotId, btnEl) {
    selectedSlotId = slotId;
    const startVal = new Date(startTimeISO);
    const endVal = new Date(startVal.getTime() + durationMinutes * 60000);

    if (startPicker) startPicker.setDate(startVal);
    if (endPicker) endPicker.setDate(endVal);

    // Highlight the clicked button, unhighlight others
    document.querySelectorAll('.slot-pill').forEach(b => {
      b.style.background = '#fff';
      b.style.color = 'var(--teal-dark)';
    });

    if (btnEl) {
      btnEl.style.background = 'var(--teal)';
      btnEl.style.color = '#fff';
    }

    showToast("Vaqt muvaffaqiyatli tanlandi: " + startVal.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' }), "success");
  }

  // --- Patients Directory Tab ---
  let allPatients = [];
  let currentPatientFilter = 'all';

  async function loadAllPatientsForAutocomplete() {
    try {
      const res = await fetch('/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        allPatients = data.patients;
      }
    } catch (err) {
      console.error('Failed to load patients for autocomplete', err);
    }
  }

  async function loadPatientsTab() {
    const container = document.getElementById('patients-tab-container');
    container.innerHTML = '<div class="empty-state">Yuklanmoqda...</div>';

    try {
      const res = await fetch('/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        allPatients = data.patients;
        renderPatientsTab();
      } else {
        container.innerHTML = '<div class="empty-state" style="color:var(--red);">Bemorlar ro\'yxatini yuklashda xatolik yuz berdi.</div>';
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty-state" style="color:var(--red);">Tarmoq xatoligi yuz berdi.</div>';
    }
  }

  function setPatientFilter(filterName) {
    currentPatientFilter = filterName;
    document.querySelectorAll('#tab-patients .filter-btn').forEach(b => b.classList.remove('active'));
    
    let btnId = 'f-pat-all';
    if (filterName === 'upcoming') btnId = 'f-pat-upcoming';
    else if (filterName === 'completed') btnId = 'f-pat-completed';
    else if (filterName === 'noshow') btnId = 'f-pat-noshow';
    else if (filterName === 'unreachable') btnId = 'f-pat-unreachable';
    
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
    
    renderPatientsTab();
  }

  function filterPatientsTab() {
    renderPatientsTab();
  }

  function renderPatientsTab() {
    const container = document.getElementById('patients-tab-container');
    const searchInput = document.getElementById('reception-patient-search');
    const query = searchInput ? searchInput.value.toLowerCase().replace(/\s+/g, '') : '';
    const today = new Date();
    today.setHours(0,0,0,0);

    let filtered = allPatients;

    if (query) {
      filtered = filtered.filter(p => {
        const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().replace(/\s+/g, '').includes(query);
        const phoneMatch = p.phone.replace(/\D/g, '').includes(query) || (p.telegramPhone && p.telegramPhone.replace(/\D/g, '').includes(query));
        return nameMatch || phoneMatch;
      });
    }

    if (currentPatientFilter === 'upcoming') {
      filtered = filtered.filter(p => {
        return p.appointments && p.appointments.some(a => a.status === 'SCHEDULED' && new Date(a.slot.startTime) >= today);
      });
    } else if (currentPatientFilter === 'completed') {
      filtered = filtered.filter(p => {
        const hasCompletedAppt = p.appointments && p.appointments.some(a => a.status === 'COMPLETED');
        const hasCompletedVisit = p.visits && p.visits.some(v => v.status === 'COMPLETED');
        return hasCompletedAppt || hasCompletedVisit;
      });
    } else if (currentPatientFilter === 'noshow') {
      filtered = filtered.filter(p => {
        return p.appointments && p.appointments.some(a => a.status === 'CANCELLED' && (a.cancelledBy === 'NOSHOW' || a.cancelledBy === 'NOSHOW_UNREACHABLE'));
      });
    } else if (currentPatientFilter === 'unreachable') {
      filtered = filtered.filter(p => {
        return p.appointments && p.appointments.some(a => a.status === 'CANCELLED' && a.cancelledBy === 'NOSHOW_UNREACHABLE');
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">Bemorlar topilmadi.</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Bemor ismi</th>
            <th>Telefon raqami</th>
            <th>Telegram raqami</th>
            <th>Turi</th>
            <th>Tashriflar / Bronlar</th>
            <th>Oxirgi status</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const apptsCount = p.appointments ? p.appointments.length : 0;
            const completedCount = p.appointments ? p.appointments.filter(a => a.status === 'COMPLETED').length : 0;
            const activeVisitsCount = p.visits ? p.visits.filter(v => v.status === 'IN_PROGRESS').length : 0;
            
            let lastEvent = 'Tashrif yozilmagan';
            let lastEventDate = null;
            
            if (p.appointments) {
              p.appointments.forEach(a => {
                const d = new Date(a.slot.startTime);
                if (!lastEventDate || d > lastEventDate) {
                  lastEventDate = d;
                  if (a.status === 'SCHEDULED') lastEvent = `Bron: ${d.toLocaleDateString()}`;
                  else if (a.status === 'COMPLETED') lastEvent = `Kelgan: ${d.toLocaleDateString()}`;
                  else lastEvent = `Bekor qilingan: ${d.toLocaleDateString()}`;
                }
              });
            }
            if (p.visits) {
              p.visits.forEach(v => {
                const d = new Date(v.startTime);
                if (!lastEventDate || d > lastEventDate) {
                  lastEventDate = d;
                  if (v.status === 'IN_PROGRESS') lastEvent = `Muolajada: ${d.toLocaleDateString()}`;
                  else lastEvent = `Tugatilgan: ${d.toLocaleDateString()}`;
                }
              });
            }

            const sourceBadge = p.source === 'ONLINE' 
              ? '<span class="source-badge booked">📱 Telegram Bot</span>' 
              : '<span class="source-badge walkin">🚶 Kelgan</span>';

            const tgPhone = p.telegramPhone || '-';

            return `
              <tr class="patient-row" onclick="openPatientHistoryModal('${p.id}')">
                <td style="font-weight: 700; color: var(--navy);">👤 ${p.firstName} ${p.lastName}</td>
                <td>${p.phone}</td>
                <td>${tgPhone}</td>
                <td>${sourceBadge}</td>
                <td>
                  <span style="color:var(--teal-dark); font-weight:600;">${completedCount} kelgan</span> / 
                  <span style="color:var(--text-muted); font-size:0.8rem;">${apptsCount} bron</span>
                  ${activeVisitsCount > 0 ? ` <span style="background:rgba(168,85,247,0.1); color:#a855f7; font-size:0.7rem; font-weight:600; padding:2px 6px; border-radius:4px; margin-left:4px;">Muolajada</span>` : ''}
                </td>
                <td style="font-weight: 600; font-size: 0.8rem; color: var(--text-muted);">${lastEvent}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  async function openPatientHistoryModal(patientId) {
    const modal = document.getElementById('patient-history-modal');
    modal.style.display = 'flex';
    
    document.getElementById('ph-name').textContent = "Yuklanmoqda...";
    document.getElementById('ph-joined').textContent = "...";
    document.getElementById('ph-phone').textContent = "...";
    document.getElementById('ph-tg-phone').textContent = "...";
    document.getElementById('ph-tg-user').textContent = "...";
    document.getElementById('ph-source').textContent = "...";
    document.getElementById('ph-history-list').innerHTML = '<div class="empty-state">Tarix yuklanmoqda...</div>';

    try {
      const res = await fetch(`/api/admin/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const p = data.patient;
        document.getElementById('ph-name').textContent = `${p.firstName} ${p.lastName}`;
        
        const joinDate = new Date(p.createdAt);
        const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
        document.getElementById('ph-joined').textContent = `Klinikada ro'yxatdan o'tgan sana: ${joinDate.getDate()} ${uzMonths[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
        
        document.getElementById('ph-phone').textContent = p.phone || '-';
        document.getElementById('ph-tg-phone').textContent = p.telegramPhone || '-';
        document.getElementById('ph-tg-user').textContent = p.telegramUsername ? `@${p.telegramUsername}` : '-';
        document.getElementById('ph-source').textContent = p.source === 'ONLINE' ? '📱 Telegram Bot' : '🚶 Kelgan bemor';

        const list = document.getElementById('ph-history-list');
        const items = [];
        
        if (p.appointments) {
          p.appointments.forEach(a => {
            const time = new Date(a.slot.startTime);
            items.push({
              type: 'APPOINTMENT',
              time,
              status: a.status,
              cancelledBy: a.cancelledBy,
              cancelNote: a.cancelNote,
              doctor: a.doctor,
              procedure: a.procedure
            });
          });
        }

        if (p.visits) {
          p.visits.forEach(v => {
            const time = new Date(v.startTime);
            items.push({
              type: 'VISIT',
              time,
              status: v.status,
              serviceName: v.serviceName,
              price: v.price,
              paidAmount: v.paidAmount,
              paymentMethod: v.paymentMethod,
              doctor: v.doctor,
              note: v.note
            });
          });
        }

        items.sort((a, b) => b.time - a.time);

        if (items.length === 0) {
          list.innerHTML = '<div class="empty-state">Tashriflar topilmadi.</div>';
          return;
        }

        list.innerHTML = items.map(item => {
          const t = item.time;
          const timeStr = `${t.getDate()} ${uzMonths[t.getMonth()]} ${t.toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Tashkent' })}`;
          
          if (item.type === 'APPOINTMENT') {
            let badge = '';
            if (item.status === 'SCHEDULED') {
              badge = '<span style="color:#0284c7; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(2,132,199,0.1); border-radius:4px;">Kutilmoqda</span>';
            } else if (item.status === 'COMPLETED') {
              badge = '<span style="color:#16a34a; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(22,163,74,0.1); border-radius:4px;">Keldi</span>';
            } else if (item.status === 'CANCELLED') {
              let cancelLabel = 'Bekor qilindi';
              if (item.cancelledBy === 'NOSHOW') cancelLabel = 'Kelmadi';
              else if (item.cancelledBy === 'NOSHOW_UNREACHABLE') cancelLabel = 'Telefonga javob bermadi';
              badge = `<span style="color:#dc2626; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(220,38,38,0.1); border-radius:4px;">${cancelLabel}</span>`;
            }

            const docName = item.doctor ? `Dr. ${item.doctor.lastName}` : 'Noma\'lum shifokor';
            const procName = item.procedure ? item.procedure.name : 'Konsultatsiya';
            const noteText = item.cancelNote ? `<div style="font-size:0.75rem; color:#dc2626; margin-top:4px; font-weight:500;">Sabab: ${item.cancelNote}</div>` : '';

            return `
              <div style="padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; font-size:0.85rem; color:#334155;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:600; color:#0f172a;">📅 Bron: ${procName}</span>
                  ${badge}
                </div>
                <div style="color:#64748b; margin-top:4px; font-size:0.8rem;">
                  <span>${timeStr}</span> &bull; <span>${docName}</span>
                </div>
                ${noteText}
              </div>
            `;
          } else {
            let badge = '';
            if (item.status === 'IN_PROGRESS') {
              badge = '<span style="color:#a855f7; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(168,85,247,0.1); border-radius:4px;">Muolajada</span>';
            } else {
              badge = '<span style="color:#0d9488; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(13,148,136,0.1); border-radius:4px;">Tugatildi</span>';
            }

            const docName = item.doctor ? `Dr. ${item.doctor.lastName}` : 'Noma\'lum shifokor';
            const noteText = item.note ? `<div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Izoh: ${item.note}</div>` : '';
            const paymentText = item.paidAmount >= item.price
              ? `<span style="color:#16a34a; font-weight:600;">To'liq to'landi (${item.price.toLocaleString()} so'm)</span>`
              : `<span style="color:#dc2626; font-weight:600;">Qisman to'landi (${item.paidAmount.toLocaleString()} / ${item.price.toLocaleString()} so'm)</span>`;

            return `
              <div style="padding:10px 12px; background:#f0fdfa; border:1px solid #ccfbf1; border-radius:10px; font-size:0.85rem; color:#334155;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:600; color:#0f172a;">⚡ Tashrif: ${item.serviceName}</span>
                  ${badge}
                </div>
                <div style="color:#64748b; margin-top:4px; font-size:0.8rem;">
                  <span>${timeStr}</span> &bull; <span>${docName}</span>
                </div>
                <div style="margin-top:4px; font-size:0.8rem;">
                  ${paymentText}
                </div>
                ${noteText}
              </div>
            `;
          }
        }).join('');
      } else {
        document.getElementById('ph-history-list').innerHTML = '<div class="empty-state" style="color:red;">Bemor ma\'lumotlarini yuklab bo\'lmadi.</div>';
      }
    } catch (err) {
      console.error(err);
      document.getElementById('ph-history-list').innerHTML = '<div class="empty-state" style="color:red;">Tarmoq xatoligi.</div>';
    }
  }

  function closePatientHistoryModal() {
    document.getElementById('patient-history-modal').style.display = 'none';
  }