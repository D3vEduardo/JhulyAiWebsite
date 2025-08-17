import { ReactNode } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  persistValue?: boolean;
}

interface DropdownStore {
  dropdowns: Record<string, DropdownState>;
  createDropdown: (
    id: string,
    defaultValue?: DropdownValue | null,
    onSelect?: (value: string, label: string) => void
  ) => void;
  selectValue: (
    id: string,
    value: string,
    label: string,
    icon?: ReactNode
  ) => void;
  updateSelectedValue: (id: string, selectedValue: DropdownValue) => void;
  toggleOpen: (id: string) => void;
  resetDropdown: (id: string) => void;
  removeDropdown: (id: string) => void;
}

export const useDropdown = create<DropdownStore>()(
  persist(
    (set, get) => ({
      dropdowns: {},

      createDropdown: (id, defaultValue = null, onSelect) => {
        set((state) => {
          const existing = state.dropdowns[id];
          let selectedValue = defaultValue;
          if (existing && existing.selectedValue && existing.persistValue) {
            selectedValue = existing.selectedValue;
          }
          return {
            dropdowns: {
              ...state.dropdowns,
              [id]: {
                id,
                isOpen: false,
                selectedValue,
                onSelect,
              },
            },
          };
        });
      },

      selectValue: (id, value, label, icon) => {
        const dropdown = get().dropdowns[id];
        const selectedValue: DropdownValue = { value, label };

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

      removeDropdown: (id) => {
        set((state) => {
          const rest = { ...state.dropdowns };
          delete rest[id];
          return { dropdowns: rest };
        });
      },
    }),
    {
      name: "dropdown-storage",
      partialize: (state) => ({
        dropdowns: Object.fromEntries(
          Object.entries(state.dropdowns).map(([id, dropdown]) =>
            dropdown.persistValue
              ? [
                  id,
                  {
                    ...dropdown,
                    isOpen: false,
                    onSelect: undefined,
                    icon: undefined,
                    selectedValue: dropdown.selectedValue
                      ? {
                          value: dropdown.selectedValue.value,
                          label: dropdown.selectedValue.label,
                        }
                      : null,
                  },
                ]
              : []
          )
        ),
      }),
      onRehydrateStorage: (state) => {
        if (state) {
          Object.keys(state.dropdowns).forEach((id) => {
            if (state.dropdowns[id]) {
              state.dropdowns[id].isOpen = false;
            }
          });
        }
      },
    }
  )
);
