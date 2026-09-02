const fs = require('fs');
const path = require('path');
const dir = './src/pages';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  
  if (!c.includes('react-hot-toast')) {
    c = c.replace(/import\s+.*?from\s+['"].*?['"];\n/, match => match + 'import toast from "react-hot-toast";\n');
  }

  // AuthPage specific tweaks:
  c = c.replace(/setError\("Đăng ký thành công.*?"\);/, 'toast.success("Đăng ký thành công — hãy đăng nhập để tiếp tục.");');
  
  // Replace setError(err.message) -> toast.error(err.message)
  c = c.replace(/setError\(\s*err\.message\s*\)/g, 'toast.error(err.message)');
  c = c.replace(/setError\(\s*""([^)]*)\)\s*;?/g, ''); // empty setError
  c = c.replace(/setErrorMessage\(\s*err\.message\s*\)/g, 'toast.error(err.message)');
  c = c.replace(/setErrorMessage\(\s*""([^)]*)\)\s*;?/g, '');
  
  // other setErrors
  c = c.replace(/setError\("(.*?)"\)/g, 'toast.error("$1")');
  c = c.replace(/setErrorMessage\("(.*?)"\)/g, 'toast.error("$1")');
  c = c.replace(/if \(!cancelled\) setError\(err\.message\);/g, 'if (!cancelled) toast.error(err.message);');

  // Remove the div error blocks
  c = c.replace(/\{error &&\s*<div\s+className="panel-new__error">\{error\}<\/div>\s*\}/g, '');
  c = c.replace(/\{errorMessage &&\s*<div\s+className="panel-new__error">\{errorMessage\}<\/div>\s*\}/g, '');
  
  // Multi-line error block
  c = c.replace(/\{error && \([\s\S]*?\{error\}[\s\S]*?<\/div>\s*\)\}/g, '');
  c = c.replace(/\{errorMessage && \([\s\S]*?\{errorMessage\}[\s\S]*?<\/div>\s*\)\}/g, '');

  // Remove state hooks
  c = c.replace(/const \[error, setError\] = useState\(.*?\)[\s;]*/g, '');
  c = c.replace(/const \[errorMessage, setErrorMessage\] = useState\(.*?\)[\s;]*/g, '');
  
  fs.writeFileSync(p, c);
});
console.log('Done refactoring toast!');
