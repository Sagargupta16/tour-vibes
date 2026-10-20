import { isValidElement } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
   return twMerge(clsx(inputs));
}

// Base UI takes a `render` element where Radix took `asChild`; this keeps the
// shadcn habit working: <SheetTrigger asChild><Button /></SheetTrigger>
export function asChildProps({ asChild = false, children, ...props }) {
   if (asChild && isValidElement(children)) return { ...props, render: children };
   return { ...props, children };
}
