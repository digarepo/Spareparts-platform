'use client';

import * as React from 'react';
import { cn } from '@spareparts/ui/lib/utils';
import { useUIStyle } from '@spareparts/ui/providers/ui-config-provider';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  const { dna } = useUIStyle();

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full transition-[color,box-shadow] outline-none',

        'field-sizing-content',

        'border border-input placeholder:text-muted-foreground dark:bg-input/30',

        'focus-visible:border-ring focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',

        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',

        dna.radius,
        dna.textarea,

        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
