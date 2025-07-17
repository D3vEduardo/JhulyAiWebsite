import { ComponentProps } from "react";

export default function Label({ children, ...props }: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className="flex justify-center gap-x-1 text-center text-cinnamon font-semibold ml-1"
    >
      {children}
    </label>
  );
}
