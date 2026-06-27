fetch('https://clinova-woad.vercel.app/superadmin').then(r=>r.text()).then(t => {
  console.log("Has tab-logs?", t.includes('id="tab-logs"'));
  console.log("Has hourglass?", t.includes('hourglass_empty'));
  console.log("Has loadLogs defined?", t.includes('async function loadLogs'));
});
