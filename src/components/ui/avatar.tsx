"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-xl",
  xl: "w-24 h-24 text-2xl", // 96x96px TDS Profile Avatar
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "프로필 이미지",
      fallback = "M",
      size = "xl",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = React.useState(false);

    // If children are provided (shadcn composition style)
    if (children) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#F2F4F6] shadow-sm flex items-center justify-center font-bold text-[#4E5968]",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    // Direct props style
    return (
      <div
        ref={ref}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#F2F4F6] shadow-sm flex items-center justify-center font-bold text-[#4E5968]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover select-none"
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt = "Avatar", ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    className={cn("h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-[#F2F4F6] text-xs font-semibold text-[#4E5968]",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
