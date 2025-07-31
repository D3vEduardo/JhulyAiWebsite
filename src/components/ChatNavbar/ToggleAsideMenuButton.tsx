"use client";

import { useAside } from "@store/asideMenu";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

export function ToggleAsideMenuButton() {
  const { toggleAside } = useAside();

  return (
    <li
      onClick={() => toggleAside()}
      className="flex items-center justify-center w-8 h-8"
    >
      <Icon icon="heroicons-solid:menu-alt-2" width="24" height="24" />
    </li>
  );
}
