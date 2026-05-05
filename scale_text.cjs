const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src/views');
const layoutDir = path.join(__dirname, 'src/components/layout');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace text-[8px] with text-[10px]
  content = content.replace(/text-\[8px\]/g, 'text-[10px] md:text-xs');
  
  // Replace text-[9px] with text-xs
  content = content.replace(/text-\[9px\]/g, 'text-xs');
  
  // Replace text-[10px] with text-xs md:text-sm
  content = content.replace(/text-\[10px\]/g, 'text-xs md:text-sm');

  // Remove min-h-screen from cards and replace with min-h-[calc(100vh-8rem)]
  content = content.replace(/min-h-screen/g, 'min-h-[calc(100vh-6rem)]');

  // Replace text-[11px] with text-sm
  content = content.replace(/text-\[11px\]/g, 'text-sm');

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(viewsDir);
walkDir(layoutDir);

console.log("Text scaling completed!");
