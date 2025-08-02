import { useDropdown } from "@store/dropdown";
import { twMerge } from "tailwind-merge";

interface DropdownTriggerProps {
  id: string;
  placeholder?: string;
  className?: string;
}

export function DropdownTrigger({
  id,
  placeholder,
  className,
}: DropdownTriggerProps) {
  const toggleOpen = useDropdown((state) => state.toggleOpen);
  const dropdown = useDropdown((state) => state.dropdowns[id]);

  return (
    <button
      onClick={() => toggleOpen(id)}
      className={twMerge(
        `w-auto max-w-xs text-left border-2 border-apricot bg-watermelon/60
      hover:bg-watermelon/80 transition-colors duration-200
      outline-none rounded-2xl px-4 py-2 shadow-sm text-cocoa
   focus:ring-papaya/30 cursor-pointer`,
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={dropdown?.isOpen}
      type="button"
    >
      <span className="flex items-center justify-start gap-x-1">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {dropdown?.selectedValue?.icon}
        </div>
        {dropdown?.selectedValue?.label ?? placeholder ?? "Selecione..."}
      </span>
    </button>
  );
}
