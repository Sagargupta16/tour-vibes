// Up to two initials for an avatar without a photo
export const initials = (name) =>
   String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('') || '?';

// "March 2023" from a createdAt timestamp, '' when there is none
export const memberSince = (value) => {
   if (!value) return '';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '';
   return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
