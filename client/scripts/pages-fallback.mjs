// GitHub Pages answers an unknown path with 404.html. A copy of index.html there
// boots the app instead, so deep links like /tour-vibes/journals/<id> load and
// React Router takes over. Runs after the demo build: `npm run build:demo`.
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log('SPA fallback: dist/404.html');
