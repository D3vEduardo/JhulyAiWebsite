import { useDropdown } from "@/store/dropdown";
import { ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface DropdownProps {
  id: string;
  defaultValue?: { value: string; label: string } | null;
  onSelect?: (value: string, label: string) => void;
  children: ReactNode;
  className?: string;
}

export function Dropdown({
  id,
  defaultValue = null,
  onSelect,
  children,
  className,
}: DropdownProps) {
  const createDropdown = useDropdown((state) => state.createDropdown);

  useEffect(() => {
    createDropdown(id, defaultValue, onSelect);
  }, [id, defaultValue, onSelect, createDropdown]);

  return (
    <div className={twMerge("inline-block w-full max-w-xs p-1", className)}>
      {children}
    </div>
  );
}
