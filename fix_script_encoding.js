import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');
const fixed = content.replace(/Professional â€œAbout Meâ€  storytelling/g, 'Professional "About Me" storytelling');
fs.writeFileSync('script.js', fixed);
