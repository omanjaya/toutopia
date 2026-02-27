import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface WindowCardProps extends React.ComponentProps<"div"> {
  title?: string;
}

function WindowCard({ className, title, children, ...props }: WindowCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        {title && (
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {title}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function WindowCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

export { WindowCard, WindowCardContent };
