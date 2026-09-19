import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold tracking-tight transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer rounded-2xl",
          {
            "bg-primary text-primary-foreground shadow-xs hover:opacity-90":
              variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "border border-border bg-card text-foreground hover:bg-muted":
              variant === "outline",
            "hover:bg-muted text-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:opacity-90":
              variant === "destructive",
            "bg-accent text-accent-foreground hover:bg-accent/80":
              variant === "accent",
          },
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
