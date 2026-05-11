'use client';
import { useEffect, useState } from 'react';

export default function CancelPage({ params }: { params: { token: string } }) {
  const [state, setState] = useState<'loading' | 'confirm' | 'done' | 'error'>('loading');
  const [info, setInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`/api/public/cancel/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setInfo(data.appointment);
          setState('confirm');
        } else {
          setErrorMsg(data.error);
          setState('error');
        }
      })
      .catch(() => { setErrorMsg('Serverga ulanishda xatolik yuz berdi.'); setState('error'); });
  }, [params.token]);

  const handleCancel = async () => {
    setState('loading');
    const res = await fetch(`/api/public/cancel/${params.token}`, { method: 'POST' });
    const data = await res.json();
    setState(data.success ? 'done' : 'error');
    if (!data.success) setErrorMsg(data.error);
  };

  const slotDate = info
    ? new Date(info.slotTime).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const slotTime = info
    ? new Date(info.slotTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f9fa', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 480, width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {state === 'loading' && <p style={{ textAlign: 'center', color: '#64748b' }}>Yuklanmoqda...</p>}

        {state === 'confirm' && info && (
          <>
            <h1 style={{ color: '#1e293b', fontSize: 22, marginBottom: 8 }}>Qabulni bekor qilishni tasdiqlang</h1>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <p><strong>Bemor:</strong> {info.patientFirst} {info.patientLast}</p>
              <p><strong>Shifokor:</strong> Dr. {info.doctorName}</p>
              <p><strong>Mutaxassislik:</strong> {info.specialty}</p>
              <p><strong>Sana:</strong> {slotDate}</p>
              <p><strong>Vaqt:</strong> {slotTime}</p>
            </div>
            <button onClick={handleCancel} style={{ width: '100%', padding: '14px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Ha, bekor qilish
            </button>
            <a href="/booking" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#64748b', fontSize: 14 }}>
              Yo'q, qaytish
            </a>
          </>
        )}

        {state === 'done' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#1e293b', textAlign: 'center' }}>Qabul bekor qilindi</h2>
            <p style={{ color: '#64748b', textAlign: 'center' }}>Sizga elektron pochta orqali xabar yuborildi.</p>
            <a href="/booking" style={{ display: 'block', textAlign: 'center', marginTop: 24, color: '#4bcbba', fontWeight: 600 }}>
              Yangi qabulga yozilish →
            </a>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#e11d48', textAlign: 'center' }}>Xatolik</h2>
            <p style={{ color: '#64748b', textAlign: 'center' }}>{errorMsg}</p>
            <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: 24, color: '#4bcbba', fontWeight: 600 }}>
              Bosh sahifaga qaytish →
            </a>
          </>
        )}
      </div>
    </main>
  );
}
