"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@spareparts/ui/lib/utils"
import { useUIStyle } from "@spareparts/ui/providers/ui-config-provider"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { dna } = useUIStyle()

  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        // Base Layout & Behavior
        "flex items-center gap-2 leading-none select-none transition-opacity",

        // Peer & Group Disabled States
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",

        // DNA Integration (Size & Weight)
        dna.label,

        className
      )}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
