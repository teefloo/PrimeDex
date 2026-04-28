import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg border border-border/30 bg-muted/55 backdrop-blur-xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
