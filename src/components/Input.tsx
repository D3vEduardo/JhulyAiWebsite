import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export default function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={twMerge(
        props.className,
        "bg-apricot/40 py-4 px-6 rounded-2xl w-full border-3 border-cinnamon/30 outline-none text-cocoa"
      )}
    />
  );
}
