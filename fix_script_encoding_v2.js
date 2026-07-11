import fs from 'fs';
const buffer = fs.readFileSync('script.js');
const hex = buffer.toString('hex');
// â€œ is usually c3a2e282acc593 or similar in corrupted utf8
// I'll just look for 'Professional ' in hex
const searchHex = Buffer.from('Professional ').toString('hex');
const replaceHex = Buffer.from('Professional "About Me" storytelling').toString('hex');

// I'll use a regex on the string to be safe
let content = buffer.toString('binary');
content = content.replace(/Professional.*?storytelling/, 'Professional "About Me" storytelling');
fs.writeFileSync('script.js', Buffer.from(content, 'binary'));
