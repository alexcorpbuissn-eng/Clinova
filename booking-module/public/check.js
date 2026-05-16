const c = require('fs').readFileSync('index.html','utf8');
console.log('ms2-section occurrences:', (c.match(/ms2-section/g)||[]).length);
console.log('id=milestone occurrences:', (c.match(/id="milestone"/g)||[]).length);
console.log('ms2-hero-num occurrences:', (c.match(/ms2-hero-num/g)||[]).length);
