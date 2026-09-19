import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "accent" | "success" | "warning"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground":
            variant === "default",
          "border-transparent bg-secondary text-secondary-foreground":
            variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground":
            variant === "destructive",
          "border-border text-foreground": variant === "outline",
          "border-accent-foreground/20 bg-accent text-accent-foreground":
            variant === "accent",
          "border-emerald-300 bg-emerald-50 text-emerald-700":
            variant === "success",
          "border-amber-300 bg-amber-50 text-amber-800":
            variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}
