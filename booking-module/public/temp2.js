
  const API = '';
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    window.location.href = 'login.html?return=my-appointments.html';
  }

  function logout() {
    localStorage.removeItem('patientId');
    localStorage.removeItem('fFirst');
    localStorage.removeItem('fLast');
    localStorage.removeItem('fPhone');
    window.location.href = 'index.html';
  }

  function fmtTime(utcStr) {
    return new Date(utcStr).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tashkent'});
  }
  function fmtDate(utcStr) {
    return new Date(utcStr).toLocaleDateString('uz-UZ',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Tashkent'});
  }

  async function fetchAppts() {
    try {
      const res = await fetch(`${API}/api/public/appointments?patientId=${patientId}`);
      const data = await res.json();
      document.getElementById('loader').style.display = 'none';

      if (!res.ok) {
        document.getElementById('error').textContent = data.error || 'Xatolik yuz berdi';
        document.getElementById('error').style.display = 'block';
        return;
      }

      renderAppts(data.appointments, data.remainingCancellations);
    } catch (e) {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('error').textContent = "Server bilan bog'lanishda xatolik";
      document.getElementById('error').style.display = 'block';
    }
  }

  let activeIntervals = [];

  function renderAppts(appts, remainingCancellations) {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    const c = document.getElementById('appt-container');
    const info = document.getElementById('cancel-info');
    
    if (remainingCancellations !== undefined) {
      info.innerHTML = `Sizda bugun bekor qilish uchun <strong>${remainingCancellations} ta</strong> urinish qoldi (Maksimum 2 ta).`;
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }

    if (!appts || appts.length === 0) {
      c.innerHTML = `
        <div class="empty-state">
          <h3>Sizda faol qabullar yo'q</h3>
          <p>Yangi qabulga yozilish uchun shifokor tanlang.</p>
          <a href="booking.html" class="btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px">Yangi qabul</a>
        </div>
      `;
      return;
    }

    c.innerHTML = '';
    appts.forEach(a => {
      const card = document.createElement('div');
      card.className = 'appt-card';
      
      const timerId = `timer-${a.id}`;
      const btnId = `btn-${a.id}`;

      card.innerHTML = `
        <div class="appt-info">
          <span class="appt-status status-active">Faol</span>
          <h3>Dr. ${a.doctor.firstName} ${a.doctor.lastName}</h3>
          <p>Protsedura: <strong>${a.procedure.name}</strong></p>
          <p>Sana: <strong>${fmtDate(a.slot.startTime)}, ${fmtTime(a.slot.startTime)}</strong></p>
        </div>
        <div style="text-align:right">
          <div id="${timerId}" style="font-size:0.85rem; color:#ef4444; margin-bottom: 8px; font-weight: 500;"></div>
          <button id="${btnId}" class="btn-cancel" onclick="cancelAppt('${a.id}', this)" style="display:none;">Bekor qilish</button>
        </div>
      `;
      c.appendChild(card);

      const bookedAt = new Date(a.createdAt).getTime();
      const slotTime = new Date(a.slot.startTime).getTime();

      function updateTimer() {
        const now = Date.now();
        const minsSince = (now - bookedAt) / 60000;
        const hoursUntil = (slotTime - now) / 3600000;
        
        let canCancel = false;
        let timeText = '';
        
        if (remainingCancellations === 0) {
          timeText = "Bugun bekor qilish limiti tugadi";
        } else if (minsSince <= 15) {
          canCancel = true;
          const timeLeftMs = (bookedAt + 15 * 60000) - now;
          const m = Math.floor(timeLeftMs / 60000);
          const s = Math.floor((timeLeftMs % 60000) / 1000);
          timeText = `Bekor qilish: ${m} daq ${s} soniya`;
        } else if (hoursUntil >= 24) {
          canCancel = true;
          const timeLeftMs = slotTime - 24 * 3600000 - now;
          const h = Math.floor(timeLeftMs / 3600000);
          const m = Math.floor((timeLeftMs % 3600000) / 60000);
          timeText = `Bekor qilish: ${h} soat ${m} daq`;
        } else {
          timeText = "Vaqt o'tgan (Klinika bilan bog'laning)";
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

  fetchAppts();
