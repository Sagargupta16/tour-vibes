// Prints the size of every JS chunk in dist/ and what the browser loads on first
// paint (the entry script plus its modulepreload links in dist/index.html).
// Run after `npm run build`: `npm run bundle:report`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = join(import.meta.dirname, '..', 'dist');
const assets = join(dist, 'assets');
// kB = 1000 bytes, the same unit vite build prints
const kb = (bytes) => (bytes / 1000).toFixed(2);

const size = (file) => {
   const buf = readFileSync(join(assets, file));
   return { raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
};

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const initial = new Set(
   [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((match) => match[1])
);

const rows = readdirSync(assets)
   .filter((file) => file.endsWith('.js'))
   .map((file) => ({ file, initial: initial.has(file), ...size(file) }))
   .sort((a, b) => b.raw - a.raw);

console.log('| Chunk | Loaded on first paint | Raw kB | Gzip kB |');
console.log('| --- | --- | ---: | ---: |');
for (const row of rows) {
   console.log(
      `| ${row.file} | ${row.initial ? 'yes' : 'no'} | ${kb(row.raw)} | ${kb(row.gzip)} |`
   );
}

const sum = (list, key) => list.reduce((total, row) => total + row[key], 0);
const first = rows.filter((row) => row.initial);
console.log('');
console.log(`JS chunks: ${rows.length}`);
console.log(`First paint JS: ${kb(sum(first, 'raw'))} kB raw, ${kb(sum(first, 'gzip'))} kB gzip`);
console.log(`All JS: ${kb(sum(rows, 'raw'))} kB raw, ${kb(sum(rows, 'gzip'))} kB gzip`);
