/* CDP 真实点击:node tools/cdp-click.mjs <selector> —— 在页面坐标处派发真实鼠标事件序列 */
const sel = process.argv[2];
if (!sel) { console.error('usage: node cdp-click.mjs "<selector>"'); process.exit(1); }
const PORT = process.env.CDP_PORT || '9222';
const MATCH = process.env.CDP_MATCH || 'localhost:8123';   // tab URL 过滤(线上冒烟可设为 github.io)
const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
const page = list.find(t => t.type === 'page' && t.url.includes(MATCH));
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const mid = ++id; pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
};
ws.onopen = async () => {
  try {
    const doc = await send('Runtime.evaluate', { expression: `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; const r = el.getBoundingClientRect(); return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.width > 0 && r.height > 0 }); })()`, returnByValue: true });
    const pos = JSON.parse(doc.result.value || 'null');
    if (!pos || !pos.vis) { console.error('NOT-VISIBLE'); process.exit(1); }
    for (const [type, btn] of [['mousePressed', 'left'], ['mouseReleased', 'left']]) {
      await send('Input.dispatchMouseEvent', { type, x: pos.x, y: pos.y, button: btn, clickCount: 1 });
    }
    console.log('CLICKED', pos.x | 0, pos.y | 0);
  } catch (e) { console.error('ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 15000);
