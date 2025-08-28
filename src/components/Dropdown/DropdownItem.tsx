import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { DropdownValue, useDropdown } from "@store/dropdown";

interface DropdownItemProps extends DropdownValue {
  children: React.ReactNode;
  id: string;
}

export function DropdownItem({ id, value, children, icon }: DropdownItemProps) {
  const selectValue = useDropdown((state) => state.selectValue);

  return (
    <li
      onClick={() =>
        selectValue({
          id,
          icon,
          value,
          label: children?.toString() || "",
        })
      }
      className="cursor-pointer px-4 py-2  w-auto"
      tabIndex={0}
    >
      <span className="flex items-center justify-start gap-x-1.5">
        {icon?.name && (
          <Icon icon={icon.name} width={icon.width} height={icon.height} />
        )}
        {children}
      </span>
    </li>
  );
}
