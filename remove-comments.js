const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'];
const excludeDirs = ['node_modules', '.git', 'dist', 'build'];

async function processDirectory(directory) {
  try {
    const items = await readdir(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          await processDirectory(fullPath);
        }
      } else if (extensions.includes(path.extname(item).toLowerCase())) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    let result = content
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
      .replace(/^\s*\n/gm, '')
      .trim();
    
    if (result !== content) {
      await writeFile(filePath, result, 'utf8');
      console.log(`Processed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

const frontendSrc = path.join(__dirname, 'Frontend', 'src');
const backendDir = path.join(__dirname, 'Backend');

async function processAll() {
  await processDirectory(frontendSrc);
  await processDirectory(backendDir);
  console.log('Comment removal completed from all files!');
}

processAll().catch(console.error);
