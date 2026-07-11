const fs = require('fs');
const filePath = 'script.js';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/â€œ/g, '"').replace(/â€ /g, '"');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed quotes in script.js');
