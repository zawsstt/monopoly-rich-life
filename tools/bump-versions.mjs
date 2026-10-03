/* bump index.html 里已修改文件的 ?v= 缓存指纹(+1),避免上线后旧缓存 */
import { readFileSync, writeFileSync } from 'node:fs';
const modified = ['src/data.js', 'src/sfx.js', 'src/bgm.js', 'src/ai.js', 'src/game.js', 'src/uix.js',
  'src/net.js', 'src/view3d.js', 'src/main.js', 'src/psa.js', 'css/style.css'];
let html = readFileSync('index.html', 'utf8');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const f of modified) {
  html = html.replace(new RegExp('(data-src="' + esc(f) + '\\?v=)(\\d+)'), (m, pre, v) => pre + (+v + 1));
  html = html.replace(new RegExp('(href="' + esc(f) + '\\?v=)(\\d+)'), (m, pre, v) => pre + (+v + 1));
}
writeFileSync('index.html', html);
console.log('done');
