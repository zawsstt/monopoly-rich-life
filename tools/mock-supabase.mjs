/* 本地 Supabase mock:Phoenix Realtime 信令转发 + 联机 RPC
 * 用途:无外网(或 supabase 被阻断)时对联机链路做端到端验证。
 * 浏览器侧:SB.url 改写为 http://localhost:8124 即可全链路接入。
 * 用法:node tools/mock-supabase.mjs  (端口 8124) */
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';

const PORT = 8124;
const rooms = new Map();   // code -> { guests: n }

/* ---------- HTTP:REST RPC ---------- */
const http = createServer((req, res) => {
  const json = (code, body) => { res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  }); res.end(JSON.stringify(body)); };
  if (req.method === 'OPTIONS') { res.writeHead(204, {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }); res.end(); return; }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    let args = {}; try { args = JSON.parse(body || '{}'); } catch (e) { /* */ }
    const rpc = (req.url || '').match(/\/rest\/v1\/rpc\/(\w+)/);
    if (rpc) {
      const name = rpc[1];
      if (name === 'mp_room_create') {
        let code; do { code = Array.from({length:5}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random()*32|0]).join(''); } while (rooms.has(code));
        rooms.set(code, { guests: 0 });
        json(200, code);
      } else if (name === 'mp_room_join') {
        const r = rooms.get(String(args.p_code || '').toUpperCase());
        if (!r) { json(200, -1); return; }
        json(200, Math.min(3, ++r.guests));
      } else { json(200, null); }   // mp_heartbeat / mp_room_close / report_round ...
      return;
    }
    json(404, { error: 'not found' });
  });
});

/* ---------- WS:Realtime broadcast 转发 ---------- */
const wss = new WebSocketServer({ server: http });
const topics = new Map();   // topic -> Set<ws>
wss.on('connection', (ws, req) => {
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.event === 'phx_join') {
      if (!topics.has(m.topic)) topics.set(m.topic, new Set());
      topics.get(m.topic).add(ws);
      ws.send(JSON.stringify({ topic: m.topic, event: 'phx_reply', ref: m.ref, payload: { status: 'ok', response: {} } }));
      return;
    }
    if (m.event === 'heartbeat') {
      ws.send(JSON.stringify({ topic: 'phoenix', event: 'phx_reply', ref: m.ref, payload: { status: 'ok' } }));
      return;
    }
    if (m.event === 'broadcast' && m.payload && m.payload.type === 'broadcast') {
      /* 还原成到达端期待的形态:event=sig,payload=自定义消息 */
      const out = JSON.stringify({ topic: m.topic, event: m.payload.event, payload: m.payload.payload, ref: null });
      const set = topics.get(m.topic);
      if (set) for (const peer of set) if (peer !== ws && peer.readyState === 1) peer.send(out);
    }
  });
  ws.on('close', () => { for (const set of topics.values()) set.delete(ws); });
});

http.listen(PORT, () => console.log('mock supabase on :' + PORT));
