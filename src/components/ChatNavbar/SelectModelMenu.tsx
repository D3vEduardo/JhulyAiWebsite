import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@components/Dropdown/index";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

const options = [
  {
    value: "HIGH",
    label: "High - deepseek-r1-0528",
    icon: <Icon icon="solar:rocket-bold-duotone" width="24" height="24" />,
  },
  {
    value: "BASIC",
    label: "Basic - deepseek-chat-v3-0324",
    icon: <Icon icon="ph:gear-duotone" width="20" height="20" />,
  },
  {
    value: "LITE",
    label: "Lite - qwen/qwen3-coder",
    icon: <Icon icon="pepicons-print:leaf" width="20" height="20" />,
  },
];

export default function SelectModelMenu() {
  const handleSelect = (value: string, label: string) => {
    console.log("Selecionou:", value, label);
  };

  return (
    <Dropdown
      id="modelDropdown"
      defaultValue={options[1]}
      onSelect={handleSelect}
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
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
