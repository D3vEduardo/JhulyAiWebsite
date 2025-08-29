import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ==== TYPE DEFINITIONS ====
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

// ==== PARAMETER INTERFACES ====
interface CreateDropdownParams {
  id: string;
  defaultValue?: DropdownValue | null;
  onSelect?: OnSelectType;
  persistValue?: boolean;
}

interface SelectValueParams extends DropdownValue {
  id: string;
}

interface UpdateSelectedValueParams {
  id: string;
  selectedValue: DropdownValue;
}

interface DropdownIdParam {
  id: string;
}

// ==== STORE INTERFACE ====
export interface DropdownStore {
  dropdowns: Record<string, DropdownState>;
  createDropdown: (params: CreateDropdownParams) => void;
  selectValue: (params: SelectValueParams) => void;
  updateSelectedValue: (params: UpdateSelectedValueParams) => void;
  toggleOpen: (params: DropdownIdParam) => void;
  resetDropdown: (params: DropdownIdParam) => void;
  removeDropdown: (params: DropdownIdParam) => void;
}

// ==== HELPER FUNCTIONS ====
/**
 * Creates a persistable dropdown state by removing functions and ensuring isOpen is false
 */
const createPersistableDropdownState = (
  dropdown: DropdownState,
): DropdownState => ({
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
});

// ==== STORE IMPLEMENTATION ====
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

          // Preserve existing selected value if it should be persisted
          if (existing?.selectedValue && existing.persistValue) {
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

        // Call the onSelect callback if it exists
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

        // Call the onSelect callback if it exists
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
          const { [id]: _, ...rest } = state.dropdowns;
          return { dropdowns: rest };
        });
      },
    }),
    {
      name: "dropdown-storage",

      /**
       * Only persist dropdowns that have persistValue set to true
       * Remove functions and ensure isOpen is false for persisted state
       */
      partialize: (state) => ({
        dropdowns: Object.fromEntries(
          Object.entries(state.dropdowns)
            .filter(([_id, dropdown]) => dropdown.persistValue)
            .map(([id, dropdown]) => [
              id,
              createPersistableDropdownState(dropdown),
            ]),
        ),
      }),

      /**
       * Ensure all dropdowns are closed when rehydrating from storage
       */
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
