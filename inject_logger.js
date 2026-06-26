const fs = require('fs');
const path = require('path');

const snippet = `
<script>
  window.addEventListener('error', function(event) {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'ERROR', message: event.message, details: event.error?.stack || (event.filename + ':' + event.lineno) })
    }).catch(console.error);
  });
  window.addEventListener('unhandledrejection', function(event) {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'ERROR', message: 'Unhandled Rejection: ' + (event.reason?.message || event.reason), details: event.reason?.stack || String(event.reason) })
    }).catch(console.error);
  });
</script>
</head>
`;

const files = ['staff.html', 'admin.html', 'doctor.html', 'reception.html', 'superadmin.html'];

for (const file of files) {
  const filePath = path.join(__dirname, 'public', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('/api/logs')) {
      content = content.replace('</head>', snippet.trim());
      fs.writeFileSync(filePath, content);
      console.log('Injected logger into', file);
    }
  }
}
