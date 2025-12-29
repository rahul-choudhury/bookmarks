import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "border border-gray-300 bg-white ring-offset-2 focus:ring-2 focus:ring-gray-500 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
