import fs from 'fs';
import path from 'path';

const apiDir = '/media/xolva/1610d648-c91c-4442-9109-d3d99767152b/Hackathon-2/evolution_of_todo/todo-app-fullstack/pages/api';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk(apiDir, (filePath) => {
  if (!filePath.endsWith('.js')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  let relativePathFromApi = path.relative(apiDir, filePath);
  let depth = relativePathFromApi.split(path.sep).length - 1;
  let dots = '../'.repeat(depth + 2);

  content = content.replace(/import\s+.*\s+from\s+['"](\.\.\/)+lib\/db\.js['"]/g, match => {
    return match.replace(/['"](\.\.\/)+lib\/db\.js['"]/, `'${dots}lib/db.js'`);
  });

  content = content.replace(/import\s+.*\s+from\s+['"](\.\.\/)+src\/services\/(.*)['"]/g, match => {
    return match.replace(/['"](\.\.\/)+src\/services\//, `'${dots}src/services/`);
  });

  content = content.replace(/import\s+.*\s+from\s+['"](\.\.\/)+src\/models\/(.*)['"]/g, match => {
    return match.replace(/['"](\.\.\/)+src\/models\//, `'${dots}src/models/`);
  });

  if (content !== originalContent) {
    console.log(`Updated: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
