const fs = require('fs');
let file = fs.readFileSync('d:/AI_Workplace/Habbullo-Hilola/booking-module/public/admin_logic_clean.js', 'utf8');

const regex = /tbody\.innerHTML = data\.users\.map\(u => `[\s\S]*?`\)\.join\(''\);/;

const replacement = `tbody.innerHTML = data.users.map(u => {
              const roleColors = {
                'ADMIN': 'bg-error-container text-on-error-container',
                'DOCTOR': 'bg-primary-container text-on-primary-container',
                'RECEPTION': 'bg-[#e8def8] text-[#1d192b]'
              };
              const roleNames = {
                'ADMIN': 'Administrator',
                'DOCTOR': 'Shifokor',
                'RECEPTION': 'Qabulxona'
              };
              const colorClass = roleColors[u.role] || 'bg-surface-variant text-on-surface-variant';
              const rName = roleNames[u.role] || u.role;
              const doctorAssigned = u.doctorId && doctorMap[u.doctorId] ? doctorMap[u.doctorId] : (u.doctorId || '-');
              
              const nName = u.name || "Noma\\'lum (Bemor emas)";
              const initials = (u.name && u.name.length >= 2) ? u.name.substring(0, 2).toUpperCase() : 'U';

              return \`
              <tr class="hover:bg-surface-container/30 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/30 group">
                <td class="py-4 px-6 border-r border-outline-variant/50">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm \${colorClass}">
                      \${initials}
                    </div>
                    <div>
                      <div class="font-headline-sm text-on-surface leading-tight">\${nName}</div>
                      <div class="font-mono text-xs text-on-surface-variant opacity-80 mt-0.5">\${u.telegramPhone}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center">
                  <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${colorClass}">\${rName}</span>
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-sm font-medium text-on-surface-variant">
                  \${doctorAssigned !== '-' ? \\\`<span class="flex items-center justify-center gap-1 text-primary"><span class="material-symbols-outlined" style="font-size:16px;">stethoscope</span> \${doctorAssigned}</span>\\\` : '<span class="opacity-50">-</span>'}
                </td>
                <td class="py-4 px-6 border-r border-outline-variant/50 text-center text-xs text-on-surface-variant">
                  \${new Date(u.createdAt).toLocaleString('uz-UZ', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td class="py-4 px-6 text-center">
                  <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="assignDoctor('\${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors" title="Shifokorga bog\\'lash">
                      <span class="material-symbols-outlined" style="font-size: 18px;">link</span>
                    </button>
                    <button onclick="deleteUser('\${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors" title="O\\'chirish">
                      <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            \`}).join('');`;

if (regex.test(file)) {
  fs.writeFileSync('d:/AI_Workplace/Habbullo-Hilola/booking-module/public/admin_logic_clean.js', file.replace(regex, replacement));
  console.log('Replaced successfully');
} else {
  console.log('Target not found in file!');
}
