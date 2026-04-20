import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-[#2ea043] text-white hover:bg-[#3fb950]",
        secondary:
          "border border-[#263041] bg-[#111827] text-[#e6edf3] hover:bg-[#161b22]",
        ghost: "text-[#9da7b5] hover:bg-[#161b22] hover:text-[#e6edf3]",
        destructive: "bg-[#f85149] text-white hover:bg-[#da3633]"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
