/* CDP eval:node tools/cdp-eval.mjs '<js expr>' —— 对 CDP 端口(默认 9222,CDP_PORT 环境变量可改)Chrome 的游戏 tab 执行表达式 */
const expr = process.argv[2];
if (!expr) { console.error('usage: node cdp-eval.mjs "<js>"'); process.exit(1); }
const PORT = process.env.CDP_PORT || '9222';
const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
const page = list.find(t => t.type === 'page' && t.url.includes('localhost:8123'));
if (!page) { console.error('NO-GAME-TAB'); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
  }
};
ws.onopen = async () => {
  try {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const v = r.result && r.result.value;
    console.log(typeof v === 'string' ? v : JSON.stringify(v));
  } catch (e) { console.error('EVAL-ERR', e.message); }
  ws.close(); process.exit(0);
};
setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 20000);
