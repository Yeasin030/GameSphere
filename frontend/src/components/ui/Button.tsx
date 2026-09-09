import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(139,92,246,0.3)]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-surface-border bg-transparent hover:bg-surface-light text-foreground",
        neonOutline: "border-2 border-accent-lime text-accent-lime hover:bg-accent-lime/10 shadow-[0_0_10px_rgba(213,255,64,0.3)]",
        glass: "bg-surface-glass border border-surface-border text-foreground hover:bg-surface-light backdrop-blur-md",
        secondary: "bg-surface-light text-foreground hover:bg-surface-border",
        ghost: "hover:bg-surface-light hover:text-foreground text-foreground/80",
        link: "text-primary underline-offset-4 hover:underline",
        bluePlay: "bg-accent-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-blue-600 rounded-full",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
