
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

      renderAppts(data.appointments);
    } catch (e) {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('error').textContent = "Server bilan bog'lanishda xatolik";
      document.getElementById('error').style.display = 'block';
    }
  }

  function renderAppts(appts) {
    const c = document.getElementById('appt-container');
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
      
      const bookedAt = new Date(a.createdAt);
      const slotTime = new Date(a.slot.startTime);
      const now = new Date();
      const minsSince = (now - bookedAt) / 60000;
      const hoursUntil = (slotTime - now) / 3600000;
      
      let canCancel = (minsSince <= 15) || (hoursUntil >= 24);

      card.innerHTML = `
        <div class="appt-info">
          <span class="appt-status status-active">Faol</span>
          <h3>Dr. ${a.doctor.firstName} ${a.doctor.lastName}</h3>
          <p>Protsedura: <strong>${a.procedure.name}</strong></p>
          <p>Sana: <strong>${fmtDate(a.slot.startTime)}, ${fmtTime(a.slot.startTime)}</strong></p>
        </div>
        <div>
          ${canCancel 
            ? `<button class="btn-cancel" onclick="cancelAppt('${a.id}', this)">Bekor qilish</button>` 
            : `<p style="font-size:0.8rem;color:#ef4444;max-width:140px;text-align:right;margin:0">Vaqt o'tgan (Klinika bilan bog'laning)</p>`}
        </div>
      `;
      c.appendChild(card);
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
