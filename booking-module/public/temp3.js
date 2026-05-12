
  const API = '';
  function err(msg) { const e = document.getElementById('err'); e.textContent=msg; e.classList.add('on'); }
  function clearErr() { document.getElementById('err').classList.remove('on'); }

  // Auto-redirect if already logged in
  if (localStorage.getItem('patientId')) {
    window.location.href = 'booking.html';
  }

  document.getElementById('phone-form').addEventListener('submit', async e => {
    e.preventDefault(); clearErr();
    const tgPhone = document.getElementById('fTgPhone').value.trim();
    const btn = document.getElementById('btn-phone');
    btn.disabled=true; btn.textContent='Kutilmoqda...';

    try {
      const res = await fetch(`${API}/api/public/send-otp`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegramPhone:tgPhone})
      });
      const data = await res.json();
      
      if (res.ok) {
        document.getElementById('phone-form').style.display = 'none';
        document.getElementById('otp-section').style.display = 'block';
        
        if (data.action === 'deep_link') {
          document.getElementById('deep-link-msg').style.display = 'block';
          document.getElementById('tg-link').href = data.deepLink;
        } else if (data.action === 'enter_otp') {
          document.getElementById('direct-msg').style.display = 'block';
        }
      } else {
        err(data.error || 'Xatolik yuz berdi');
      }
    } catch(e) { err('Server xatosi'); }
    btn.disabled=false; btn.textContent='Davom etish';
  });

  document.getElementById('btn-verify').addEventListener('click', async () => {
    clearErr();
    const code = document.getElementById('otp-input').value.trim();
    const tgPhone = document.getElementById('fTgPhone').value.trim();
    if (code.length !== 6) { err('6 raqamli kodni kiriting'); return; }

    const btn = document.getElementById('btn-verify');
    btn.disabled=true; btn.textContent='Tekshirilmoqda...';

    try {
      const res = await fetch(`${API}/api/public/verify-otp`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegramPhone:tgPhone, code})
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('patientId', data.patient.id);
        if (data.patient.firstName) localStorage.setItem('fFirst', data.patient.firstName);
        if (data.patient.lastName) localStorage.setItem('fLast', data.patient.lastName);
        if (data.patient.phone) localStorage.setItem('fPhone', data.patient.phone);
        
        // Check if returning to a specific page
        const returnUrl = new URLSearchParams(window.location.search).get('return') || 'booking.html';
        window.location.href = returnUrl;
      } else {
        err(data.error || "Noto'g'ri kod.");
      }
    } catch(e) { err('Server xatosi'); }
    btn.disabled=false; btn.textContent='Tasdiqlash';
  });

  document.getElementById('btn-resend').addEventListener('click', async () => {
    const tgPhone = document.getElementById('fTgPhone').value.trim();
    await fetch(`${API}/api/public/send-otp`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegramPhone:tgPhone})
    });
    const btn = document.getElementById('btn-resend');
    btn.textContent='✓ Qayta yuborildi';
    setTimeout(() => btn.textContent='Kodni qayta yuborish', 3000);
  });
