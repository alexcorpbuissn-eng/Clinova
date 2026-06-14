const fs = require('fs');

function fixDates(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // replace new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
  content = content.replace(
    /new Date\(\)\.toLocaleDateString\('uz-UZ',\s*\{\s*month:\s*'long',\s*year:\s*'numeric'\s*\}\)/g,
    "`${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][new Date().getMonth()]} ${new Date().getFullYear()}`"
  );

  // replace displayDate.toLocaleDateString('uz-UZ', { weekday: 'long', timeZone: 'Asia/Tashkent' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*weekday:\s*'long',\s*timeZone:\s*'Asia\/Tashkent'\s*\}\)/g,
    "['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][$1.getDay()]"
  );
  
  // replace nextDay.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'short' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*weekday:\s*'long',\s*day:\s*'numeric',\s*month:\s*'short'\s*\}\)/g,
    "`${['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][$1.getDay()]}, ${$1.getDate()} ${['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][$1.getMonth()]}`"
  );

  // replace st.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*day:\s*'numeric',\s*month:\s*'long',\s*year:\s*'numeric'\s*\}\)/g,
    "`${$1.getDate()} ${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][$1.getMonth()]} ${$1.getFullYear()}`"
  );

  // replace displayDate.toLocaleDateString('uz-UZ', { month: 'short', timeZone: 'Asia/Tashkent' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*month:\s*'short',\s*timeZone:\s*'Asia\/Tashkent'\s*\}\)/g,
    "['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][$1.getMonth()]"
  );

  // replace displayDate.toLocaleDateString('uz-UZ', { weekday: 'short', timeZone: 'Asia/Tashkent' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*weekday:\s*'short',\s*timeZone:\s*'Asia\/Tashkent'\s*\}\)/g,
    "['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'][$1.getDay()]"
  );

  // replace dObj.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*month:\s*'short',\s*day:\s*'numeric'\s*\}\)/g,
    "`${$1.getDate()} ${['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'][$1.getMonth()]}`"
  );

  // replace dObj.toLocaleDateString('uz-UZ', { weekday: 'long' })
  content = content.replace(
    /(\w+)\.toLocaleDateString\('uz-UZ',\s*\{\s*weekday:\s*'long'\s*\}\)/g,
    "['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][$1.getDay()]"
  );

  // replace new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Tashkent' })
  content = content.replace(
    /new Date\(\)\.toLocaleDateString\('uz-UZ',\s*\{\s*weekday:\s*'long',\s*day:\s*'numeric',\s*month:\s*'long',\s*timeZone:\s*'Asia\/Tashkent'\s*\}\)/g,
    "(() => { const d = new Date(); return `${['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][d.getDay()]}, ${d.getDate()} ${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][d.getMonth()]}`; })()"
  );

  fs.writeFileSync(filePath, content);
}

const files = ['admin_logic_clean.js', 'doctor_logic_clean.js', 'reception_logic_clean.js', 'admin_logic.js', 'doctor_logic.js', 'reception_logic.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    console.log('Fixing ' + f);
    fixDates(f);
  }
});
