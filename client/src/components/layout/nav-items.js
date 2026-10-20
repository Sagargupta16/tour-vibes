import { Compass, MapIcon, NotebookPen, UserRound } from 'lucide-react';

export const REPO_URL = 'https://github.com/Sagargupta16/tour-vibes';

const journals = { to: '/journals', label: 'Journals', icon: Compass };
const myJournals = { to: '/myjournals', label: 'My Journals', icon: NotebookPen };
const map = { to: '/map', label: 'Map', icon: MapIcon };

export const profileLink = { to: '/profile', label: 'Profile', icon: UserRound };

// One list for the header, the mobile sheet and the footer, so they never drift
export const navLinksFor = (isAuth) => (isAuth ? [journals, myJournals, map] : [journals, map]);
