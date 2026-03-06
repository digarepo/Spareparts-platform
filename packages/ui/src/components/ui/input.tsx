"use client"

import * as React from "react"
import { cn } from "@spareparts/ui/lib/utils"
import { useUIStyle } from "@spareparts/ui/providers/ui-config-provider"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { dna } = useUIStyle()

    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          // Base Layout
          "flex w-full min-w-0 py-1 transition-[color,box-shadow] outline-none",

          // Base Styling
          "border border-input placeholder:text-muted-foreground",

          // Shared Interactive States
          "focus-visible:border-ring focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

          // Shared Validation States
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          "dark:bg-input/30",

          // File Input Shared Styling
          "file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground",

          // DNA Integration
          dna.radius,
          dna.input,     // Handles height, padding, font-size, ring-width, and bg-opacity
          dna.fileInput, // Handles specific file-button heights and fonts

          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
