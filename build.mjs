import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const [template, styles, helpStyles, guide, ui] = await Promise.all(
  ['template.html', 'styles.css', 'help.css', 'guide.js', 'ui.js']
    .map(name => fs.readFile(path.join(root, 'src', name), 'utf8'))
);
for (const [name, code] of [['guide', guide], ['ui', ui]]) {
  if (code.includes('</script')) throw new Error(`Unsafe script boundary in ${name}`);
}
const html = template
  .replace('/*__STYLES__*/', () => styles + '\n' + helpStyles)
  .replace('/*__GUIDE__*/', () => guide)
  .replace('/*__UI__*/', () => ui);
if (html.includes('/*__')) throw new Error('Unresolved template marker');
await fs.writeFile(path.join(root, 'index.html'), html);
console.log(`Built index.html (${Buffer.byteLength(html)} bytes).`);
