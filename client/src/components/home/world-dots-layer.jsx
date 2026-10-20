import { WORLD_DOTS_PATH } from './map-geo';

// The land dots as a single svg path; colour comes from the className (currentColor)
export default function WorldDotsLayer({ className, dot = 4.2 }) {
   return (
      <path
         d={WORLD_DOTS_PATH}
         fill="none"
         stroke="currentColor"
         strokeWidth={dot}
         strokeLinecap="round"
         className={className}
      />
   );
}
