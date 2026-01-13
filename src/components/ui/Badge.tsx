import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          {
            "bg-zinc-100 text-zinc-700": variant === "default",
            "bg-emerald-50 text-emerald-700": variant === "success",
            "bg-amber-50 text-amber-700": variant === "warning",
            "bg-rose-50 text-rose-600": variant === "danger",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
