async function test() {
    try {
        console.log('Sending test error to /api/logs...');
        const res1 = await fetch('http://localhost:3000/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: 'ERROR', message: 'Test Error from AI verification', details: 'Test stack trace' })
        });
        console.log('POST /api/logs status:', res1.status);
        
        console.log('Fetching logs from /api/superadmin/logs...');
        const res2 = await fetch('http://localhost:3000/api/superadmin/logs');
        const data = await res2.json();
        console.log('GET /api/superadmin/logs status:', res2.status);
        console.log('Found logs:', data.logs ? data.logs.length : data);
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}
test();
