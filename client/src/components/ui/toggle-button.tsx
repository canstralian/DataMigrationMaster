import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  options: {
    value: string;
    label: React.ReactNode;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ToggleButton = React.forwardRef<HTMLDivElement, ToggleButtonProps>(
  ({ options, value, onChange, className }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("flex border-b border-neutral-200 space-x-8", className)}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "py-3 px-1 whitespace-nowrap flex items-center",
              value === option.value 
                ? "border-b-2 border-primary text-text font-medium tab-active" 
                : "border-b-2 border-transparent text-neutral-500 tab"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };
