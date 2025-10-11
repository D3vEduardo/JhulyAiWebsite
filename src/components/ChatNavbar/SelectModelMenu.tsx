import { DropdownValue } from "@/store/dropdown";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@components/Dropdown/index";

const options: DropdownValue[] = [
  {
    value: "HIGH",
    label: "High",
    icon: { name: "solar:rocket-bold-duotone", width: "20", height: "20" },
  },
  {
    value: "BASIC",
    label: "Basic",
    icon: {
      height: 20,
      width: 20,
      name: "ph:gear-duotone",
    },
  },
  {
    value: "LITE",
    label: "Lite",
    icon: { name: "pepicons-print:leaf", width: "20", height: "20" },
  },
];

export default function SelectModelMenu() {
  const handleSelect = (p: { value: string; label: string }) => {
    console.debug("[src/components/ChatNavbar/SelectModelMenu.tsx:SelectModelMenu]", "Selecionou:", p.value, p.label);
  };

  return (
    <Dropdown
      id="modelDropdown"
      defaultValue={options[1]}
      onSelect={handleSelect}
      persistValue
    >
      <DropdownTrigger
        className="scale-[0.9]"
        placeholder="Escolha um modelo"
        id="modelDropdown"
      />
      <DropdownContent id="modelDropdown" className="scale-[0.9]">
        {options.map(({ value, label, icon }) => (
          <DropdownItem
            key={value}
            id="modelDropdown"
            value={value}
            icon={icon}
            label={label}
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
