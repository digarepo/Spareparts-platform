"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@spareparts/ui/lib/utils"
import { useUIStyle } from "@spareparts/ui/providers/ui-config-provider"
import { Button } from "@spareparts/ui/components/ui/button"
import { Input } from "@spareparts/ui/components/ui/input"
import { Textarea } from "@spareparts/ui/components/ui/textarea"

/**
 * INPUT GROUP MAIN CONTAINER
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  const { dna } = useUIStyle()

  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full min-w-0 items-center border border-input transition-all outline-none",
        "in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0",
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col",
        "has-[>textarea]:h-auto dark:bg-input/30",
        // Spacing overrides for block alignments
        "has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        dna.radius,
        dna.inputGroup,
        dna.inputGroupBg,
        className
      )}
      {...props}
    />
  )
}

/**
 * ADDON (Icon, Text, or KBD wrapper)
 */
const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center select-none group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start": "order-first has-[>kbd]:ml-[-0.15rem]",
        "inline-end": "order-last has-[>kbd]:mr-[-0.15rem]",
        "block-start": "order-first w-full justify-start pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end": "order-last w-full justify-start pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
      uiStyle: {
        vega: "gap-2 py-1.5 text-sm font-medium",
        nova: "gap-2 py-1.5 text-sm font-medium",
        mira: "gap-1 py-2 text-xs/relaxed font-medium",
        maia: "gap-2 py-2 text-sm font-medium",
        lyra: "gap-2 py-1.5 text-xs font-medium",
      }
    },
    defaultVariants: {
      align: "inline-start",
    },
    compoundVariants: [
        { align: ["block-start", "block-end"], uiStyle: "maia", class: "px-3 pt-3" },
        { align: ["block-start", "block-end"], uiStyle: ["vega", "nova", "lyra"], class: "px-2.5" },
        { align: ["block-start", "block-end"], uiStyle: "mira", class: "px-2" },
    ]
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  const { style, dna } = useUIStyle()
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        inputGroupAddonVariants({ align, uiStyle: style }),
        dna.inputGroupAddon,
        "**:data-[slot=kbd]:" + dna.inputGroupKbd,
        "[&>svg:not([class*='size-'])]:size-4 mira:[&>svg:not([class*='size-'])]:size-3.5",
        className
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

/**
 * INPUT GROUP BUTTON
 */
const inputGroupButtonVariants = cva(
  "flex items-center gap-2 shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 px-2",
        "icon-xs": "size-6 p-0",
        "icon-sm": "size-8 p-0",
      },
      uiStyle: {
        vega: "text-sm",
        nova: "text-sm",
        mira: "h-5 text-xs/relaxed",
        maia: "text-sm",
        lyra: "text-xs",
      }
    },
    defaultVariants: {
      size: "xs",
    }
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  const { style, dna } = useUIStyle()
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(
        inputGroupButtonVariants({ size, uiStyle: style }),
        dna.radius, // Applied for Mira/Maia specifics
        className
      )}
      {...props}
    />
  )
}

/**
 * TEXT / INPUT / TEXTAREA
 */
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  const { dna } = useUIStyle()
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        dna.base, // Uses the 'base' font size from your DNA
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  const { dna } = useUIStyle()
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 disabled:bg-transparent",
        dna.base,
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const { dna } = useUIStyle()
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 disabled:bg-transparent",
        dna.base,
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
