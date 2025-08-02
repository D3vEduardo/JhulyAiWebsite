import { useDropdown } from "@store/dropdown";
import { ReactNode } from "react";

interface DropdownItemProps {
  id: string;
  value: string;
  children: React.ReactNode;
  icon?: ReactNode;
}

export function DropdownItem({ id, value, children, icon }: DropdownItemProps) {
  const selectValue = useDropdown((state) => state.selectValue);

  return (
    <li
      onClick={() => selectValue(id, value, String(children), icon)}
      className="cursor-pointer px-4 py-2  w-auto"
      tabIndex={0}
    >
      <span className="flex items-center justify-start gap-x-1.5">
        {icon}
        {children}
      </span>
    </li>
  );
}
