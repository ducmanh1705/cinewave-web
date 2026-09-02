const fs = require('fs');
const path = require('path');
const dir = './src/pages';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  if (c.includes('toast.') && !c.includes('react-hot-toast')) {
    c = 'import toast from "react-hot-toast";\n' + c;
    fs.writeFileSync(p, c);
  }
});
console.log('Fixed imports!');
