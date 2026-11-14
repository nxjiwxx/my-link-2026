"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, "defaultValue" | "value"> {
  defaultValue?: string | string[];
  value?: string | string[];
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ defaultValue, value, ...props }, ref) => {
    const formattedDefaultValue = React.useMemo(() => {
      if (defaultValue === undefined) return undefined;
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }, [defaultValue]);

    const formattedValue = React.useMemo(() => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    }, [value]);

    return (
      <AccordionPrimitive.Root
        ref={ref}
        defaultValue={formattedDefaultValue}
        value={formattedValue}
        {...props}
      />
    );
  }
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-[#E5E8EB] transition-colors last:border-b-0",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-semibold text-[#191F28] transition-all hover:text-[#FF5A36] cursor-pointer text-left [&[data-panel-open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-[#8B95A1] transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Panel
    ref={ref}
    className={cn(
      "overflow-hidden text-xs sm:text-sm text-[#4E5968] leading-relaxed pb-4 pt-0 transition-all",
      className
    )}
    {...props}
  >
    <div className="pt-1">{children}</div>
  </AccordionPrimitive.Panel>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
