import { ReactNode } from "react";
import { create } from "zustand";

interface DropdownValue {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface DropdownState {
  id: string;
  isOpen: boolean;
  selectedValue: DropdownValue | null;
  onSelect?: (value: string, label: string) => void;
}

interface DropdownStore {
  dropdowns: Record<string, DropdownState>;
  createDropdown: (
    id: string,
    defaultValue?: DropdownValue | null,
    onSelect?: (value: string, label: string) => void,
  ) => void;
  selectValue: (
    id: string,
    value: string,
    label: string,
    icon?: ReactNode,
  ) => void;
  updateSelectedValue: (id: string, selectedValue: DropdownValue) => void;
  toggleOpen: (id: string) => void;
  resetDropdown: (id: string) => void;
  removeDropdown: (id: string) => void;
}

export const useDropdown = create<DropdownStore>((set, get) => ({
  dropdowns: {},

  createDropdown: (id, defaultValue = null, onSelect) => {
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [id]: {
          id,
          isOpen: false,
          selectedValue: defaultValue,
          onSelect,
        },
      },
    }));
  },

  // ATUALIZADA: Agora aceita ícone como parâmetro opcional
  selectValue: (id, value, label, icon) => {
    const dropdown = get().dropdowns[id];
    const selectedValue: DropdownValue = { value, label };

    // Adiciona o ícone apenas se fornecido
    if (icon !== undefined) {
      selectedValue.icon = icon;
    }

    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [id]: {
          ...dropdown,
          selectedValue,
          isOpen: false,
        },
      },
    }));

    dropdown?.onSelect?.(value, label);
  },

  // NOVA: Função para atualizar com objeto completo (mais flexível)
  updateSelectedValue: (id, selectedValue) => {
    const dropdown = get().dropdowns[id];

    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [id]: {
          ...dropdown,
          selectedValue,
          isOpen: false,
        },
      },
    }));

    dropdown?.onSelect?.(selectedValue.value, selectedValue.label);
  },

  toggleOpen: (id) => {
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [id]: {
          ...state.dropdowns[id],
          isOpen: !state.dropdowns[id]?.isOpen,
        },
      },
    }));
  },

  resetDropdown: (id) => {
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [id]: {
          ...state.dropdowns[id],
          selectedValue: null,
          isOpen: false,
        },
      },
    }));
  },

  removeDropdown: () => {
    set((state) => {
      const { ...rest } = state.dropdowns;
      return { dropdowns: rest };
    });
  },
}));
