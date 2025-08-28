import { DropdownItemIcon, OnSelectType, useDropdown } from "@/store/dropdown";
import { ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface DropdownProps {
  id: string;
  defaultValue?: {
    value: string;
    label: string;
    icon: DropdownItemIcon;
  } | null;
  persistValue?: boolean;
  onSelect?: OnSelectType;
  children: ReactNode;
  className?: string;
}

export function Dropdown({
  id,
  defaultValue = null,
  onSelect,
  persistValue = false,
  children,
  className,
}: DropdownProps) {
  const createDropdown = useDropdown((state) => state.createDropdown);

  useEffect(() => {
    createDropdown({ id, defaultValue, onSelect, persistValue });
  }, [id, defaultValue, onSelect, createDropdown, persistValue]);

  return (
    <div className={twMerge("inline-block w-auto max-w-xs p-1", className)}>
      {children}
    </div>
  );
}
