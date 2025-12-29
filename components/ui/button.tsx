import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white",
  {
    variants: {
      variant: {
        default:
          "border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 text-base gap-3",
        primary:
          "border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 text-base gap-3",
        destructive:
          "border border-gray-200 hover:bg-red-50 hover:text-red-600",
        icon: "border border-gray-300 bg-white hover:bg-gray-50 p-0",
      },
      size: {
        xs: "size-7 p-1",
        sm: "h-8 text-sm",
        base: "h-10 text-base",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
