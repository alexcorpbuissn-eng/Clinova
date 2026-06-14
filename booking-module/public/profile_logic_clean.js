const API = '';
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    window.location.href = 'login.html?return=profile.html';
  }

  function logout() {
    localStorage.removeItem('patientId');
    localStorage.removeItem('fFirst');
    localStorage.removeItem('fLast');
    localStorage.removeItem('fPhone');
    window.location.href = 'index.html';
  }

  function switchProfileTab(tabId, btnElement) {
    document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    document.querySelectorAll('.profile-tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
  }

  function err(msg) {
    const e = document.getElementById('err');
    e.textContent = msg;
    e.classList.add('on');
    document.getElementById('success').classList.remove('on');
  }

  function success(msg) {
    const e = document.getElementById('success');
    e.textContent = msg;
    e.classList.add('on');
    document.getElementById('err').classList.remove('on');
  }

  function clearMsgs() {
    document.getElementById('err').classList.remove('on');
    document.getElementById('success').classList.remove('on');
  }

  async function fetchProfile() {
    try {
      const res = await fetch(`${API}/api/public/profile?patientId=${patientId}`);
      const data = await res.json();
      document.getElementById('loader').style.display = 'none';

      if (res.ok && data.success) {
        document.getElementById('profile-content').style.display = 'block';
        document.getElementById('fFirst').value = data.patient.firstName || '';
        document.getElementById('fLast').value = data.patient.lastName || '';
        
        document.getElementById('sidebar-name').textContent = `${data.patient.firstName || ''} ${data.patient.lastName || ''}`;
        document.getElementById('sidebar-avatar').textContent = (data.patient.firstName || 'B')[0].toUpperCase();
        
        const idEl = document.getElementById('sidebar-id');
        if(idEl) idEl.textContent = data.patient.id || patientId;
        
        // Populate stats
        if (data.stats) {
          document.getElementById('hist-total-visits').textContent = data.stats.totalVisits;
          document.getElementById('hist-total-paid').textContent = new Intl.NumberFormat('uz-UZ').format(data.stats.totalPaid) + " so'm";
        }

        // Format phone nicely
        let phone = data.patient.telegramPhone || '';
        if (phone.startsWith('+')) {
          document.getElementById('fTgPhone').value = phone;
          document.getElementById('fTgPhone').dispatchEvent(new Event('input'));
          document.getElementById('sidebar-phone').textContent = phone;
        } else {
           document.getElementById('fTgPhone').value = '+' + phone;
           document.getElementById('fTgPhone').dispatchEvent(new Event('input'));
           document.getElementById('sidebar-phone').textContent = '+' + phone;
        }

      } else {
        document.getElementById('profile-content').style.display = 'block';
        err(data.error || "Ma'lumotlarni yuklashda xatolik yuz berdi");
      }
    } catch (e) {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('profile-content').style.display = 'block';
      err("Server bilan bog'lanishda xatolik");
    }
  }

  // --- Appointments Logic ---
  let activeIntervals = [];

  function fmtTime(utcStr) {
    return new Date(utcStr).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tashkent'});
  }
  function fmtDate(utcStr) {
    const _d = new Date(utcStr);
    const _uzMonths = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    return `${_d.getDate()}-${_uzMonths[_d.getMonth()]} ${_d.getFullYear()}`;
  }

  // --- Drafts Logic ---
  async function fetchDrafts() {
    const c = document.getElementById('drafts-container');
    try {
      const res = await fetch(`/api/public/drafts?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.drafts.length === 0) {
          c.innerHTML = `<div style="color:var(--text-muted); padding:20px; text-align:center; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">Hozircha rejalashtirilgan muolajalar yo'q.</div>`;
          return;
        }
        c.innerHTML = data.drafts.map(d => `
          <div class="appt-card">
            <div class="appt-header">
              <span class="appt-status status-active" style="background:#fef3c7; color:#d97706; border:1px solid #fde68a;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Saqlangan
              </span>
            </div>
            <div class="appt-details">
              <div class="appt-doc">🩺 Dr. ${d.doctor.firstName} ${d.doctor.lastName} <span style="font-size:0.8rem;color:#64748b;">(${d.doctor.specialty})</span></div>
              <div class="appt-proc">💉 ${d.procedure.name}</div>
            </div>
            <div class="appt-actions" style="border-top:1px solid var(--border); padding-top:12px; margin-top:12px;">
              <button class="btn-action-appt" onclick="window.location.href='/booking.html?draftId=${d.id}'" style="background:var(--teal); color:#fff; border:none; padding:10px 16px; border-radius:8px; font-weight:600; cursor:pointer;">
                Davom etish (Sana tanlash)
              </button>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
      c.innerHTML = '<div style="color:red; padding:20px;">Xatolik yuz berdi.</div>';
    }
  }

  async function fetchAppts() {
    try {
      const res = await fetch(`${API}/api/public/appointments?patientId=${patientId}`);
      if (!res.ok) return;
      const data = await res.json();
      renderAppts(data.appointments, data.remainingCancellations);
    } catch (e) {
      console.error(e);
    }
  }

  function renderAppts(appts, remainingCancellations) {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    const c = document.getElementById('appt-container');
    const info = document.getElementById('cancel-info');
    
    if (remainingCancellations !== undefined) {
      if (remainingCancellations === 0) {
        info.innerHTML = `Siz bugungi bekor qilish limitidan (2 ta) to'liq foydalandingiz.<br><strong style="color:#be123c; display:inline-block; margin-top:6px;">Muammoni hal qilish uchun markaz bilan bog'laning: +998 90 123 45 67</strong>`;
        info.style.background = '#fff1f2';
        info.style.border = '1px solid #fecdd3';
        info.style.color = '#be123c';
      } else {
        info.innerHTML = `Sizda bugun bekor qilish uchun <strong>${remainingCancellations} ta</strong> urinish qoldi (Maksimum 2 ta).`;
        info.style.background = '#e0f2fe';
        info.style.border = '1px solid #bae6fd';
        info.style.color = 'var(--navy)';
      }
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }

    if (!appts || appts.length === 0) {
      c.innerHTML = `
        <div class="empty-state">
          <h3>Sizda faol qabullar yo'q</h3>
          <p>Yangi qabulga yozilish uchun shifokor tanlang.</p>
          <a href="booking.html" class="btn-submit-booking" style="display:inline-block;padding:10px 24px;border-radius:8px; text-decoration: none; width: auto;">Yangi qabul</a>
        </div>
      `;
      return;
    }

    c.innerHTML = '';
    appts.forEach(a => {
      const card = document.createElement('div');
      card.style = 'background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;';
      
      const timerId = `timer-${a.id}`;
      const btnId = `btn-${a.id}`;

      card.innerHTML = `
        <div class="appt-info">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: #dcfce7; color: #166534; margin-bottom: 10px;">Faol</span>
          <h3 style="margin: 0 0 6px; font-size: 1.1rem; color: var(--navy);">Dr. ${a.doctor.firstName} ${a.doctor.lastName}</h3>
          <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Protsedura: <strong style="color: var(--teal-dark);">${a.procedure.name}</strong></p>
          <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Sana: <strong style="color: var(--teal-dark);">${fmtDate(a.slot.startTime)}, ${fmtTime(a.slot.startTime)}</strong></p>
        </div>
        <div style="text-align:right">
          <div id="${timerId}" style="font-size:0.85rem; color:#ef4444; margin-bottom: 8px; font-weight: 500;"></div>
          <button id="${btnId}" onclick="cancelAppt('${a.id}', this)" style="display:none; background: #fee2e2; color: #991b1b; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Bekor qilish</button>
        </div>
      `;
      c.appendChild(card);

      const bookedAt = new Date(a.createdAt).getTime();
      const slotTime = new Date(a.slot.startTime).getTime();

      function updateTimer() {
        const now = Date.now();
        const minsSince = (now - bookedAt) / 60000;
        
        let canCancel = false;
        let timeText = '';
        
        if (remainingCancellations === 0) {
          timeText = "Markaz bilan bog'laning: +998 90 123 45 67";
        } else if (minsSince <= 15) {
          canCancel = true;
          const timeLeftMs = (bookedAt + 15 * 60000) - now;
          const m = Math.floor(timeLeftMs / 60000);
          const s = Math.floor((timeLeftMs % 60000) / 1000);
          timeText = `Bekor qilish: ${m} daq ${s} soniya`;
        } else {
          timeText = "Bekor qilish vaqti o'tib ketgan.";
        }

        const timerEl = document.getElementById(timerId);
        const btnEl = document.getElementById(btnId);
        
        if (timerEl) timerEl.textContent = timeText;
        if (btnEl) {
          if (canCancel) {
            btnEl.style.display = 'inline-block';
          } else {
            btnEl.style.display = 'none';
          }
        }
      }
      
      updateTimer();
      activeIntervals.push(setInterval(updateTimer, 1000));
    });
  }

  async function cancelAppt(id, btn) {
    if (!confirm('Haqiqatan ham qabulni bekor qilmoqchimisiz?')) return;
    btn.disabled = true;
    btn.textContent = 'Kuting...';
    try {
      const res = await fetch(`${API}/api/public/appointments/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, patientId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Qabul bekor qilindi.');
        fetchAppts();
      } else {
        alert(data.error || 'Bekor qilishda xatolik yuz berdi');
        btn.disabled = false;
        btn.textContent = 'Bekor qilish';
      }
    } catch (e) {
      alert('Server xatosi');
      btn.disabled = false;
      btn.textContent = 'Bekor qilish';
    }
  }

  document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    clearMsgs();

    const fFirst = document.getElementById('fFirst').value.trim();
    const fLast = document.getElementById('fLast').value.trim();
    const fTgPhone = document.getElementById('fTgPhone').value.trim();

    // Strict phone validation
    const phoneRegex = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;
    if (!phoneRegex.test(fTgPhone)) {
      err("Iltimos, to'g'ri O'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX).");
      return;
    }

    const btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.textContent = 'Saqlanmoqda...';

    try {
      const res = await fetch(`${API}/api/public/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          firstName: fFirst,
          lastName: fLast,
          telegramPhone: fTgPhone
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.phoneChanged) {
           alert("Raqamingiz muvaffaqiyatli o'zgartirildi! Tizimga yangi raqamingiz orqali qayta kiring.");
           logout();
        } else {
           // Update local storage just in case
           localStorage.setItem('fFirst', data.patient.firstName);
           localStorage.setItem('fLast', data.patient.lastName);
           localStorage.setItem('fPhone', data.patient.telegramPhone);
           
           success("Ma'lumotlaringiz saqlandi!");
           // Update navbar text by reloading page or dispatching an event, simple reload is robust:
           setTimeout(() => { window.location.reload(); }, 1500);
        }
      } else {
        err(data.error || "Saqlashda xatolik yuz berdi");
      }
    } catch (error) {
      err("Server bilan bog'lanishda xatolik");
    }

    btn.disabled = false;
    btn.textContent = 'Saqlash';
  });

  fetchProfile();
  fetchDrafts();
  fetchAppts();