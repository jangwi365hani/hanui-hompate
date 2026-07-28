import { put, list } from '@vercel/blob';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"\n]+)"?/);
  if (m) process.env[m[1]] = m[2];
}

console.log('=== PUT 직전 list ===');
let { blobs } = await list({ prefix: 'hanui-handover' });
console.log('  uploadedAt:', blobs[0]?.uploadedAt);
console.log('  size:', blobs[0]?.size);

const before = await fetch(blobs[0].url, { cache: 'no-store' });
const beforeData = await before.json();
console.log('  계정:', beforeData.accounts?.map(a=>a.name).join(', '));

console.log('\n=== 직접 PUT (테스트마커 추가) ===');
const newData = {
  ...beforeData,
  accounts: [...beforeData.accounts, { id: 'PUT_TEST_'+Date.now(), name: '직접PUT마커', role: 'staff', since: '2026-05-04', memo: '' }],
};
const result = await put('hanui-handover.json', JSON.stringify(newData), {
  access: 'public',
  contentType: 'application/json',
  cacheControlMaxAge: 0,
  allowOverwrite: true,
  addRandomSuffix: false,
});
console.log('  PUT 결과 url:', result.url);
console.log('  PUT 결과 pathname:', result.pathname);

console.log('\n=== PUT 직후 list (서버측 진짜 상태) ===');
({ blobs } = await list({ prefix: 'hanui-handover' }));
console.log('  uploadedAt:', blobs[0]?.uploadedAt);
console.log('  size:', blobs[0]?.size);

console.log('\n=== PUT 직후 fetch ===');
const after = await fetch(`${result.url}?t=${Date.now()}`, { cache: 'no-store' });
console.log('  cache-control:', after.headers.get('cache-control'));
console.log('  age:', after.headers.get('age'));
console.log('  x-vercel-cache:', after.headers.get('x-vercel-cache'));
const afterData = await after.json();
console.log('  계정:', afterData.accounts?.map(a=>a.name).join(', '));
console.log('  직접PUT마커 보임?', afterData.accounts?.some(a=>a.name==='직접PUT마커'));
