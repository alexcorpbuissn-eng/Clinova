const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'test-admin-id', role: 'SUPER_ADMIN', telegramPhone: '+998901234567' },
  process.env.TELEGRAM_WEBHOOK_SECRET || 'hh-wh-s3cr3t-k3y-2025-uz'
);

fetch('http://localhost:3000/api/superadmin/admins', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
}).then(async res => {
  console.log(res.status);
  console.log(await res.text());
}).catch(console.error);
