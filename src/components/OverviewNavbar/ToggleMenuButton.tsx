"use client";

import { Icon, loadIcons } from "@iconify-icon/react/dist/iconify.mjs";
import { useNavbarMenuContext } from "./NavbarMenuContext";
import { useEffect } from "react";

export function ToggleMenuButton() {
  const { menuIsOpen, setMenuIsOpen } = useNavbarMenuContext();

  useEffect(() => {
    loadIcons([
      "line-md:menu-to-close-alt-transition",
      "line-md:close-to-menu-transition",
    ]);
  }, []);

  // useEffect(() => {
  //   if (innerWidth < 769) {
  //     setMenuIsOpen(false);
  //   }
  // }, [innerWidth]);

  return (
    <button
      type="button"
      onClick={() => setMenuIsOpen(!menuIsOpen)}
      className="bg-transparent custom-cursor-hover p-0
      flex items-center justify-center"
    >
      {menuIsOpen ? (
        <Icon
          icon="line-md:menu-to-close-alt-transition"
          width="24"
          height="24"
        />
      ) : (
        <Icon icon="line-md:close-to-menu-transition" width="24" height="24" />
      )}
    </button>
  );
}
