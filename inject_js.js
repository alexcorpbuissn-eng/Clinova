const fs = require('fs');
const htmlPath = 'D:/AI_Workplace/Clinova/public/superadmin.html';
const jsPath = 'D:/AI_Workplace/Clinova/public/superadmin_logic_clean.js';

let html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// Find the script tag and replace its contents
const startIndex = html.indexOf('<script id="superadmin-logic">');
const endIndex = html.lastIndexOf('</script>');

if (startIndex === -1 || endIndex === -1) {
    // If not found by ID, just find the last script tag
    const start2 = html.lastIndexOf('<script>');
    if (start2 !== -1) {
        html = html.substring(0, start2 + 8) + '\n' + js + '\n' + html.substring(endIndex);
    } else {
        console.error("Script tag not found");
        process.exit(1);
    }
} else {
    html = html.substring(0, startIndex + 30) + '\n' + js + '\n' + html.substring(endIndex);
}

fs.writeFileSync(htmlPath, html);
console.log('Successfully injected JS into superadmin.html');
