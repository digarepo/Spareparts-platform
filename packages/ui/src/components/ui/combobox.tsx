"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command } from "cmdk"

import { cn } from "@spareparts/ui/lib/utils"
import { useUIStyle } from "@spareparts/ui/providers/ui-config-provider"
import { Button } from "@spareparts/ui/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@spareparts/ui/components/ui/popover"

interface ComboboxProps {
  items: readonly string[] | { label: string; value: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  emptyText = "No results found.",
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { dna, style } = useUIStyle()

  const formattedItems = React.useMemo(() => {
    return items.map((item) =>
      typeof item === "string" ? { label: item, value: item } : item
    )
  }, [items])

  const selectedLabel = formattedItems.find((item) => item.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-input/20 font-normal dark:bg-input/30",
            dna.input,   // Handles height/padding/font per style (h-7 for Mira, h-9 for Vega)
            dna.radius,
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown
            className={cn(
              "ml-2 shrink-0 opacity-50",
              style === "mira" ? "size-3.5" : "size-4"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-(--radix-popover-trigger-width) p-0 overflow-hidden", dna.popover)}
        align="start"
      >
        <Command className={cn("flex h-full w-full flex-col", dna.base)}>
          <ComboboxInput placeholder="Search..." />
          <Command.List className={cn("no-scrollbar max-h-72 overflow-y-auto", style === "lyra" ? "p-0" : "p-1")}>
            <Command.Empty className="py-2 text-center text-xs text-muted-foreground">
              {emptyText}
            </Command.Empty>
            <Command.Group>
              {formattedItems.map((item) => (
                <Command.Item
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className={cn(
                    "relative flex cursor-default items-center outline-none select-none",
                    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                    dna.combobox // Captures Vega's py-1.5 vs Nova's py-1
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2",
                      style === "mira" ? "size-3.5" : "size-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...props }, ref) => {
  const { style } = useUIStyle()
  return (
    <div className="flex items-center border-b border-border/50 px-2">
      <Command.Input
        ref={ref}
        className={cn(
          "flex w-full bg-transparent py-2 outline-none placeholder:text-muted-foreground",
          style === "mira" ? "h-7 text-[10px]" : "h-8 text-xs",
          className
        )}
        {...props}
      />
    </div>
  )
})
ComboboxInput.displayName = "ComboboxInput"

const ComboboxContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { dna } = useUIStyle()
  return (
    <Command className={cn("flex flex-col overflow-hidden", dna.popover, className)}>
      {children}
    </Command>
  )
}

const ComboboxEmpty = Command.Empty
const ComboboxList = Command.List
const ComboboxItem = Command.Item

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
}
