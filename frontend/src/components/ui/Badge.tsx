import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/components/layout/Sidebar"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-surface-light text-foreground hover:bg-surface-border",
        outline: "text-foreground border-surface-border",
        neon: "border-accent-lime text-accent-lime shadow-[0_0_8px_rgba(213,255,64,0.3)] bg-accent-lime/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
