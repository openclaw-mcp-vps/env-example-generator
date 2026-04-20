import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[#2f6f3e] bg-[#132418] px-2.5 py-1 text-xs font-medium text-[#7ee787]",
        className
      )}
      {...props}
    />
  );
}
