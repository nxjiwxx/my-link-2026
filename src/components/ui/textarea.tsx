import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-[#E5E8EB] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#191F28] placeholder:text-[#8B95A1] focus-visible:outline-none focus-visible:border-[#3182F6] focus-visible:ring-1 focus-visible:ring-[#3182F6] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
