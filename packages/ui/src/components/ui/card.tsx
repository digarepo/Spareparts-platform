import * as React from "react";
import { cn } from "@spareparts/ui";
import { useUIStyle } from "@spareparts/ui/providers/ui-config-provider";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  const { dna, style } = useUIStyle();

  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col overflow-hidden bg-card text-card-foreground",
        // Logic for Vega, Maia, Mira: they use vertical padding on the container
        (style === "vega" || style === "maia" || style === "mira") && "py-6 data-[size=sm]:py-4",
        style === "mira" && "py-4 data-[size=sm]:py-3", // Mira is slightly smaller

        // Logic for Nova/Lyra: they often remove bottom padding if a footer exists
        (style === "nova" || style === "lyra") && "py-4 data-[size=sm]:py-3 has-data-[slot=card-footer]:pb-0",

        "has-[>img:first-child]:pt-0",
        dna.card, // includes gap and shadow/ring
        dna.radius,
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { dna, style } = useUIStyle();
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        // Border bottom spacing logic from original files
        "[.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        style === "mira" && "[.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        dna.cardSection,
        style === "maia" && "gap-2",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { dna } = useUIStyle();
  return <div data-slot="card-title" className={cn(dna.title, className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { style } = useUIStyle();
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground",
        (style === "lyra" || style === "mira") ? "text-xs/relaxed" : "text-sm",
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { dna, style } = useUIStyle();
  return (
    <div
      data-slot="card-content"
      className={cn(dna.cardSection, dna.base, className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { dna, style } = useUIStyle();
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        // Nova: Specific bar with background
        style === "nova" && "border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        // Lyra: Specific bar with border
        style === "lyra" && "border-t p-4 group-data-[size=sm]/card:p-3",
        // Vega, Maia, Mira: These do NOT have borders/bg by default, just padding
        (style !== "nova" && style !== "lyra") && [
          dna.cardSection,
          "[.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
          // Adding explicit bottom padding for when they contain buttons
          "pb-6 group-data-[size=sm]/card:pb-4",
          style === "mira" && "pb-4 group-data-[size=sm]/card:pb-3"
        ],
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
