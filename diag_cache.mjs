import { list } from '@vercel/blob';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"\n]+)"?/);
  if (m) process.env[m[1]] = m[2];
}

console.log('=== list 결과 (서버측 진짜 상태) ===');
const { blobs } = await list({ prefix: 'hanui-handover' });
for (const b of blobs) {
  console.log(`  uploadedAt=${b.uploadedAt}  size=${b.size}  url=${b.url}`);
}

if (blobs.length > 0) {
  const latest = blobs.sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];

  console.log('\n=== fetch 캐시 없음 ===');
  const r1 = await fetch(latest.url, { cache: 'no-store' });
  const d1 = await r1.json();
  console.log('  계정:', d1.accounts?.map(a=>`${a.name}(${a.role})`).join(', '));

  console.log('\n=== fetch 캐시버스팅 query ===');
  const r2 = await fetch(`${latest.url}?v=${Date.now()}`, { cache: 'no-store' });
  const d2 = await r2.json();
  console.log('  계정:', d2.accounts?.map(a=>`${a.name}(${a.role})`).join(', '));

  console.log('\n=== response headers ===');
  console.log('  cache-control:', r2.headers.get('cache-control'));
  console.log('  age:', r2.headers.get('age'));
  console.log('  x-vercel-cache:', r2.headers.get('x-vercel-cache'));
}
