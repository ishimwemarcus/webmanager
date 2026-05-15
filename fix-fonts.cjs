const fs = require('fs');
const path = require('path');

const dirPath = path.join('c:\\xampp\\htdocs\\manager\\htdocs\\manager web\\src');

function walk(dir) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.jsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(dirPath);
let replacedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace microscopic hardcoded values
    content = content.replace(/text-\[8px\]/g, 'text-xs');
    content = content.replace(/text-\[9px\]/g, 'text-xs');
    content = content.replace(/text-\[10px\]/g, 'text-xs md:text-sm');
    
    // Normalizing excessively large headings on mobile
    content = content.replace(/text-4xl/g, 'text-3xl md:text-4xl');
    content = content.replace(/text-5xl/g, 'text-3xl md:text-5xl');
    content = content.replace(/text-6xl/g, 'text-4xl md:text-6xl');
    content = content.replace(/text-3xl md:text-3xl md:text-4xl/g, 'text-3xl md:text-4xl'); // prevent double up
    content = content.replace(/text-3xl md:text-3xl md:text-5xl/g, 'text-3xl md:text-5xl'); // prevent double up
    content = content.replace(/text-4xl md:text-4xl md:text-6xl/g, 'text-4xl md:text-6xl'); // prevent double up

    if (original !== content) {
        fs.writeFileSync(file, content);
        replacedCount++;
    }
});

console.log('Replaced microscopic and massive text in ' + replacedCount + ' files');
