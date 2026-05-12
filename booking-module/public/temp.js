
const API = ''; // Relative path for same domain

// State
let selDoctor = null, selProc = null, selSlot = null, patientId = null;

// Step bars
function setStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('s'+i).style.display = i===n?'':'none';
    document.getElementById('sb'+i).classList.toggle('on', i<=n);
  });
}
function showSuccess(detail) {
  ['s1','s2','s3'].forEach(id => document.getElementById(id).style.display='none');
  document.getElementById('s-success').style.display='';
  ['sb1','sb2','sb3','sb4'].forEach(id => document.getElementById(id).classList.add('on'));
  document.getElementById('success-detail').textContent = detail;
}
function err(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.classList.add('on');
}
function clearErr(id) { document.getElementById(id).classList.remove('on'); }

function fmtTime(utcStr) {
  return new Date(utcStr).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tashkent'});
}
function fmtDate(utcStr) {
  return new Date(utcStr).toLocaleDateString('uz-UZ',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Tashkent'});
}

// ── Auth Check ───────────────────────────────────────────────────────────
if (!localStorage.getItem('patientId')) {
  window.location.href = 'login.html?return=booking.html';
} else {
  patientId = localStorage.getItem('patientId');
  if (localStorage.getItem('fFirst')) document.getElementById('fFirst').value = localStorage.getItem('fFirst');
  if (localStorage.getItem('fLast')) document.getElementById('fLast').value = localStorage.getItem('fLast');
  if (localStorage.getItem('fPhone')) document.getElementById('fPhone').value = localStorage.getItem('fPhone');
}

// ── STEP 1: Load doctors ─────────────────────────────────────────────────
async function loadDoctors() {
  const c = document.getElementById('doc-container');
  try {
    const {doctors} = await fetch(`${API}/api/public/doctors`).then(r=>r.json());
    if (!doctors?.length) { c.innerHTML='<div class="state-msg">Shifokorlar topilmadi.</div>'; return; }
    const g = document.createElement('div'); g.className='doctor-grid';
    doctors.forEach(d => {
      const card = document.createElement('div'); card.className='doc-card';
      const avatar = d.photoUrl || `https://ui-avatars.com/api/?name=${d.firstName}+${d.lastName}&background=4bcbba&color=fff`;
      card.innerHTML=`<img src="${avatar}" alt="${d.firstName}"/><h3>Dr. ${d.firstName} ${d.lastName}</h3><p>${d.specialty}</p>`;
      card.onclick = () => { document.querySelectorAll('.doc-card').forEach(x=>x.classList.remove('sel')); card.classList.add('sel'); selDoctor=d; loadProcedures(d.id); setStep(2); };
      g.appendChild(card);
    });
    c.innerHTML=''; c.appendChild(g);
  } catch(e) { c.innerHTML='<div class="state-msg">❌ Server xatosi. Sahifani yangilang.</div>'; }
}

// ── STEP 2: Load procedures ──────────────────────────────────────────────
async function loadProcedures(doctorId) {
  const c = document.getElementById('proc-container');
  c.innerHTML='<div class="state-msg"><div class="spinner"></div></div>';
  document.getElementById('slot-section').style.display='none';
  try {
    const {procedures} = await fetch(`${API}/api/public/doctors/${doctorId}/procedures`).then(r=>r.json());
    if (!procedures?.length) { c.innerHTML=`<div class="state-msg">Bu shifokor uchun protseduralar yo'q.</div>`; return; }
    const list = document.createElement('div'); list.className='proc-list';
    procedures.forEach(p => {
      const btn = document.createElement('button'); btn.type='button'; btn.className='proc-btn';
      btn.innerHTML=`<strong>${p.name}</strong><span>⏱ ${p.durationMinutes} daqiqa</span>`;
      btn.onclick = () => { document.querySelectorAll('.proc-btn').forEach(x=>x.classList.remove('sel')); btn.classList.add('sel'); selProc=p; loadSlots(doctorId, p.id); };
      list.appendChild(btn);
    });
    c.innerHTML=''; c.appendChild(list);
  } catch(e) { c.innerHTML='<div class="state-msg">❌ Xatolik.</div>'; }
}

async function loadSlots(doctorId, procedureId) {
  const sc = document.getElementById('slot-container');
  const ss = document.getElementById('slot-section');
  ss.style.display=''; sc.innerHTML='<div class="state-msg"><div class="spinner"></div></div>';
  try {
    const {slots} = await fetch(`${API}/api/public/doctors/${doctorId}/slots?procedureId=${procedureId}`).then(r=>r.json());
    if (!slots?.length) { sc.innerHTML=`<div class="state-msg">Bu protsedura uchun bo'sh vaqt yo'q.</div>`; return; }
    
    function getTabLabel(dateObj) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const tmrw = today + 86400000;
      const dTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
      if (dTime === today) return "Bugun";
      if (dTime === tmrw) return "Ertaga";
      const uzDays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
      return `${dateObj.getDate()} ${dateObj.toLocaleDateString('uz-UZ', {month:'short'})}, ${uzDays[dateObj.getDay()]}`;
    }

    const grouped = {};
    slots.forEach(s => {
      const d = new Date(s.startTime);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!grouped[dateKey]) grouped[dateKey] = { label: getTabLabel(d), slots: [] };
      grouped[dateKey].slots.push(s);
    });
    const dateKeys = Object.keys(grouped).sort();

    const wrap = document.createElement('div');
    const tabList = document.createElement('div');
    tabList.className = 'slot-tabs';
    tabList.style = 'display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px; scrollbar-width: none;';
    
    const slotArea = document.createElement('div');
    let activeKey = dateKeys[0];

    function renderActiveTab() {
      tabList.innerHTML = '';
      dateKeys.forEach(k => {
        const tb = document.createElement('button');
        tb.type = 'button';
        tb.style = `padding: 8px 16px; border: 1px solid var(--border); border-radius: 20px; background: ${k === activeKey ? 'var(--teal)' : '#fff'}; color: ${k === activeKey ? '#fff' : 'var(--navy)'}; cursor: pointer; white-space: nowrap; font-family: inherit; font-weight: 500; font-size: 0.9rem; transition: all 0.2s;`;
        tb.textContent = grouped[k].label;
        tb.onclick = () => { activeKey = k; renderActiveTab(); };
        tabList.appendChild(tb);
      });
      
      slotArea.innerHTML = '';
      const g = document.createElement('div'); g.className='slot-grid';
      grouped[activeKey].slots.forEach(s => {
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
      slotArea.appendChild(g);
    }

    wrap.appendChild(tabList);
    wrap.appendChild(slotArea);
    
    renderActiveTab();
    sc.innerHTML=''; sc.appendChild(wrap);
  } catch(e) { sc.innerHTML='<div class="state-msg">❌ Xatolik.</div>'; }
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

// ── Navigation ───────────────────────────────────────────────────────────
document.getElementById('back12').onclick = () => { selProc=null; selSlot=null; setStep(1); };
document.getElementById('back23').onclick = () => { selSlot=null; setStep(2); };

// ── Init ─────────────────────────────────────────────────────────────────
loadDoctors();
