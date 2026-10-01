import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-[#E8F3FF] text-[#3182F6]",
        primary: "bg-[#3182F6] text-white",
        best: "bg-[#FEECEC] text-[#F04452]",
        new: "bg-[#EAFBF2] text-[#04C05E]",
        warning: "bg-[#FFF4E6] text-[#FF8F1F]",
        neutral: "bg-[#F2F4F6] text-[#4E5968]",
        outline: "border border-[#E5E8EB] bg-white text-[#4E5968]",
        dark: "bg-[#191F28] text-white",
      },
      size: {
        default: "h-[22px]",
        sm: "h-[18px] text-[10px] px-1.5",
        lg: "h-[26px] text-xs px-2.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
