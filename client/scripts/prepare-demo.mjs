// Copies the server's demo journals (seed/data.json and its photos) into
// public/demo/ for the static demo build, where the in-browser mock API fetches
// them. Runs before `npm run build:demo` and `npm run dev:demo`; the folder is
// gitignored and nothing in the app imports from ../server.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const seed = join(import.meta.dirname, '..', '..', 'server', 'seed');
const out = join(import.meta.dirname, '..', 'public', 'demo');

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'photos'), { recursive: true });
copyFileSync(join(seed, 'data.json'), join(out, 'data.json'));

const photos = readdirSync(join(seed, 'photos')).filter((file) => file.endsWith('.jpg'));
for (const file of photos) {
   copyFileSync(join(seed, 'photos', file), join(out, 'photos', file));
}

console.log(`Demo data: data.json and ${photos.length} photos copied to public/demo/`);
