// Formatting shared by the journal cards, the single journal page and comments

export const shortDate = (value) =>
   value
      ? new Date(value).toLocaleDateString('en-US', {
           month: 'short',
           day: 'numeric',
           year: 'numeric'
        })
      : '';

// Travel dates are stored as UTC midnight ("2026-06-01T00:00:00Z"); formatting them
// in the local zone showed the previous month for anyone west of Greenwich
export const travelMonth = (value) =>
   value
      ? new Date(value).toLocaleDateString('en-US', {
           month: 'short',
           year: 'numeric',
           timeZone: 'UTC'
        })
      : '';

export const placeOf = (location) =>
   [location?.name, location?.country]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ');

export const initialOf = (name) => name?.trim().charAt(0).toUpperCase() || '?';

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const tagHref = (tag) => `/journals?tag=${encodeURIComponent(tag)}`;

export const travelerHref = (person) => (person?._id ? `/travelers/${person._id}` : null);

export const hasLiked = (likes, userId) =>
   Boolean(userId) && (likes ?? []).some((id) => String(id?._id ?? id) === userId);

export function timeAgo(date, now) {
   const seconds = Math.floor((now - new Date(date).getTime()) / 1000);
   if (seconds < 60) return 'just now';
   const minutes = Math.floor(seconds / 60);
   if (minutes < 60) return `${minutes}m ago`;
   const hours = Math.floor(minutes / 60);
   if (hours < 24) return `${hours}h ago`;
   const days = Math.floor(hours / 24);
   if (days < 30) return `${days}d ago`;
   return shortDate(date);
}
