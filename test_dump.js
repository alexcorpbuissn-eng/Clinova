fetch('https://clinova-woad.vercel.app/superadmin?v=2').then(r=>r.text()).then(t => {
  const match = t.match(/<div id="tab-logs"[\s\S]*?<\/main>/);
  console.log(match ? match[0] : 'NO MATCH');
});
