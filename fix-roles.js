const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('d:/AI_Workplace/Clinova/src/app/api');

let changes = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Pattern 1: ADMIN && RECEPTION && DOCTOR
  content = content.replace(/session\.role !== 'ADMIN' && session\.role !== 'RECEPTION' && session\.role !== 'DOCTOR'\)/g, "session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'DOCTOR' && session.role !== 'SUPER_ADMIN')");

  // Pattern 2: ADMIN && RECEPTION
  content = content.replace(/session\.role !== 'ADMIN' && session\.role !== 'RECEPTION'\)/g, "session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'SUPER_ADMIN')");

  // Pattern 3: DOCTOR && ADMIN
  content = content.replace(/session\.role !== 'DOCTOR' && session\.role !== 'ADMIN'\)/g, "session.role !== 'DOCTOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')");

  // Pattern 4: ADMIN && INVENTORY
  content = content.replace(/session\.role !== 'ADMIN' && session\.role !== 'INVENTORY'\)/g, "session.role !== 'ADMIN' && session.role !== 'INVENTORY' && session.role !== 'SUPER_ADMIN')");

  // Pattern 5: ADMIN only
  content = content.replace(/session\.role !== 'ADMIN'\)/g, "session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')");
  
  // Also handle cases where there is no closing parenthesis immediately after, like:
  // if (!session || session.role !== 'ADMIN') return NextResponse...
  content = content.replace(/session\.role !== 'ADMIN'\) return/g, "session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') return");
  content = content.replace(/session\.role !== 'ADMIN'\) \{/g, "session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {");

  // RequireAdmin helper in users/route.ts
  content = content.replace(/payload\?\.role === 'ADMIN' \? payload : null/g, "(payload?.role === 'ADMIN' || payload?.role === 'SUPER_ADMIN') ? payload : null");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
    changes++;
  }
});

console.log('Total files changed:', changes);
