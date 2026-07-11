const fs = require('fs');

const fixFile = (filePath) => {
    let buffer = fs.readFileSync(filePath);
    
    // â€¢ (E2 80 A2) -> • (E2 80 A2) 
    // Wait, if it's already E2 80 A2, then it IS a bullet in UTF8.
    // The issue might be that the browser is NOT interpreting it as UTF8.
    // BUT the subagent said it's broken.
    
    // Let's look at the file content again.
    // "â€¢ CASE FILE"
    // If I see "â€¢" in the terminal, it means the terminal is interpreting the bytes as ISO-8859-1 or similar.
    
    // If the file was saved as ISO-8859-1, then the bytes for "â€¢" would be:
    // â (E2) € (80) ¢ (A2)
    // In UTF8, E2 80 A2 IS a bullet.
    
    // So if the file IS UTF8 and contains E2 80 A2, and the browser shows "â€¢", 
    // it means the browser thinks the file is ISO-8859-1.
    // BUT we have <meta charset="UTF-8">.
    
    // Wait, what if the file contains the LITERAL characters "â", "€", "¢"?
    // That would mean the bytes are actually much longer.
    
    // Let's try to replace the literal string "â€¢" with "&bull;".
    let content = buffer.toString('utf8');
    content = content.split('â€¢').join('•');
    content = content.split('â†’').join('→');
    content = content.split('âž”').join('➔');
    content = content.split('âœ¦').join('✦');
    content = content.split('â–¶').join('▶');
    
    fs.writeFileSync(filePath, content, 'utf8');
};

fixFile('index.html');
fixFile('script.js');
fixFile('style.css');
