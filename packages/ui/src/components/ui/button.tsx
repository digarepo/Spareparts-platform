import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { useUIStyle } from '@spareparts/ui/providers/ui-config-provider';
import { cn } from '@spareparts/ui/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline: 'border-border hover:bg-muted hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary',
        ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted',
        destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-2.5 gap-1.5', // Shared by Lyra/Nova
        xs: 'h-6 px-2 gap-1 text-xs',
        sm: 'h-7 px-2.5 gap-1',
        lg: 'h-9 px-2.5 gap-1.5',
        icon: 'size-8',
        'icon-xs': 'size-6',
        'icon-sm': 'size-7',
        'icon-lg': 'size-9',
      },
      uiStyle: {
        vega: 'text-sm',
        nova: 'text-sm',
        mira: '', // Handled by compound
        maia: 'text-sm',
        lyra: 'text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      uiStyle: 'nova',
    },
    compoundVariants: [
      // Vega Scale
      { uiStyle: 'vega', size: 'default', class: 'h-9' },
      { uiStyle: 'vega', size: 'sm', class: 'h-8' },
      { uiStyle: 'vega', size: 'lg', class: 'h-10' },
      // Maia Scale
      { uiStyle: 'maia', size: 'default', class: 'h-9 px-3' },
      { uiStyle: 'maia', size: 'lg', class: 'h-10 px-4' },
      // Mira Scale (Smallest)
      { uiStyle: 'mira', size: 'default', class: 'h-7 px-2 text-xs/relaxed' },
      { uiStyle: 'mira', size: 'xs', class: 'h-5 text-[0.625rem]' },
      { uiStyle: 'mira', size: 'sm', class: 'h-6 px-2' },
      { uiStyle: 'mira', size: 'lg', class: 'h-8 px-2.5' },
    ],
  },
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, uiStyle, styleOverride, asChild = false, ...props }, ref) => {
    const { style: globalStyle, dna } = useUIStyle();
    const Comp = asChild ? Slot : 'button';
    const activeStyle = styleOverride || uiStyle || globalStyle;

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, uiStyle: activeStyle }),
          dna.radius,
          dna.button,
          variant === 'outline' && dna.outline,
          className
        )}
        {...props}
      />
    );
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  styleOverride?: VariantProps<typeof buttonVariants>['uiStyle'];
}

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       className,
//       variant,
//       size,
//       uiStyle,
//       styleOverride,
//       asChild = false,
//       ...props
//     },
//     ref,
//   ) => {
//     const { style: globalStyle } = useUIStyle();
//     const Comp = asChild ? Slot : 'button';

//     return (
//       <Comp
//         data-slot="button"
//         data-variant={variant}
//         data-size={size}
//         className={cn(
//           buttonVariants({
//             variant,
//             size,
//             uiStyle: styleOverride || uiStyle || globalStyle,
//             className,
//           }),
//         )}
//         ref={ref}
//         {...props}
//       />
//     );
//   },
// );
Button.displayName = 'Button';

export { Button, buttonVariants };
