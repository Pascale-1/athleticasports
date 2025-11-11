import { cn } from "@/lib/utils";

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "card" | "avatar" | "text";
}) {
  const variantStyles = {
    default: "rounded-md",
    card: "rounded-xl",
    avatar: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800",
        "bg-[length:200%_100%] animate-shimmer",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
