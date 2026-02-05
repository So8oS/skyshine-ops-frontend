import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-input shadow-xs",
          "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "checked:bg-primary checked:border-primary",
          "appearance-none cursor-pointer",
          className
        )}
        {...props}
      />
      <Check className="absolute h-3 w-3 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
