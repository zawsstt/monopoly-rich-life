#!/usr/bin/env node
/* 上传素材到 Supabase Storage(game-assets 公开桶)
 * 用法:SUPABASE_SERVICE_KEY=xxx node tools/upload-assets.mjs [--check]
 *   --check 只校验远端对象存在与大小,不上传
 * 同名同大小跳过,断点续传安全;结尾输出差异报告。 */
import { createHash } from 'node:crypto';
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { argv, env, exit, cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

/* 以脚本自身位置定位项目根（tools/ 的上级），免疫任意 cwd 启动 */
process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const REF = 'rzzryotatqucfwtgjcaa';
const SB = `https://${REF}.supabase.co`;
const KEY = env.SUPABASE_SERVICE_KEY;
const BUCKET = 'game-assets';
const ROOTS = ['assets', 'gongyi_movie'];   // 上传范围:全部素材(代码 js/src 不上传)
const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.mp4': 'video/mp4', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
};

if (!KEY) { console.error('缺少 SUPABASE_SERVICE_KEY 环境变量'); exit(1); }
const CHECK_ONLY = argv.includes('--check');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

async function remoteInfo(path) {
  // HEAD object;404=不存在;400 一律当"未知"（走重传，upsert 幂等）而不是失败
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'HEAD',
    headers: { apikey: KEY, authorization: `Bearer ${KEY}` },
  });
  if (r.status === 404 || r.status === 400) return { size: -1, etag: null };
  if (!r.ok) throw new Error(`HEAD ${path} -> HTTP ${r.status}`);
  return { size: +r.headers.get('content-length') || -1, etag: r.headers.get('etag') };
}

async function upload(path, bytes, type) {
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: KEY, authorization: `Bearer ${KEY}`,
      'content-type': type, 'x-upsert': 'true',
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body: bytes,
  });
  const txt = await r.text();
  if (!r.ok && r.status !== 409) throw new Error(`POST ${path} -> HTTP ${r.status} ${txt.slice(0, 200)}`);
}

let nUp = 0, nSkip = 0, nFail = 0;
const failures = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tryN(fn, n, tag) {
  let lastErr;
  for (let i = 0; i < n; i++) {
    try { return await fn(); } catch (e) { lastErr = e; await sleep(400 * (i + 1)); }   // 抖动网络:短退避重试
  }
  throw lastErr;
}
for (const root of ROOTS) {
  const files = await walk(root);
  console.log(`[${root}] ${files.length} 个文件`);
  for (const f of files) {
    const rel = relative('.', f).split(sep).join('/');
    try {
      const s = await stat(f);
      const remote = await tryN(() => remoteInfo(rel), 3, 'head');
      if (remote && remote.size === s.size) { nSkip++; continue; }   // 已存在同大小,跳过
      if (CHECK_ONLY) { console.log(`  差异: ${rel} (本地 ${s.size} / 远端 ${remote ? remote.size : '无'})`); nUp++; continue; }
      const buf = await readFile(f);
      await tryN(() => upload(rel, buf, MIME[(rel.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()] || 'application/octet-stream'), 3, 'post');
      console.log(`  上传: ${rel} (${(s.size / 1024).toFixed(0)} KB)`);
      nUp++;
    } catch (e) {
      nFail++; failures.push(`${rel}: ${e.message}`);
      console.error(`  失败: ${rel} — ${e.message}`);
    }
  }
}
console.log(`\n完成: 上传 ${nUp} / 跳过 ${nSkip} / 失败 ${nFail}${CHECK_ONLY ? '(--check 模式)' : ''}`);
if (failures.length) { failures.forEach(f => console.error('  ' + f)); exit(1); }
