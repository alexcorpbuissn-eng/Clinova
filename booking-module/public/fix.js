const fs = require('fs');
const path = require('path');

const dir = 'D:/AI_Workplace/Habbullo-Hilola/booking-module/public';
const files = ['build_admin.js', 'build_booking.js', 'build_doctor.js', 'build_profile.js', 'build_reception.js'];

files.forEach(f => {
  const filePath = path.join(dir, f);
  if (fs.existsSync(filePath)) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/\\\${/g, '${');
    fs.writeFileSync(filePath, code);
    console.log('Fixed', f);
  }
});
