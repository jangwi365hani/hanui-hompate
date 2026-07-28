import { list, del } from '@vercel/blob';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"\n]+)"?/);
  if (m) process.env[m[1]] = m[2];
}

// 1. 옛날 hanui-handover.json (timestampless path) 삭제
const { blobs: oldPath } = await list({ prefix: 'hanui-handover.json' });
for (const b of oldPath) {
  console.log('옛 path 삭제:', b.pathname);
  await del(b.url);
}

// 2. 직접PUT마커 / 정합성테스트 등 테스트 데이터 정리
//    실제 데이터는 김지영(staff) + 사용자 본인이 만든 계정만 유지
//    여기서는 직접 새 latest blob 가져와서 김지영만 남기고 다시 PUT
const { put } = await import('@vercel/blob');
const { blobs: latest } = await list({ prefix: 'hanui-handover/' });
if (latest.length === 0) { console.log('데이터 없음'); process.exit(0); }
const newest = latest.sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];

const r = await fetch(`${newest.url}?v=${new Date(newest.uploadedAt).getTime()}`, { cache: 'no-store' });
const data = await r.json();
console.log('현재 계정:', data.accounts?.map(a=>a.name).join(', '));

// 김지영만 유지
const cleaned = {
  accounts: data.accounts.filter(a => a.name === '김지영'),
  items: {},
};
for (const acc of cleaned.accounts) {
  if (data.items[acc.id]) cleaned.items[acc.id] = data.items[acc.id];
}

await put(`hanui-handover/${Date.now()}.json`, JSON.stringify(cleaned), {
  access: 'public',
  contentType: 'application/json',
  cacheControlMaxAge: 0,
  addRandomSuffix: false,
});

// 옛 timestamped blobs 정리 (최신 1개만 유지)
const { blobs: all } = await list({ prefix: 'hanui-handover/' });
const old = all.sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).slice(1);
if (old.length) await del(old.map(b=>b.url));
console.log('옛 timestamped blob 삭제:', old.length, '개');

console.log('정리 후 계정:', cleaned.accounts.map(a=>a.name).join(', '));
