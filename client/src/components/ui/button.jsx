import { cloneElement, isValidElement } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Sizes grow to 44px on touch screens (pointer-coarse), so phones get real tap targets
const buttonVariants = cva(
   "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
   {
      variants: {
         variant: {
            default:
               'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] hover:bg-primary/90',
            outline:
               'border-border bg-background hover:border-foreground/20 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-transparent dark:hover:bg-muted',
            secondary:
               'bg-secondary text-secondary-foreground hover:bg-secondary/70 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
            ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted',
            destructive:
               'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
            link: 'text-primary underline-offset-4 hover:underline active:scale-100',
            // Accent-tinted surface for secondary calls to action and active toggles
            soft: 'bg-primary/10 text-primary hover:bg-primary/15 aria-pressed:bg-primary aria-pressed:text-primary-foreground dark:bg-primary/15 dark:hover:bg-primary/20'
         },
         size: {
            default:
               'h-9 gap-1.5 px-3.5 pointer-coarse:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
            xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] pointer-coarse:h-10 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
            lg: 'h-11 gap-2 px-5 text-[0.95rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
            // Hero and closing calls to action
            xl: "h-12 gap-2 rounded-xl px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-[1.125rem]",
            icon: 'size-9 pointer-coarse:size-11',
            'icon-xs':
               "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
            'icon-sm':
               'size-8 rounded-[min(var(--radius-md),12px)] pointer-coarse:size-10 in-data-[slot=button-group]:rounded-lg',
            'icon-lg': 'size-10 pointer-coarse:size-11'
         }
      },
      defaultVariants: {
         variant: 'default',
         size: 'default'
      }
   }
);

// asChild styles the only child (usually a router <Link>) as a button and keeps
// its own element, so links stay links instead of a <button> wrapping an <a>
function Button({
   className,
   variant = 'default',
   size = 'default',
   asChild = false,
   render,
   nativeButton,
   children,
   ...props
}) {
   const classes = cn(buttonVariants({ variant, size, className }));

   if (asChild && isValidElement(children)) {
      return cloneElement(children, {
         'data-slot': 'button',
         ...props,
         className: cn(classes, children.props.className)
      });
   }

   return (
      <ButtonPrimitive
         data-slot="button"
         className={classes}
         render={render}
         nativeButton={nativeButton ?? !render}
         {...props}
      >
         {children}
      </ButtonPrimitive>
   );
}

export { Button, buttonVariants };
