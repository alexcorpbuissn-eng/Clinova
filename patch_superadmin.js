const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'superadmin.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add nav item
const navBillingStr = `<button id="nav-billing" onclick="switchTab('billing')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">payments</span> Billing
                    </button>
                </li>`;
const navLogsStr = `<li>
                    <button id="nav-logs" onclick="switchTab('logs')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">receipt_long</span> Tizim Jurnali
                    </button>
                </li>`;

if (!content.includes('id="nav-logs"')) {
    content = content.replace(navBillingStr, navBillingStr + '\n                ' + navLogsStr);
}

// 2. Add tab content
const tabLogsStr = `
            <!-- LOGS TAB -->
            <div id="tab-logs" class="tab-content hidden">
                <div class="bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
                    <div class="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 class="font-title-md text-on-surface font-semibold">Tizim Jurnali (Logs)</h3>
                        <button onclick="loadLogs()" class="flex items-center gap-2 text-primary hover:bg-primary-container px-4 py-2 rounded-full transition-colors font-label-md">
                            <span class="material-symbols-outlined text-[20px]">refresh</span> Yangilash
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-container-lowest text-on-surface-variant font-label-sm border-b border-outline-variant/30">
                                    <th class="px-6 py-3 font-medium">Vaqt</th>
                                    <th class="px-6 py-3 font-medium">Daraja</th>
                                    <th class="px-6 py-3 font-medium">Manba</th>
                                    <th class="px-6 py-3 font-medium">Xabar</th>
                                    <th class="px-6 py-3 font-medium">Tafsilotlar</th>
                                </tr>
                            </thead>
                            <tbody id="logs-tbody" class="text-body-md text-on-surface divide-y divide-outline-variant/20">
                                <tr><td colspan="5" class="px-6 py-4 text-center text-on-surface-variant">Yuklanmoqda...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
`;

// Insert just before the script tag or right after the last tab-content
// The easiest is just before </main>
if (!content.includes('id="tab-logs"')) {
    content = content.replace('</main>', tabLogsStr + '\n        </main>');
}

// 3. Add loadLogs() and modify switchTab to load logs if needed
const scriptAddStr = `
async function loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-on-surface-variant">Yuklanmoqda...</td></tr>';
    try {
        const res = await fetch('/api/superadmin/logs');
        const data = await res.json();
        if (data.logs) {
            tbody.innerHTML = data.logs.map(log => {
                const color = log.level === 'ERROR' ? 'text-error' : (log.level === 'WARN' ? 'text-[orange]' : 'text-[green]');
                return \`
                    <tr class="hover:bg-surface-container-lowest transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">\${new Date(log.createdAt).toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap font-bold \${color}">\${log.level}</td>
                        <td class="px-6 py-4 whitespace-nowrap">\${log.source}</td>
                        <td class="px-6 py-4 max-w-xs truncate" title="\${log.message.replace(/"/g, '&quot;')}">\${log.message}</td>
                        <td class="px-6 py-4 max-w-sm truncate" title="\${(log.details || '').replace(/"/g, '&quot;')}">\${log.details || '-'}</td>
                    </tr>
                \`;
            }).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-error">Xatolik yuz berdi</td></tr>';
    }
}

// Ensure loadLogs is called when tab is switched
const originalSwitchTab = switchTab;
window.switchTab = function(tabId) {
    originalSwitchTab(tabId);
    if (tabId === 'logs') {
        loadLogs();
    }
};
`;

if (!content.includes('async function loadLogs()')) {
    content = content.replace('</script>', scriptAddStr + '\n</script>');
}

fs.writeFileSync(filePath, content);
console.log('superadmin.html patched');
