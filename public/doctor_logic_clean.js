
  let doctorToken = null;
  let doctorInfo = null;
  let userRole = null;
  let currentDoctorId = null;
  let allSlots = [];
  let pendingChanges = {}; // key: "isoDate_timeStr", value: 'add' | 'remove'
  let copiedSchedule = null;
  let copiedDayLabel = '';
  
  let allVerifiedPatients = [];
  let selectedSlotData = null; // Stores currently clicked slot metadata {iso, time, id}
  
  const START_HOUR = 9;
  const END_HOUR = 17;
  const INTERVAL = 30; // minutes

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

  // ---- Tashkent Timezone Date Helpers ----
  function getTashkentISO(date) {
    // Add UTC+5 to get Tashkent local time, then extract date parts
    const tashkent = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    const year = tashkent.getUTCFullYear();
    const month = String(tashkent.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tashkent.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseTashkentDateTime(isoDateStr, timeStr) {
    // Exact UTC Date constructor for Tashkent timeStr
    return new Date(`${isoDateStr}T${timeStr}:00+05:00`);
  }

  function getTashkentDays() {
    const days = [];
    const now = new Date();
    // Get current Tashkent time (UTC+5)
    const tashkentNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    // Zero out to start of day in Tashkent
    const tashkentToday = new Date(Date.UTC(
      tashkentNow.getUTCFullYear(),
      tashkentNow.getUTCMonth(),
      tashkentNow.getUTCDate()
    ));

    for (let i = 0; i < 7; i++) {
      const d = new Date(tashkentToday.getTime() + i * 24 * 60 * 60 * 1000);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;
      
      // Use Tashkent-aware date for display labels
      const displayDate = new Date(`${iso}T12:00:00+05:00`);
      days.push({
        iso,
        label: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'][displayDate.getDay()],
        dateNum: d.getUTCDate(),
        monthLabel: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][displayDate.getMonth()]
      });
    }
    return days;
  }

  function updateClock() {
    const now = new Date();
    document.getElementById('top-date').textContent = now.toLocaleString('uz-UZ', {
      weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent'
    });
  }

  function applyPhoneFormatter(input) {
    input.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('998')) val = val.substring(3);
      val = val.substring(0, 9);
      let formatted = '+998 ';
      if (val.length > 0) formatted += val.substring(0, 2) + ' ';
      if (val.length > 2) formatted += val.substring(2, 5) + ' ';
      if (val.length > 5) formatted += val.substring(5, 7) + ' ';
      if (val.length > 7) formatted += val.substring(7, 9);
      e.target.value = formatted.trim();
    });
  }

  // ---- Authentication & Initialisation ----
  window.addEventListener('DOMContentLoaded', async () => {
    applyPhoneFormatter(document.getElementById('telegram-phone'));
    applyPhoneFormatter(document.getElementById('patient-phone-input'));
    
    const t = localStorage.getItem('doctor_token');
    if (t) {
      try {
        const info = localStorage.getItem('doctor_info');
        const role = localStorage.getItem('user_role');
        if (info && role) {
          doctorToken = t;
          doctorInfo = JSON.parse(info);
          userRole = role;
          currentDoctorId = doctorInfo ? doctorInfo.id : null;
          showApp();
        } else { logout(); }
      } catch { logout(); }
    }
  });

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
      errEl.textContent = "Iltimos, to'g'ri raqam kiriting.";
      return;
    }
    errEl.textContent = ''; btn.disabled = true;
    try {
      const res = await fetch('/api/public/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramPhone: phone })
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('phone-form').style.display = 'none';
        document.getElementById('otp-form').style.display = 'block';
      } else { errEl.textContent = data.error || 'Xatolik'; }
    } catch { errEl.textContent = 'Tarmoq xatosi'; }
    btn.disabled = false;
  });

  document.getElementById('otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('telegram-phone').value;
    const code = document.getElementById('otp-code').value;
    const errEl = document.getElementById('login-err');
    const btn = document.getElementById('btn-otp');
    errEl.textContent = ''; btn.disabled = true;
    try {
      const res = await fetch('/api/doctor/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramPhone: phone, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        doctorToken = data.token;
        doctorInfo = data.doctor;
        userRole = data.role;
        currentDoctorId = data.doctor ? data.doctor.id : null;
        localStorage.setItem('doctor_token', data.token);
        localStorage.setItem('doctor_info', JSON.stringify(data.doctor));
        localStorage.setItem('user_role', data.role);
        showApp();
      } else { errEl.textContent = data.error || 'Kod noto\'g\'ri'; }
    } catch { errEl.textContent = 'Tarmoq xatosi'; }
    btn.disabled = false;
  });

  function logout() {
    localStorage.clear();
    location.reload();
  }

  async function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    if (userRole === 'ADMIN') {
      document.getElementById('admin-doc-selector').style.display = 'flex';
      // Hide admin schedule editing & templating tools on the doctor panel
      document.getElementById('admin-schedule-tools').style.display = 'none';
      document.getElementById('btn-save-grid').style.display = 'none';
      await loadAllDoctorsForAdmin();
    }

    if (doctorInfo) {
      document.getElementById('doctor-name').textContent = `${doctorInfo.firstName} ${doctorInfo.lastName}`;
    } else {
      document.getElementById('doctor-name').textContent = "Admin";
    }
    
    updateClock();
    setInterval(updateClock, 30000);
    loadData();
    loadVerifiedPatients();
  }

  async function loadAllDoctorsForAdmin() {
    try {
      const res = await fetch('/api/public/doctors');
      const data = await res.json();
      if (data.success && data.doctors.length > 0) {
        const select = document.getElementById('doc-select');
        select.innerHTML = '<option value="">Shifokorni tanlang...</option>' + 
          data.doctors.map(d => `<option value="${d.id}" ${currentDoctorId === d.id ? 'selected' : ''}>${d.firstName} ${d.lastName}</option>`).join('');
        
        // Auto-select first doctor for testing if none is currently selected
        if (!currentDoctorId) {
          switchDoctor(data.doctors[0].id);
        }
      }
    } catch {}
  }

  function switchDoctor(id) {
    if (!id) return;
    currentDoctorId = id;
    const select = document.getElementById('doc-select');
    document.getElementById('doctor-name').textContent = select.options[select.selectedIndex].text;
    pendingChanges = {};
    if (typeof cancelCopyState === 'function') cancelCopyState();
    loadData();
  }

  function loadData() {
    loadGrid();
    loadAppointments();
    loadDoctorPatients();
  }

  async function loadDoctorPatients() {
    const listEl = document.getElementById('doc-patients-list');
    if (!listEl) return;
    if (!currentDoctorId) {
      listEl.innerHTML = '<div class="empty-state">Shifokor tanlanmagan</div>';
      return;
    }

    try {
      const res = await fetch(`/api/doctor/patients?doctorId=${currentDoctorId}`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      if (res.ok && data.success) {
        const patients = (data.patients || []).filter(p => p.phone !== '998000000000' && p.phone !== '+998000000000');

        if (patients.length === 0) {
          listEl.innerHTML = '<div class="empty-state">Tashrif buyurgan bemorlar yo\'q</div>';
          return;
        }

        listEl.innerHTML = patients.map(p => `
          <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group" onclick="openDoctorPatientCard('${p.id}')">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline-sm uppercase border border-primary/20">
                ${p.firstName.charAt(0)}${p.lastName ? p.lastName.charAt(0) : ''}
              </div>
              <div class="flex flex-col">
                <span class="font-headline-sm text-on-surface group-hover:text-primary transition-colors">${p.firstName} ${p.lastName}</span>
                <span class="font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-[16px] text-outline">call</span> ${p.phone}</span>
              </div>
            </div>
            <div class="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label-md flex items-center gap-1">
              ${p.visitCount} marta
            </div>
          </div>
        `).join('');
      } else {
        listEl.innerHTML = '<div class="empty-state">Yuklashda xatolik yuz berdi</div>';
      }
    } catch (err) {
      console.error('Error loading doctor patients:', err);
      listEl.innerHTML = '<div class="empty-state">Tarmoq xatosi</div>';
    }
  }

  // ---- Verified Patients Loader ----
  async function loadVerifiedPatients() {
    try {
      const res = await fetch('/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      if (res.ok && data.success) {
        allVerifiedPatients = data.patients;
      }
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  }

  // ---- Grid Render & Fetch ----
  async function loadGrid() {
    if (!currentDoctorId) {
      allSlots = [];
      renderGrid();
      updateStats();
      return;
    }
    try {
      const res = await fetch(`/api/doctor/slots?doctorId=${currentDoctorId}`, { headers: { 'Authorization': `Bearer ${doctorToken}` } });
      if (res.status === 401) return logout();
      const data = await res.json();
      if (res.ok && data.success) {
        allSlots = data.slots;
        renderGrid();
        updateStats();
      } else {
        console.error("Grid fetch failed", data);
        allSlots = [];
        renderGrid();
        updateStats();
      }
    } catch (e) { 
      console.error(e); 
      allSlots = [];
      renderGrid();
      updateStats();
    }
  }

  function renderGrid() {
    const header = document.getElementById('grid-header');
    const labels = document.getElementById('time-labels');
    const columns = document.getElementById('grid-columns');
    
    const days = getTashkentDays();

    // Update copy shablon select options dynamically
    const copySelect = document.getElementById('copy-day-select');
    if (copySelect && userRole === 'ADMIN') {
      const prevVal = copySelect.value;
      copySelect.innerHTML = '<option value="">Kunni tanlang...</option>' + 
        days.map(d => `<option value="${d.iso}">${d.label} (${d.dateNum} ${d.monthLabel})</option>`).join('');
      if (prevVal) copySelect.value = prevVal;
    }

    header.innerHTML = '<div class="weekly-header-cell flex-shrink-0" style="width:70px"></div>' + 
      days.map(d => {
        const isToday = d.iso === getTashkentISO(new Date());
        const showPaste = (copiedSchedule !== null) && d.iso !== (copySelect ? copySelect.value : '') && userRole === 'ADMIN';
        const pasteBtn = showPaste ? `
          <button onclick="pasteToDay('${d.iso}', event)" title="Joylash" style="background:rgba(29, 158, 117, 0.25); color:var(--color-open); border:1px solid var(--color-open); padding:2px 6px; border-radius:6px; font-size:0.6rem; margin-top:5px; cursor:pointer;">📥 Joylash</button>
        ` : '';

        return `
          <div class="weekly-header-cell flex-1 ${isToday ? 'today' : ''}">
            <span class="day-name">${d.label}</span>
            <span class="day-date">${d.dateNum}</span>
            ${pasteBtn}
          </div>
        `;
      }).join('');

    const times = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      for (let m = 0; m < 60; m += INTERVAL) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    labels.innerHTML = times.map(t => `<div class="time-cell">${t}</div>`).join('');

    columns.innerHTML = days.map(d => {
      return `
        <div class="day-col">
          ${times.map(t => {
            const key = `${d.iso}_${t}`;
            const slotDateTime = parseTashkentDateTime(d.iso, t);
            const isPast = slotDateTime.getTime() < Date.now();

            const existing = allSlots.find(s => {
              const sStart = new Date(s.startTime).getTime();
              const sEnd = sStart + s.duration * 60000;
              return slotDateTime.getTime() >= sStart && slotDateTime.getTime() < sEnd;
            });
            
            let statusClass = '';
            let label = '';
            let isBooked = false;
            let bookedSubclass = '';
            let apptObj = null;
            let styleAttr = '';

            let activeAppt = null;
            let activeApptSlot = null;

            allSlots.forEach(s => {
              if (s.appointment && s.appointment.status !== 'CANCELLED') {
                const apptStart = new Date(s.startTime).getTime();
                const apptDuration = (s.appointment.procedure && s.appointment.procedure.durationMinutes) || s.duration || 30;
                const apptEnd = apptStart + apptDuration * 60000;
                if (slotDateTime.getTime() >= apptStart && slotDateTime.getTime() < apptEnd) {
                  activeAppt = s.appointment;
                  activeApptSlot = s;
                }
              }
            });

            if (existing) {
              statusClass = 'active';
              
              if (activeAppt) {
                isBooked = true;
                statusClass = 'booked';
                apptObj = activeAppt;

                const isStart = slotDateTime.getTime() === new Date(activeApptSlot.startTime).getTime();
                const apptDuration = (activeAppt.procedure && activeAppt.procedure.durationMinutes) || 30;
                const apptEnd = new Date(activeApptSlot.startTime).getTime() + apptDuration * 60000;
                const isEnd = (slotDateTime.getTime() + 30 * 60000) >= apptEnd;

                if (apptDuration > 30) {
                  if (isStart) {
                    styleAttr = 'style="border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none;"';
                  } else if (isEnd) {
                    styleAttr = 'style="border-top-left-radius: 0; border-top-right-radius: 0; border-top: none;"';
                  } else {
                    styleAttr = 'style="border-radius: 0; border-top: none; border-bottom: none;"';
                  }
                }

                // Color codes
                const isBreak = apptObj.patientPhone === '+998000000000' || apptObj.patientFirst === 'Tanaffus';
                if (isBreak) {
                  bookedSubclass = 'status-break';
                  if (isStart) {
                    label = `<span class="patient-lbl">☕ Tanaffus</span>`;
                  } else {
                    label = `<span class="patient-lbl" style="font-size:0.65rem; opacity:0.6; font-weight:600;">☕ Tanaffus (davomi)</span>`;
                  }
                } else {
                  if (apptObj.procedure && apptObj.procedure.name.toLowerCase().includes('konsul')) {
                    bookedSubclass = 'status-open';
                    if (isStart) {
                      label = `<span class="patient-lbl">${apptObj.patientFirst} ${apptObj.patientLast[0]}.</span><span class="procedure-lbl">Konsultatsiya</span>`;
                    } else {
                      label = `<span class="patient-lbl" style="font-size:0.65rem; opacity:0.6; font-weight:600;">↳ ${apptObj.patientFirst} ${apptObj.patientLast[0]}. (davomi)</span>`;
                    }
                  } else if (apptObj.description && apptObj.description.toLowerCase().includes('takroriy')) {
                    bookedSubclass = 'status-followup';
                    if (isStart) {
                      label = `<span class="patient-lbl">${apptObj.patientFirst} ${apptObj.patientLast[0]}.</span><span class="procedure-lbl">Takroriy qabul</span>`;
                    } else {
                      label = `<span class="patient-lbl" style="font-size:0.65rem; opacity:0.6; font-weight:600;">↳ ${apptObj.patientFirst} ${apptObj.patientLast[0]}. (davomi)</span>`;
                    }
                  } else {
                    bookedSubclass = 'status-busy';
                    if (isStart) {
                      label = `<span class="patient-lbl">${apptObj.patientFirst} ${apptObj.patientLast[0]}.</span><span class="procedure-lbl">${apptObj.procedure ? apptObj.procedure.name : 'Birlamchi'}</span>`;
                    } else {
                      label = `<span class="patient-lbl" style="font-size:0.65rem; opacity:0.6; font-weight:600;">↳ ${apptObj.patientFirst} ${apptObj.patientLast[0]}. (davomi)</span>`;
                    }
                  }
                }
              }
            }
            
            if (pendingChanges[key] === 'add') statusClass = 'pending';
            if (pendingChanges[key] === 'remove') statusClass = '';
            
            if (isPast && !existing) {
              statusClass += ' disabled';
            }

            const onClickAttr = isPast && !isBooked ? '' : `onclick="handleCellClick('${d.iso}', '${t}', '${existing ? existing.id : ''}', ${isBooked}, ${apptObj ? `'${apptObj.id}'` : 'null'})"`;

            return `
              <div class="grid-cell">
                <button class="slot-btn ${statusClass} ${bookedSubclass}" ${onClickAttr} ${styleAttr}>
                  ${label}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  function handleCellClick(iso, time, existingId, isBooked, apptId) {
    if (!currentDoctorId) {
      showToast("Iltimos, avval shifokorni tanlang!", "error");
      return;
    }
    
    selectedSlotData = { iso, time, id: existingId, apptId };

    if (isBooked && apptId) {
      // Open Booked Appointment Details
      openDetailsModal(apptId);
      return;
    }

    if (userRole === 'DOCTOR') {
      showToast("Qabullarni faqat admin yoki retseptsiya yozishi mumkin", "info");
    } else {
      // RECEPTION or other roles can book
      if (existingId) {
        openBookingModal(iso, time, existingId);
      } else {
        showToast("Ushbu vaqt shifokor ish grafigiga kiritilmagan", "error");
      }
    }
  }

  async function saveGridChanges() {
    const btn = document.getElementById('btn-save-grid');
    const toCreate = [];
    const toDelete = [];

    for (const [key, action] of Object.entries(pendingChanges)) {
      const [iso, time] = key.split('_');
      const dt = parseTashkentDateTime(iso, time);
      
      if (action === 'add') {
        toCreate.push({ startTime: dt.toISOString(), duration: INTERVAL });
      } else if (action === 'remove') {
        const existing = allSlots.find(s => {
          const sStart = new Date(s.startTime).getTime();
          return dt.getTime() === sStart;
        });
        if (existing && !toDelete.includes(existing.id)) toDelete.push(existing.id);
      }
    }

    if (!toCreate.length && !toDelete.length) return;
    btn.disabled = true; btn.textContent = 'Saqlanmoqda...';

    try {
      for (const id of toDelete) {
        await fetch('/api/doctor/slots', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
          body: JSON.stringify({ slotId: id, doctorId: currentDoctorId })
        });
      }
      if (toCreate.length) {
        await fetch('/api/doctor/slots', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
          body: JSON.stringify({ doctorId: currentDoctorId, slots: toCreate })
        });
      }
      pendingChanges = {};
      await loadGrid();
      showToast("Muvaffaqiyatli saqlandi!", "success");
    } catch (e) { showToast("Xatolik yuz berdi", "error"); }
    btn.disabled = false; btn.textContent = 'Saqlash';
  }

  // ---- Advanced Booking Modal Logic ----
  async function openBookingModal(iso, time, slotId) {
    const modal = document.getElementById('booking-modal');
    document.getElementById('booking-modal-title').textContent = `📅 Yangi qabul: ${iso}, ${time}`;
    
    // Reset inputs
    document.getElementById('modal-break-toggle').checked = false;
    document.getElementById('modal-new-patient-toggle').checked = false;
    document.getElementById('patient-search-input').value = '';
    document.getElementById('selected-patient-id').value = '';
    document.getElementById('patient-first-name').value = '';
    document.getElementById('patient-last-name').value = '';
    document.getElementById('patient-phone-input').value = '';
    document.getElementById('modal-description-input').value = '';
    document.getElementById('modal-multi-day-toggle').checked = false;
    
    toggleBreakMode(false);
    toggleNewPatientMode(false);
    toggleMultiDayList(false);

    // Fetch and populate procedures
    await loadProceduresForModal();

    modal.classList.add('active');
  }

  function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
  }

  function toggleBreakMode(checked) {
    const wrapper = document.getElementById('booking-fields-wrapper');
    const submitBtn = document.getElementById('btn-modal-submit');
    if (checked) {
      wrapper.style.opacity = '0.4';
      wrapper.style.pointerEvents = 'none';
      submitBtn.textContent = '☕ Tanaffus qo\'shish';
      submitBtn.style.background = 'var(--color-break)';
    } else {
      wrapper.style.opacity = '1';
      wrapper.style.pointerEvents = 'auto';
      submitBtn.textContent = 'Band qilish';
      submitBtn.style.background = 'var(--color-open)';
    }
  }

  function toggleNewPatientMode(checked) {
    const searchSection = document.getElementById('patient-search-section');
    const createSection = document.getElementById('patient-create-section');
    if (checked) {
      searchSection.style.display = 'none';
      createSection.style.display = 'block';
    } else {
      searchSection.style.display = 'block';
      createSection.style.display = 'none';
    }
  }

  function toggleMultiDayList(checked) {
    const checklist = document.getElementById('multi-day-checklist');
    if (checked) {
      checklist.style.display = 'block';
      
      // Generate checkboxes for the next 5 subsequent days at the same time slot
      const days = [];
      const baseIso = selectedSlotData.iso;
      const baseTime = selectedSlotData.time;
      const baseDate = parseTashkentDateTime(baseIso, baseTime);

      let html = '';
      for (let i = 1; i <= 5; i++) {
        const nextDay = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
        const nextIso = getTashkentISO(nextDay);
        
        // Find if this slot exists in Ish Grafigi (slots list)
        const slotExists = allSlots.some(s => {
          const sStart = new Date(s.startTime).getTime();
          const targetStart = parseTashkentDateTime(nextIso, baseTime).getTime();
          return sStart === targetStart && s.isAvailable;
        });

        const dayName = `${['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][nextDay.getDay()]}, ${nextDay.getDate()} ${['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][nextDay.getMonth()]}`;
        html += `
          <label class="checklist-item" style="${!slotExists ? 'opacity:0.4; cursor:not-allowed;' : ''}">
            <input type="checkbox" name="multi-day-chk" value="${nextIso}" ${!slotExists ? 'disabled' : ''} />
            <span>${dayName} (${baseTime}) ${!slotExists ? '<b style="color:var(--red); font-size:0.7rem;">(Bo\'sh emas / Kiritilmagan)</b>' : ''}</span>
          </label>
        `;
      }
      checklist.innerHTML = html || '<div style="font-size:0.8rem; color:var(--text-muted);">Keyingi kunlarda ish grafigi topilmadi.</div>';
    } else {
      checklist.style.display = 'none';
      checklist.innerHTML = '';
    }
  }

  async function loadProceduresForModal() {
    const select = document.getElementById('modal-procedure-select');
    select.innerHTML = '<option value="">Yuklanmoqda...</option>';
    try {
      const res = await fetch(`/api/public/doctors/${currentDoctorId}/procedures`);
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.procedures.length === 0) {
          select.innerHTML = '<option value="">Muolajalar topilmadi</option>';
          return;
        }
        select.innerHTML = data.procedures.map(p => `<option value="${p.id}">${p.name} (${p.durationMinutes} daqiqalik)</option>`).join('');
      } else { select.innerHTML = '<option value="">Yuklashda xatolik</option>'; }
    } catch { select.innerHTML = '<option value="">Xatolik yuz berdi</option>'; }
  }

  // fuzzy-search autocompleter
  function onPatientSearchInput(val) {
    const list = document.getElementById('patient-suggestions');
    if (!val.trim()) {
      list.style.display = 'none';
      return;
    }
    
    const query = val.toLowerCase().replace(/\s+/g, '');
    const filtered = allVerifiedPatients.filter(p => {
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().replace(/\s+/g, '').includes(query);
      const phoneMatch = p.phone.replace(/\D/g, '').includes(query) || p.telegramPhone.replace(/\D/g, '').includes(query);
      return nameMatch || phoneMatch;
    }).slice(0, 5);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="suggestion-item" style="color:var(--text-muted); cursor:default;">Bemor topilmadi. "Yangi bemor" tugmasini bosing</div>';
      list.style.display = 'block';
      return;
    }

    list.innerHTML = filtered.map(p => `
      <div class="suggestion-item" onclick="selectPatient('${p.id}', '${p.firstName} ${p.lastName}', '${p.phone}')">
        👤 <b>${p.firstName} ${p.lastName}</b> (${p.phone})
      </div>
    `).join('');
    list.style.display = 'block';
  }

  function selectPatient(id, name, phone) {
    document.getElementById('selected-patient-id').value = id;
    document.getElementById('patient-search-input').value = `${name} (${phone})`;
    document.getElementById('patient-suggestions').style.display = 'none';
  }

  async function ensureBreakPatient() {
    const res = await fetch('/api/doctor/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
      body: JSON.stringify({
        firstName: 'Tanaffus',
        lastName: '(Dam olish)',
        phone: '998000000000'
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.patient.id;
    }
    throw new Error('Break patient failed');
  }

  async function submitBookingModal() {
    const btn = document.getElementById('btn-modal-submit');
    const isBreak = document.getElementById('modal-break-toggle').checked;
    
    btn.disabled = true;
    
    try {
      let patientId = null;
      let procedureId = null;
      let description = document.getElementById('modal-description-input').value;

      if (isBreak) {
        patientId = await ensureBreakPatient();
        description = "Dam olish (Tanaffus)";
        // Choose first doctor procedure or a dummy
        const procSelect = document.getElementById('modal-procedure-select');
        if (procSelect.options.length > 0) {
          procedureId = procSelect.options[0].value;
        }
      } else {
        const isNewPatient = document.getElementById('modal-new-patient-toggle').checked;
        if (isNewPatient) {
          const fName = document.getElementById('patient-first-name').value;
          const lName = document.getElementById('patient-last-name').value;
          const phone = document.getElementById('patient-phone-input').value;
          if (!fName || !lName || !phone) {
            showToast("Iltimos, barcha majburiy bemor ma'lumotlarini kiriting!", "error");
            btn.disabled = false;
            return;
          }
          const res = await fetch('/api/doctor/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
            body: JSON.stringify({ firstName: fName, lastName: lName, phone })
          });
          const pData = await res.json();
          if (res.ok && pData.success) {
            patientId = pData.patient.id;
          } else {
            showToast(pData.error || "Bemor qo'shishda xato", "error");
            btn.disabled = false;
            return;
          }
        } else {
          patientId = document.getElementById('selected-patient-id').value;
          if (!patientId) {
            showToast("Iltimos, ro'yxatdan bemorni tanlang yoki yangi bemor kiriting!", "error");
            btn.disabled = false;
            return;
          }
        }
        
        procedureId = document.getElementById('modal-procedure-select').value;
        if (!procedureId) {
          showToast("Iltimos, muolajani tanlang!", "error");
          btn.disabled = false;
          return;
        }
      }

      // 1. Book core selected slot
      const mainRes = await fetch('/api/doctor/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
        body: JSON.stringify({ slotId: selectedSlotData.id, procedureId, patientId, description })
      });
      const mainData = await mainRes.json();
      if (!mainRes.ok) {
        showToast(mainData.error || "Band qilishda xatolik yuz berdi", "error");
        btn.disabled = false;
        return;
      }

      // 2. Book multi-day subsequent slots if selected
      const isMulti = document.getElementById('modal-multi-day-toggle').checked;
      if (isMulti && !isBreak) {
        const checkboxes = document.querySelectorAll('input[name="multi-day-chk"]:checked');
        for (const chk of checkboxes) {
          const nextIso = chk.value;
          const nextSlot = allSlots.find(s => {
            const sStart = new Date(s.startTime).getTime();
            const targetStart = parseTashkentDateTime(nextIso, selectedSlotData.time).getTime();
            return sStart === targetStart;
          });

          if (nextSlot && nextSlot.isAvailable) {
            await fetch('/api/doctor/book', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
              body: JSON.stringify({ slotId: nextSlot.id, procedureId, patientId, description: `${description} (Kurs muolaja)`.trim() })
            });
          }
        }
      }

      showToast(isBreak ? "Tanaffus muvaffaqiyatli saqlandi!" : "Qabul muvaffaqiyatli band qilindi!", "success");
      closeBookingModal();
      loadData();
      loadVerifiedPatients();
    } catch (e) {
      showToast("Tizimda xatolik yuz berdi", "error");
    }
    
    btn.disabled = false;
  }

  // ---- Booked Details / Actions Modal Logic ----
  async function openDetailsModal(apptId) {
    const modal = document.getElementById('details-modal');
    
    // Set loading placeholders
    document.getElementById('det-patient-name').textContent = "Yuklanmoqda...";
    document.getElementById('det-patient-phone').textContent = "";
    document.getElementById('det-time').textContent = "";
    document.getElementById('det-procedure').textContent = "";
    document.getElementById('det-description').textContent = "";
    modal.classList.add('active');

    try {
      // Find appointment data from client cache
      const slotWithAppt = allSlots.find(s => s.appointment && s.appointment.id === apptId);
      if (slotWithAppt) {
        const a = slotWithAppt.appointment;
        const st = new Date(slotWithAppt.startTime);
        const timeStr = st.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
        const dateStr = `${st.getDate()} ${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][st.getMonth()]} ${st.getFullYear()}`;
        
        const isBreak = a.patientPhone === '+998000000000' || a.patientFirst === 'Tanaffus';

        document.getElementById('det-patient-name').textContent = isBreak ? "☕ Dam olish (Tanaffus)" : `${a.patientFirst} ${a.patientLast}`;
        document.getElementById('det-patient-phone').textContent = isBreak ? "-" : (a.patient ? a.patient.phone : a.patientPhone);
        document.getElementById('det-time').textContent = `🕒 ${timeStr} (${dateStr})`;
        document.getElementById('det-procedure').textContent = isBreak ? "Dam olish vaqti" : (a.procedure ? a.procedure.name : "Birlamchi qabul");
        document.getElementById('det-description').textContent = a.description || "Yo'q";
        
        if (isBreak) {
          document.getElementById('det-actions-container').style.display = 'none';
        } else {
          document.getElementById('det-actions-container').style.display = 'flex';
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Tafsilotlarni yuklab bo'lmadi", "error");
    }
  }

  function closeDetailsModal() {
    document.getElementById('details-modal').classList.remove('active');
  }



  function cancelDetailAppointment() {
    const apptId = selectedSlotData.apptId;
    if (!apptId) return;

    showConfirm(
      "Kelmadi",
      "Haqiqatan ham ushbu qabulni bekor qilmoqchimisiz?",
      "🛑",
      "Tasdiqlash",
      async () => {
        try {
          const res = await fetch(`/api/admin/appointments/${apptId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${doctorToken}` }
          });
          if (res.ok) {
            showToast("Qabul bekor qilindi!", "success");
            closeDetailsModal();
            loadData();
          } else {
            showToast("Bekor qilishda xatolik yuz berdi", "error");
          }
        } catch {
          showToast("Server bilan bog'lanib bo'lmadi", "error");
        }
      }
    );
  }

  async function completeDetailAppointment() {
    const apptId = selectedSlotData.apptId;
    if (!apptId) return;

    try {
      const res = await fetch(`/api/admin/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
        body: JSON.stringify({ action: 'ATTEND' })
      });
      if (res.ok) {
        showToast("Qabul yakunlandi! Tizimga tashrif sifatida yozildi.", "success");
        closeDetailsModal();
        loadData();
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } catch {
      showToast("Server bilan bog'lanib bo'lmadi", "error");
    }
  }

  // ---- Appointments list and Home tab ----
  async function loadAppointments() {
    const tbody = document.getElementById('appointments-tbody');
    const homeNext = document.getElementById('home-next-patients');
    
    if (!currentDoctorId) {
      if(tbody) tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-on-surface-variant">Shifokorni tanlang...</td></tr>';
      return;
    }
    if(tbody) tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-on-surface-variant">Yuklanmoqda...</td></tr>';
    
    try {
      const res = await fetch(`/api/doctor/appointments?doctorId=${currentDoctorId}`, { headers: { 'Authorization': `Bearer ${doctorToken}` } });
      if (res.status === 401) return logout();
      const data = await res.json();
      
      if (res.ok && data.success) {
        const activeAppts = data.appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS' || a.status === 'ARRIVED');
        
        // Populate Table (all appointments)
        if (tbody) {
          if (data.appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-on-surface-variant">Qabullar topilmadi</td></tr>';
          } else {
            tbody.innerHTML = data.appointments.map(a => {
              const st = new Date(a.slot.startTime);
              const timeStr = st.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
              const dateText = `${String(st.getDate()).padStart(2, '0')}.${String(st.getMonth()+1).padStart(2, '0')}.${st.getFullYear()}`;
              
              const isBreak = a.patientPhone === '+998000000000' || a.patientFirst === 'Tanaffus';
              const patientName = isBreak ? "☕ Tanaffus / Dam olish" : `${a.patientFirst} ${a.patientLast}`;
              const procName = isBreak ? "Tanaffus" : (a.procedure ? a.procedure.name : "Birlamchi qabul");
              
              let statusBadge = '';
              if (a.status === 'SCHEDULED') statusBadge = '<span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-bold">Kutilmoqda</span>';
              if (a.status === 'IN_PROGRESS') statusBadge = '<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">Jarayonda</span>';
              if (a.status === 'COMPLETED') statusBadge = '<span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold">Yakunlangan</span>';
              if (a.status === 'CANCELLED') statusBadge = '<span class="px-3 py-1 bg-error-container text-on-error-container rounded-full text-xs font-bold">Bekor qilingan</span>';

              let actionBtns = '';
              if(a.status === 'SCHEDULED') {
                actionBtns = `
                  <button onclick="sidebarComplete('${a.id}')" class="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs hover:opacity-90">Boshlash</button>
                  <button onclick="sidebarCancel('${a.id}')" class="px-3 py-1 bg-error-container text-error rounded-lg text-xs hover:opacity-90">Kelmadi</button>
                `;
              } else if(a.status === 'IN_PROGRESS') {
                actionBtns = `
                  <button onclick="sidebarComplete('${a.id}')" class="px-3 py-1 bg-secondary text-on-secondary rounded-lg text-xs hover:opacity-90">Tugatish</button>
                `;
              }

              return `
                <tr class="hover:bg-surface-variant/50 transition-colors">
                  <td class="p-4 whitespace-nowrap"><span class="font-bold">${timeStr}</span><br><span class="text-xs text-on-surface-variant">${dateText}</span></td>
                  <td class="p-4 font-bold">${patientName}</td>
                  <td class="p-4 text-on-surface-variant">${procName}</td>
                  <td class="p-4">${statusBadge}</td>
                  <td class="p-4 text-right flex gap-2 justify-end">${actionBtns}</td>
                </tr>
              `;
            }).join('');
          }
        }
        
        // Populate Next 3 Patients in Home Dashboard
        if (homeNext) {
          const next3 = activeAppts.filter(a => !(a.patientPhone === '+998000000000' || a.patientFirst === 'Tanaffus'))
            .sort((a,b) => new Date(a.slot.startTime) - new Date(b.slot.startTime))
            .slice(0, 3);
            
          if (next3.length === 0) {
            homeNext.innerHTML = '<div class="p-4 text-center text-on-surface-variant">Navbatdagi bemorlar yo\'q</div>';
          } else {
            homeNext.innerHTML = next3.map(a => {
              const st = new Date(a.slot.startTime);
              const timeStr = st.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
              return `
                <div class="p-4 grid grid-cols-4 items-center hover:bg-surface-variant/30 transition-colors">
                    <div class="font-bold text-on-surface">${timeStr}</div>
                    <div class="font-bold">${a.patientFirst} ${a.patientLast}</div>
                    <div class="text-on-surface-variant text-sm">${a.procedure ? a.procedure.name : "Birlamchi qabul"}</div>
                    <div><span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-[10px] font-bold">Kutilmoqda</span></div>
                </div>
              `;
            }).join('');
          }
        }

      } else {
        if(tbody) tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-error">❌ Xatolik</td></tr>`;
      }
    } catch (err) {
      if(tbody) tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-error">❌ Ulanishda xatolik yuz berdi</td></tr>';
    }
  }

  function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.nav-item').forEach(el => {
          el.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'active');
          el.classList.add('text-on-surface-variant', 'hover:bg-surface-variant');
      });
      
      document.getElementById(`tab-${tabId}`).style.display = 'block';
      
      const activeNav = document.getElementById(`nav-${tabId}`);
      if(activeNav) {
          activeNav.classList.remove('text-on-surface-variant', 'hover:bg-surface-variant');
          activeNav.classList.add('bg-secondary-container', 'text-on-secondary-container', 'active');
      }
  }
  
  // Set initial tab
  document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => { switchTab('home'); }, 100);
  });

  // Sidebar fast actions


  function sidebarCancel(apptId) {
    showConfirm(
      "Kelmadi",
      "Haqiqatan ham ushbu qabulni bekor qilmoqchimisiz?",
      "🛑",
      "Tasdiqlash",
      async () => {
        try {
          const res = await fetch(`/api/admin/appointments/${apptId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${doctorToken}` }
          });
          if (res.ok) {
            showToast("Qabul bekor qilindi!", "success");
            loadData();
          } else { showToast("Xatolik yuz berdi", "error"); }
        } catch { showToast("Ulanish xatosi", "error"); }
      }
    );
  }

  async function sidebarComplete(apptId) {
    try {
      const res = await fetch(`/api/admin/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
        body: JSON.stringify({ action: 'ATTEND' })
      });
      if (res.ok) {
        showToast("Qabul yakunlandi!", "success");
        loadData();
      } else { showToast("Xatolik yuz berdi", "error"); }
    } catch { showToast("Ulanish xatosi", "error"); }
  }

  function updateStats() {
    const todayIso = getTashkentISO(new Date());
    const todaySlots = allSlots.filter(s => {
      const slotIso = getTashkentISO(new Date(s.startTime));
      return slotIso === todayIso;
    });

    const todayAppts = todaySlots.filter(s => s.appointment && s.appointment.status !== 'CANCELLED');
    const todayPatients = todayAppts.filter(s => !(s.appointment.patientPhone === '+998000000000' || s.appointment.patientFirst === 'Tanaffus'));
    
    // Update Home Tab
    const homeDateEl = document.getElementById('home-date');
    if(homeDateEl) {
        homeDateEl.textContent = (() => { const d = new Date(); return `${['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][d.getDay()]}, ${d.getDate()} ${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][d.getMonth()]}`; })();
    }
    
    const homeGreeting = document.getElementById('home-greeting');
    if(homeGreeting) {
        if(doctorInfo) {
            homeGreeting.textContent = `Assalomu alaykum, Dr. ${doctorInfo.lastName}`;
        } else if(currentDoctorId) {
            const select = document.getElementById('doc-select');
            if(select && select.options[select.selectedIndex]) {
                homeGreeting.textContent = `Assalomu alaykum, Dr. ${select.options[select.selectedIndex].text.split(' ')[1] || ''}`;
            }
        } else {
            homeGreeting.textContent = `Assalomu alaykum`;
        }
    }
    
    const statHours = document.getElementById('stat-hours');
    if(statHours) {
        const hours = (todaySlots.length * INTERVAL) / 60;
        statHours.textContent = hours > 0 ? `${hours} soat` : 'Dam olish';
    }
    
    const statPatients = document.getElementById('stat-patients');
    if(statPatients) {
        statPatients.textContent = `${todayPatients.length} ta`;
    }
    
    const statNotes = document.getElementById('stat-notes');
    if(statNotes) {
        // Mock pending notes for now
        const completedAppts = todayAppts.filter(s => s.appointment.status === 'COMPLETED');
        statNotes.textContent = completedAppts.length;
    }

    // Previous legacy stats elements (if any still exist)
    const statTodayCount = document.getElementById('stat-today-count');
    if(statTodayCount) statTodayCount.textContent = todayAppts.length;
    
    const revEl = document.getElementById('stat-today-revenue');
    if (revEl) {
      const todayRevenue = todayAppts.reduce((sum, s) => sum + (s.appointment.procedure ? s.appointment.procedure.price : 200000), 0);
      revEl.textContent = todayRevenue.toLocaleString() + " so'm";
    }
    
    const statOccupancy = document.getElementById('stat-week-occupancy');
    if(statOccupancy) {
        const weekTotal = allSlots.length;
        const weekBooked = allSlots.filter(s => s.appointment && s.appointment.status !== 'CANCELLED').length;
        const occupancy = weekTotal > 0 ? Math.round((weekBooked / weekTotal) * 100) : 0;
        statOccupancy.textContent = occupancy + "%";
    }
  }

  // ---- Copy/Paste Shablon (Admin Only) ----
  function copySelectedDay() {
    const isoDate = document.getElementById('copy-day-select').value;
    if (!isoDate) {
      showToast("Iltimos, nusxalash uchun kunni tanlang!", "error");
      return;
    }

    const select = document.getElementById('copy-day-select');
    copiedDayLabel = select.options[select.selectedIndex].text;

    const times = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      for (let m = 0; m < 60; m += INTERVAL) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }

    copiedSchedule = [];
    for (const t of times) {
      const key = `${isoDate}_${t}`;
      const dt = parseTashkentDateTime(isoDate, t);

      const existing = allSlots.find(s => {
        const sStart = new Date(s.startTime).getTime();
        return dt.getTime() === sStart;
      });

      const action = pendingChanges[key];
      let isOpen = false;

      if (existing) {
        if (action !== 'remove' && (!existing.appointment || existing.appointment.status === 'CANCELLED')) isOpen = true;
      } else {
        if (action === 'add') isOpen = true;
      }

      if (isOpen) copiedSchedule.push(t);
    }

    document.getElementById('copied-status-msg').textContent = `📋 ${copiedDayLabel} nusxalandi (${copiedSchedule.length} ta ochiq soat)`;
    document.getElementById('paste-actions-wrap').style.display = 'flex';
    renderGrid();
  }

  function applyToAllDays() {
    if (!copiedSchedule) return;
    
    const days = getTashkentDays();
    const times = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      for (let m = 0; m < 60; m += INTERVAL) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }

    const sourceIso = document.getElementById('copy-day-select').value;

    for (const d of days) {
      if (d.iso === sourceIso) continue;

      for (const t of times) {
        const key = `${d.iso}_${t}`;
        const dt = parseTashkentDateTime(d.iso, t);
        
        if (dt.getTime() < Date.now()) continue;

        const existing = allSlots.find(s => {
          const sStart = new Date(s.startTime).getTime();
          return dt.getTime() === sStart;
        });

        if (existing && existing.appointment && existing.appointment.status !== 'CANCELLED') continue;

        const shouldBeOpen = copiedSchedule.includes(t);

        if (shouldBeOpen) {
          if (existing) {
            if (pendingChanges[key] === 'remove') delete pendingChanges[key];
          } else {
            pendingChanges[key] = 'add';
          }
        } else {
          if (existing) {
            pendingChanges[key] = 'remove';
          } else {
            if (pendingChanges[key] === 'add') delete pendingChanges[key];
          }
        }
      }
    }

    renderGrid();
    showToast("Nusxalangan shablon haftadagi barcha kunlarga qo'llandi! Saqlash tugmasini bosing.", "info");
  }

  function pasteToDay(targetIso, event) {
    if (event) event.stopPropagation();
    if (!copiedSchedule) return;

    const times = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      for (let m = 0; m < 60; m += INTERVAL) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }

    for (const t of times) {
      const key = `${targetIso}_${t}`;
      const dt = parseTashkentDateTime(targetIso, t);
      
      if (dt.getTime() < Date.now()) continue;

      const existing = allSlots.find(s => {
        const sStart = new Date(s.startTime).getTime();
        return dt.getTime() === sStart;
      });

      if (existing && existing.appointment && existing.appointment.status !== 'CANCELLED') continue;

      const shouldBeOpen = copiedSchedule.includes(t);

      if (shouldBeOpen) {
        if (existing) {
          if (pendingChanges[key] === 'remove') delete pendingChanges[key];
        } else {
          pendingChanges[key] = 'add';
        }
      } else {
        if (existing) {
          pendingChanges[key] = 'remove';
        } else {
          if (pendingChanges[key] === 'add') delete pendingChanges[key];
        }
      }
    }

    renderGrid();
    showToast(`${targetIso} kuniga shablon qo'yildi!`, "info");
  }

  function cancelCopyState() {
    copiedSchedule = null;
    copiedDayLabel = '';
    const select = document.getElementById('copy-day-select');
    if (select) select.value = '';
    const wrap = document.getElementById('paste-actions-wrap');
    if (wrap) wrap.style.display = 'none';
    renderGrid();
  }

  function onDoctorPatientSearchInput(val) {
    const list = document.getElementById('doc-patient-results');
    if (!val.trim()) {
      list.innerHTML = '';
      return;
    }

    const query = val.toLowerCase().replace(/\s+/g, '');
    const filtered = allVerifiedPatients.filter(p => {
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().replace(/\s+/g, '').includes(query);
      const phoneMatch = p.phone.replace(/\D/g, '').includes(query) || (p.telegramPhone && p.telegramPhone.replace(/\D/g, '').includes(query));
      return nameMatch || phoneMatch;
    }).slice(0, 8);

    if (filtered.length === 0) {
      list.innerHTML = '<div style="padding:10px; text-align:center; color:var(--text-muted); font-size:0.85rem;">Bemor topilmadi</div>';
      return;
    }

    list.innerHTML = filtered.map(p => `
      <div class="patient-result-item" onclick="openDoctorPatientCard('${p.id}')">
        <span style="font-weight:600; font-size:0.88rem; color: var(--text-bright);">👤 ${p.firstName} ${p.lastName}</span>
        <span style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">📞 ${p.phone}</span>
      </div>
    `).join('');
  }

  async function openDoctorPatientCard(patientId) {
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
        headers: { 'Authorization': `Bearer ${doctorToken}` }
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

        // Render history
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

        // Sort items by time desc
        items.sort((a, b) => b.time - a.time);

        if (items.length === 0) {
          list.innerHTML = '<div class="empty-state">Tashriflar topilmadi.</div>';
          return;
        }

        list.innerHTML = items.map(item => {
          const t = item.time;
          const timeStr = `${t.getDate()} ${uzMonths[t.getMonth()]} ${t.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone: 'Asia/Tashkent' })}`;
          
          if (item.type === 'APPOINTMENT') {
            let badge = '';
            if (item.status === 'SCHEDULED') {
              badge = '<span style="color:#38bdf8; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(56,189,248,0.1); border-radius:4px;">Kutilmoqda</span>';
            } else if (item.status === 'COMPLETED') {
              badge = '<span style="color:#34d399; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(52,211,153,0.1); border-radius:4px;">Keldi</span>';
            } else if (item.status === 'CANCELLED') {
              let cancelLabel = 'Bekor qilindi';
              if (item.cancelledBy === 'NOSHOW') cancelLabel = 'Kelmadi';
              else if (item.cancelledBy === 'NOSHOW_UNREACHABLE') cancelLabel = 'Telefonga javob bermadi';
              badge = `<span style="color:#f87171; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(248,113,113,0.1); border-radius:4px;">${cancelLabel}</span>`;
            }

            const docName = item.doctor ? `Dr. ${item.doctor.lastName}` : 'Noma\'lum shifokor';
            const procName = item.procedure ? item.procedure.name : 'Konsultatsiya';
            const noteText = item.cancelNote ? `<div style="font-size:0.75rem; color:var(--red); margin-top:4px;">Sabab: ${item.cancelNote}</div>` : '';

            return `
              <div style="padding:10px 12px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:600; color: var(--text-bright);">📅 Bron: ${procName}</span>
                  ${badge}
                </div>
                <div style="color:var(--text-muted); margin-top:4px; font-size:0.8rem;">
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
              badge = '<span style="color:#10b981; font-size:0.75rem; font-weight:600; padding:2px 6px; background:rgba(16,185,129,0.1); border-radius:4px;">Tugatildi</span>';
            }

            const docName = item.doctor ? `Dr. ${item.doctor.lastName}` : 'Noma\'lum shifokor';
            const noteText = item.note ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Izoh: ${item.note}</div>` : '';
            const paymentText = item.paidAmount >= item.price
              ? `<span style="color:#34d399;">To'liq to'landi (${item.price.toLocaleString()} so'm)</span>`
              : `<span style="color:#f87171;">Qisman to'landi (${item.paidAmount.toLocaleString()} / ${item.price.toLocaleString()} so'm)</span>`;

            return `
              <div style="padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(29, 158, 117, 0.2); border-radius:10px; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:600; color: var(--text-bright);">⚡ Tashrif: ${item.serviceName}</span>
                  ${badge}
                </div>
                <div style="color:var(--text-muted); margin-top:4px; font-size:0.8rem;">
                  <span>${timeStr}</span> &bull; <span>${docName}</span>
                </div>
                <div style="margin-top:4px; font-size:0.8rem; font-weight:500;">
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
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

