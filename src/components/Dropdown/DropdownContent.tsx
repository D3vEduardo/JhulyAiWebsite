import { useDropdown } from "@store/dropdown";
import { AnimatePresence, motion } from "motion/react";
import { twMerge } from "tailwind-merge";

interface DropdownContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DropdownContent({
  id,
  children,
  className,
}: DropdownContentProps) {
  const dropdown = useDropdown((state) => state.dropdowns[id]);

  if (!dropdown) return null;

  return (
    <AnimatePresence>
      {dropdown.isOpen && (
        <motion.ul
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className={twMerge(
            `absolute z-50 mt-1 !w-auto !max-w-xs bg-peach/90
          backdrop-blur-md border-2 border-apricot rounded-2xl
          shadow-lg max-h-60 overflow-auto text-cocoa`,
            className,
          )}
          role="listbox"
          tabIndex={-1}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
