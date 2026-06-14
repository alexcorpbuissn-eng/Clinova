
const API = ''; // Relative path for same domain

// State
let selDoctor = null, selProc = null, selSlot = null, patientId = null, selDateKey = null, currentSlots = [];

// Step bars
function setStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('s'+i).style.display = i===n?'':'none';
  });
  
  // Visual mapping:
  // n=1 -> sb1
  // n=2 -> sb1, sb2, sb3 (Service and Time are together in s2)
  // n=3 -> sb1, sb2, sb3, sb4 (Verify)
  const maxSb = n === 1 ? 1 : (n === 2 ? 3 : 4);
  [1,2,3,4,5].forEach(i => {
    const el = document.getElementById('sb'+i);
    if(el) el.classList.toggle('on', i <= maxSb);
  });
}
function showSuccess(detail) {
  ['s1','s2','s3'].forEach(id => document.getElementById(id).style.display='none');
  document.getElementById('s-success').style.display='';
  [1,2,3,4,5].forEach(i => {
    const el = document.getElementById('sb'+i);
    if(el) el.classList.add('on');
  });
  document.getElementById('success-detail').textContent = detail;
}
function err(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.classList.add('on');
}
function clearErr(id) { document.getElementById(id).classList.remove('on'); }

function fmtTime(utcStr) {
  return new Date(utcStr).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tashkent'});
}
function fmtDate(utcStr) {
  const _d = new Date(utcStr);
  const _uzMonths = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return `${_d.getDate()}-${_uzMonths[_d.getMonth()]} ${_d.getFullYear()}`;
}

function showToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-icon">!</div><div>${msg}</div>`;
  c.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

// ── Auth Check & Profile Pre-filling ─────────────────────────────────────
let originalVerifiedPhone = '';

if (!localStorage.getItem('patientId')) {
  window.location.href = 'login.html?return=booking.html';
} else {
  patientId = localStorage.getItem('patientId');
  if (localStorage.getItem('fFirst')) document.getElementById('fFirst').value = localStorage.getItem('fFirst');
  if (localStorage.getItem('fLast')) document.getElementById('fLast').value = localStorage.getItem('fLast');
  if (localStorage.getItem('fPhone')) {
    document.getElementById('fPhone').value = localStorage.getItem('fPhone');
    originalVerifiedPhone = localStorage.getItem('fPhone');
  }
  loadPatientProfile();
}

// ── STEP 1: Load doctors ─────────────────────────────────────────────────
async function loadDoctors() {
  const c = document.getElementById('doc-container');
  try {
    const {doctors} = await fetch(`${API}/api/public/doctors`).then(r=>r.json());
    if (!doctors?.length) { c.innerHTML='<div class="state-msg">Shifokorlar topilmadi.</div>'; return; }
    const g = document.createElement('div'); g.className='doctor-grid';
    
    // "No Preference" card
    const noPrefCard = document.createElement('div'); noPrefCard.className='doc-card';
    noPrefCard.innerHTML=`
      <div class="doc-card-check">✓</div>
      <div style="width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,#e0f7f5,#b2ebe4);display:flex;align-items:center;justify-content:center;font-size:3rem;color:var(--teal-dark);">
        <span class="material-symbols-outlined" style="font-size:3rem;">group</span>
      </div>
      <div class="doc-card-body">
        <div class="doc-card-name">Farqi yo'q</div>
        <div class="doc-card-spec">Istalgan shifokor</div>
      </div>`;
    noPrefCard.onclick = () => { 
      document.querySelectorAll('.doc-card').forEach(x=>x.classList.remove('sel')); 
      noPrefCard.classList.add('sel'); 
      selDoctor=doctors[0]; // just pick the first doctor for "No Preference" logic under the hood
      loadProcedures(selDoctor.id); 
      setStep(2); 
    };
    g.appendChild(noPrefCard);

    doctors.forEach(d => {
      const card = document.createElement('div'); card.className='doc-card';
      const avatar = d.photoUrl || `https://ui-avatars.com/api/?name=${d.firstName}+${d.lastName}&background=4bcbba&color=fff&size=300`;
      const isPhoto = !!d.photoUrl;
      card.innerHTML=`
        <div class="doc-card-check">✓</div>
        ${isPhoto
          ? `<img class="doc-card-img" src="${avatar}" alt="Dr. ${d.firstName} ${d.lastName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
             <div style="display:none;width:100%;aspect-ratio:1/1;background:var(--teal-light);align-items:center;justify-content:center;font-size:2.5rem;font-weight:700;color:var(--teal-dark);">${d.firstName[0]}${d.lastName[0]}</div>`
          : `<div style="width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,#e0f7f5,#b2ebe4);display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:700;color:var(--teal-dark);">${d.firstName[0]}${d.lastName[0]}</div>`
        }
        <div class="doc-card-body">
          <div class="doc-card-name">Dr. ${d.firstName} ${d.lastName}</div>
          <div class="doc-card-spec">${d.specialty}</div>
          ${d.isOnLeave ? `<div style="margin-top: 8px; font-size: 0.75rem; font-weight: 700; color: #ef4444; background: #fee2e2; display: inline-block; padding: 4px 10px; border-radius: 12px; letter-spacing: 0.05em;">🌴 Dam olishda</div>` : ''}
        </div>`;
      card.onclick = () => { document.querySelectorAll('.doc-card').forEach(x=>x.classList.remove('sel')); card.classList.add('sel'); selDoctor=d; loadProcedures(d.id); setStep(2); };
      g.appendChild(card);
    });
    c.innerHTML=''; c.appendChild(g);

    const urlParams = new URLSearchParams(window.location.search);
    const queryDoctorId = urlParams.get('doctorId');
    const queryProcedureId = urlParams.get('procedureId');
    const queryPromo = urlParams.get('promo');

    if (queryPromo) {
      const descInput = document.getElementById('fDesc');
      if (descInput && !descInput.value) {
        let promoText = '';
        if (queryPromo === 'oqartirish') promoText = 'Aksiya: Tishlarni oqartirish (-30%)';
        else if (queryPromo === 'yangi') promoText = 'Aksiya: Birinchi tashrif (-20%)';
        else if (queryPromo === 'oila') promoText = 'Aksiya: Oilaviy paket (-25%)';
        else if (queryPromo === 'implant') promoText = 'Aksiya: Implant o\'rnatishda toj sovg\'a';
        else promoText = `Aksiya: ${queryPromo}`;
        descInput.value = promoText;
      }
    }

    if (queryDoctorId) {
      const targetDoc = doctors.find(d => d.id === queryDoctorId);
      if (targetDoc) {
        selDoctor = targetDoc;
        const cards = g.querySelectorAll('.doc-card');
        const cardIndex = doctors.findIndex(d => d.id === queryDoctorId);
        if (cards[cardIndex]) {
          document.querySelectorAll('.doc-card').forEach(x=>x.classList.remove('sel'));
          cards[cardIndex].classList.add('sel');
        }
        await loadProcedures(queryDoctorId, queryProcedureId);
        setStep(2);
      }
    }

  } catch(e) { c.innerHTML='<div class="state-msg">❌ Server xatosi. Sahifani yangilang.</div>'; }
}

// ── STEP 2: Load procedures ──────────────────────────────────────────────
function initDays() {
  const c = document.getElementById('global-day-container');
  c.innerHTML = '';
  const now = new Date();
  for(let i=0; i<7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    let label;
    if (i===0) label = "Bugun";
    else if (i===1) label = "Ertaga";
    else {
      const uzDays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
      const uzMonthsShort = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      label = `${d.getDate()} ${uzMonthsShort[d.getMonth()]}, ${uzDays[d.getDay()]}`;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-btn';
    btn.style = `padding: 10px 20px; border: 1px solid var(--border); border-radius: 20px; background: #fff; color: var(--navy); cursor: pointer; white-space: nowrap; font-family: inherit; font-weight: 500; font-size: 0.95rem; transition: all 0.2s; flex-shrink: 0;`;
    btn.dataset.key = dateKey;
    btn.textContent = label;
    btn.onclick = () => {
      document.querySelectorAll('.day-btn').forEach(b => {
        b.style.background = '#fff'; b.style.color = 'var(--navy)';
      });
      btn.style.background = 'var(--teal)'; btn.style.color = '#fff';
      selDateKey = dateKey;
      if (selProc) renderSlotsForSelectedDay();
    };
    c.appendChild(btn);
  }
}

async function loadProcedures(doctorId, autoSelectProcedureId = null) {
  initDays();
  const c = document.getElementById('proc-container');
  c.innerHTML='<div class="state-msg"><div class="spinner"></div></div>';
  // Reset slot panel to placeholder
  document.getElementById('slot-container').innerHTML='';
  const ph = document.getElementById('slot-placeholder');
  if (ph) ph.style.display='';
  try {
    const {procedures} = await fetch(`${API}/api/public/doctors/${doctorId}/procedures`).then(r=>r.json());
    if (!procedures?.length) { c.innerHTML=`<div class="state-msg">Bu shifokor uchun protseduralar yo'q.</div>`; return; }
    const list = document.createElement('div'); list.className='proc-list';
    procedures.forEach(p => {
      const btn = document.createElement('button'); btn.type='button'; btn.className='proc-btn';
      btn.innerHTML=`<strong>${p.name}</strong><span>⏱ ${p.durationMinutes} daqiqa</span>`;
      btn.onclick = () => {
        if (!selDateKey) {
          const todayBtn = document.querySelector('.day-btn');
          if (todayBtn) { todayBtn.click(); }
        }
        document.querySelectorAll('.proc-btn').forEach(x=>x.classList.remove('sel'));
        btn.classList.add('sel');
        selProc=p;
        loadSlots(doctorId, p.id);
        if (window.innerWidth <= 700) {
          document.getElementById('slot-section').scrollIntoView({ behavior:'smooth', block:'start' });
        }
      };
      list.appendChild(btn);
    });
    c.innerHTML=''; c.appendChild(list);

    // Auto-select "Konsultatsiya" or first procedure for the public UI
    let targetIndex = procedures.findIndex(p => p.name.toLowerCase().includes('konsult'));
    if (targetIndex === -1) targetIndex = procedures.findIndex(p => p.name.toLowerCase().includes('ko\'rik'));
    if (targetIndex === -1) targetIndex = 0;

    const btns = list.querySelectorAll('.proc-btn');
    if (btns[targetIndex]) {
      btns[targetIndex].click();
    }

    if (autoSelectProcedureId) {
      const targetProc = procedures.find(p => p.id === autoSelectProcedureId);
      if (targetProc) {
        const btns = list.querySelectorAll('.proc-btn');
        const procIndex = procedures.findIndex(p => p.id === autoSelectProcedureId);
        if (btns[procIndex]) {
          btns[procIndex].click(); // simulate click to load slots
        }
      }
    }

  } catch(e) { c.innerHTML='<div class="state-msg">❌ Xatolik.</div>'; }
}

async function loadSlots(doctorId, procedureId) {
  const sc = document.getElementById('slot-container');
  // Hide placeholder, show spinner
  const ph = document.getElementById('slot-placeholder');
  if (ph) ph.style.display='none';
  sc.innerHTML='<div class="state-msg"><div class="spinner"></div></div>';
  try {
    const {slots} = await fetch(`${API}/api/public/doctors/${doctorId}/slots?procedureId=${procedureId}&duration=${selProc.durationMinutes}`).then(r=>r.json());
    currentSlots = slots || [];
    renderSlotsForSelectedDay();
  } catch(e) { sc.innerHTML='<div class="state-msg">❌ Xatolik.</div>'; }
}

function renderSlotsForSelectedDay() {
  const sc = document.getElementById('slot-container');
  sc.innerHTML = '';
  
  if (!currentSlots || currentSlots.length === 0) {
    sc.innerHTML = `<div class="state-msg">Yaqin kunlarda bo'sh vaqt yo'q.</div>`;
    return;
  }

  // Filter slots by selDateKey
  const daySlots = currentSlots.filter(s => {
    const d = new Date(s.startTime);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return dateKey === selDateKey;
  });

  if (daySlots.length === 0) {
    sc.innerHTML = `<div class="state-msg">Tanlangan kunda bo'sh vaqt yo'q. Boshqa kunni tanlang.</div>`;
    return;
  }

  const g = document.createElement('div'); g.className='slot-grid';
  daySlots.forEach(s => {
    const btn = document.createElement('button'); btn.type='button'; btn.className='slot-btn';
    if (selSlot && selSlot.id === s.id) btn.classList.add('sel');
    btn.innerHTML=`<strong>${fmtTime(s.startTime)}</strong><br><small style="color:#64748b">${fmtDate(s.startTime)}</small><br><small style="color:#94a3b8">→ ${fmtTime(s.endTime)}</small>`;
    btn.onclick = () => { 
      document.querySelectorAll('.slot-btn').forEach(x=>x.classList.remove('sel')); 
      btn.classList.add('sel'); 
      selSlot=s; 
      setTimeout(() => { 
        document.getElementById('summary3').innerHTML=`🩺 Dr. ${selDoctor.firstName} ${selDoctor.lastName} &nbsp;|&nbsp; ${selProc.name} &nbsp;|&nbsp; ${fmtDate(selSlot.startTime)}, ${fmtTime(selSlot.startTime)}`; 
        setStep(3); 
      }, 300); 
    };
    g.appendChild(btn);
  });
  sc.appendChild(g);
}

// ── STEP 3: Patient form & Submit ─────────────────────────────────────────
document.getElementById('patient-form').addEventListener('submit', async e => {
  e.preventDefault(); clearErr('err3');
  if (!selSlot) { err('err3','Iltimos, vaqt tanlang.'); return; }
  const btn = document.getElementById('btn3');
  btn.disabled=true; btn.textContent='Tekshirilmoqda...';

  // Save updated details to localStorage
  const fFirst = document.getElementById('fFirst').value.trim();
  const fLast = document.getElementById('fLast').value.trim();
  const fPhone = document.getElementById('fPhone').value.trim();
  localStorage.setItem('fFirst', fFirst);
  localStorage.setItem('fLast', fLast);
  localStorage.setItem('fPhone', fPhone);

  // Strict phone validation
  const phoneRegex = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;
  if (!phoneRegex.test(fPhone)) {
    err('err3', "Iltimos, to'g'ri O'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX).");
    return;
  }

  try {
    const res = await fetch(`${API}/api/public/book`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        slotId: selSlot.id,
        procedureId: selProc.id,
        patientId,
        firstName: fFirst,
        lastName: fLast,
        phone: fPhone,
        description: document.getElementById('fDesc').value.trim(),
        draftId: draftId || undefined
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const a = data.appointment;
      showSuccess(`Dr. ${a.doctorName} | ${a.procedureName} | ${fmtDate(a.slotTime)}, ${fmtTime(a.slotTime)}`);
    } else {
      err('err3', data.error || 'Bron qilishda xatolik yuz berdi.');
    }
  } catch(e) { err('err3',"Server xatosi. Qayta urinib ko'ring."); }
  btn.disabled=false; btn.textContent='Tasdiqlash';
});

// ── Profile Loader & Alternative Phone Support ───────────────────────────
async function loadPatientProfile() {
  patientId = localStorage.getItem('patientId');
  if (!patientId) return;
  try {
    const res = await fetch(`${API}/api/public/profile?patientId=${patientId}`);
    const data = await res.json();
    if (data.success && data.patient) {
      const p = data.patient;
      
      // Update inputs if they are empty
      if (p.firstName && !document.getElementById('fFirst').value) {
        document.getElementById('fFirst').value = p.firstName;
      }
      if (p.lastName && !document.getElementById('fLast').value) {
        document.getElementById('fLast').value = p.lastName;
      }
      
      // Store the official Telegram verified phone
      originalVerifiedPhone = p.telegramPhone || p.phone || '';
      
      // Format it beautifully if it has 12 digits (+998901234567 -> +998 90 123 45 67)
      if (originalVerifiedPhone && !originalVerifiedPhone.includes(' ')) {
        const digits = originalVerifiedPhone.replace(/\D/g, '');
        if (digits.startsWith('998') && digits.length === 12) {
          const d = digits.slice(3);
          originalVerifiedPhone = `+998 ${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,7)} ${d.slice(7,9)}`;
        }
      }
      
      // Fill the Telegram read-only display
      document.getElementById('fTgPhoneShow').value = originalVerifiedPhone;
      
      // Prefill contact phone input if empty
      const phoneInput = document.getElementById('fPhone');
      if (!phoneInput.value && originalVerifiedPhone) {
        phoneInput.value = originalVerifiedPhone;
      }
    }
  } catch(e) {}
}

const urlParams = new URLSearchParams(window.location.search);
const draftId = urlParams.get('draftId');

async function handleDraft() {
  if (!draftId || !patientId) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/public/drafts?patientId=${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const draft = data.drafts.find(d => d.id === draftId);
      if (draft) {
        // Pre-select Doctor
        selDoc = {
          id: draft.doctor.id,
          firstName: draft.doctor.firstName,
          lastName: draft.doctor.lastName,
          specialty: draft.doctor.specialty
        };
        
        // Pre-select Procedure
        selProc = {
          id: draft.procedure.id,
          name: draft.procedure.name,
          price: draft.procedure.price,
          durationMinutes: draft.procedure.durationMinutes
        };

        // Move to Step 2 (Time Selection) and load procedures/slots
        setStep(2);
        loadProcedures(draft.doctor.id, draft.procedure.id);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// ── Navigation ───────────────────────────────────────────────────────────
document.getElementById('back12').onclick = () => { selProc=null; selSlot=null; setStep(1); };
document.getElementById('back23').onclick = () => { selSlot=null; setStep(2); };

// ── Init ─────────────────────────────────────────────────────────────────
loadDoctors();
loadPatientProfile().then(() => {
  handleDraft();
});

