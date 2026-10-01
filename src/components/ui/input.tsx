import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#E5E8EB] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#191F28] placeholder:text-[#8B95A1] focus-visible:outline-none focus-visible:border-[#3182F6] focus-visible:ring-1 focus-visible:ring-[#3182F6] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
