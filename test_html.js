fetch('https://clinova-woad.vercel.app/superadmin').then(r=>r.text()).then(t => {
  console.log("Has tab-logs?", t.includes('id="tab-logs"'));
  console.log("Has Tizim Jurnali?", t.includes('Tizim Jurnali'));
});
