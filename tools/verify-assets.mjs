#!/usr/bin/env node
/* 公开 CDN 终验:以浏览器实际加载方式(GET 公开 URL,无鉴权)核对每个素材。
 * 用法:node tools/verify-assets.mjs [--retry N]
 * 比上传脚本的 HEAD(--check)更可信:HEAD 对已存在对象偶发 400(会被误报为缺失),
 * 而公开 GET 正是游戏 A(path) 的取数路径,200+同大小=线上真实可用。 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { argv } from 'node:process';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const REF = 'rzzryotatqucfwtgjcaa';
const PUB = `https://${REF}.supabase.co/storage/v1/object/public/game-assets`;
const ROOTS = ['assets', 'gongyi_movie'];
const RETRY = +(argv[argv.indexOf('--retry') + 1] || 2);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tryN(fn, n) {
  let lastErr;
  for (let i = 0; i < n; i++) {
    try { return await fn(); } catch (e) { lastErr = e || new Error('unknown rejection'); await sleep(400 * (i + 1)); }
  }
  throw lastErr;
}

let nOk = 0, nBad = 0, nNet = 0;
const bad = [], net = [];
for (const root of ROOTS) {
  const files = await walk(root);
  for (const f of files) {
    const rel = relative('.', f).split(sep).join('/');
    const localSize = (await stat(f)).size;
    try {
      const r = await tryN(() => fetch(`${PUB}/${rel}`), RETRY + 1);
      const size = +(r.headers.get('content-length') || 0);
      if (r.status === 200 && size === localSize) { nOk++; continue; }
      nBad++; bad.push(`${rel} -> HTTP ${r.status}, 远端 ${size} / 本地 ${localSize}`);
    } catch (e) {
      nNet++; net.push(`${rel}: ${e && e.message ? e.message : String(e)}`);
    }
  }
}
console.log(`\n终验(公开 GET): OK ${nOk} / 缺损 ${nBad} / 网络未决 ${nNet} / 共 ${nOk + nBad + nNet}`);
if (bad.length) { console.log('— 真实缺失/大小不符 —'); bad.forEach(b => console.log('  ' + b)); }
if (net.length) { console.log('— 网络未决(不判缺失,网络好时重跑)—'); net.forEach(b => console.log('  ' + b)); }
process.exit(bad.length ? 1 : 0);
