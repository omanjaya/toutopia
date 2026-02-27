"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({
    opacity: 0,
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = options.findIndex((o) => o.value === value);
    const buttons = container.querySelectorAll<HTMLButtonElement>("[data-segment]");
    const activeButton = buttons[activeIndex];

    if (activeButton) {
      requestAnimationFrame(() => {
        setIndicatorStyle({
          width: activeButton.offsetWidth,
          transform: `translateX(${activeButton.offsetLeft - container.offsetLeft}px)`,
          opacity: 1,
        });
      });
    }
  }, [value, options, mounted]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-lg bg-muted/80 p-1",
        className
      )}
    >
      <div
        className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-md bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out"
        style={indicatorStyle}
      />
      {options.map((option) => (
        <button
          key={option.value}
          data-segment
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            "relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
            value === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
