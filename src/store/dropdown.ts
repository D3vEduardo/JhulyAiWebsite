import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnSelectType = (p: {
  value: string;
  label: string;
  icon: DropdownItemIcon;
}) => void;

export interface DropdownItemIcon {
  width: number | string;
  height: number | string;
  name: string | IconifyIcon;
}

export interface DropdownValue {
  value: string;
  label: string;
  icon: DropdownItemIcon;
}

export interface DropdownState {
  id: string;
  isOpen: boolean;
  selectedValue: DropdownValue | null;
  onSelect?: OnSelectType;
  persistValue?: boolean;
}

export interface DropdownStore {
  dropdowns: Record<string, DropdownState>;
  createDropdown: (p: {
    id: string;
    defaultValue?: DropdownValue | null;
    onSelect?: OnSelectType;
    persistValue: boolean;
  }) => void;
  selectValue: (
    p: {
      id: string;
    } & DropdownValue,
  ) => void;
  updateSelectedValue: (p: {
    id: string;
    selectedValue: DropdownValue;
  }) => void;
  toggleOpen: (p: { id: string }) => void;
  resetDropdown: (p: { id: string }) => void;
  removeDropdown: (p: { id: string }) => void;
}

export const useDropdown = create<DropdownStore>()(
  persist(
    (set, get) => ({
      dropdowns: {},

      createDropdown: ({
        id,
        defaultValue = null,
        onSelect,
        persistValue = false,
      }) => {
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
                persistValue,
              },
            },
          };
        });
      },

      selectValue: ({ id, value, label, icon }) => {
        const dropdown = get().dropdowns[id];
        const selectedValue: DropdownValue = { value, label, icon };

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

        dropdown?.onSelect?.({ value, label, icon });
      },

      updateSelectedValue: ({ id, selectedValue }) => {
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

        dropdown?.onSelect?.({
          value: selectedValue.value,
          label: selectedValue.label,
          icon: selectedValue.icon,
        });
      },

      toggleOpen: ({ id }) => {
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

      resetDropdown: ({ id }) => {
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

      removeDropdown: ({ id }) => {
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
                    selectedValue: dropdown.selectedValue
                      ? {
                          value: dropdown.selectedValue.value,
                          label: dropdown.selectedValue.label,
                          icon: dropdown.selectedValue.icon,
                        }
                      : null,
                  },
                ]
              : [],
          ),
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
    },
  ),
);
