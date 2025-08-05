import Link, { LinkProps } from "next/link";
import { ReactNode, HTMLAttributeAnchorTarget } from "react";

export default function OverviewNavbarItem({
  children,
  target = "_self",
  ...props
}: {
  children: ReactNode;
  target?: HTMLAttributeAnchorTarget;
} & LinkProps) {
  return (
    <Link
      target={target}
      {...props}
      className="relative px-2 py-1 group text-lg text-cocoa custom-cursor-hover
    text-center h-full flex items-center justify-center"
    >
      <span
        className="h-full bg-cinnamon/20 absolute bottom-0 rounded-2xl
        left-1/2 group-hover:left-0 w-0 group-hover:w-full transition-all duration-400 ease-in-out"
      />
      {children}
    </Link>
  );
}
