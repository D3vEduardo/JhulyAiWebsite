"use client";
import { Icon } from "@iconify-icon/react";
import UserAvatar from "./UserAvatar";
import { useAside } from "@store/asideMenu";

export default function ChatNavBar() {
console.log("Renderizei ChatNavbar");
  const { toggleAside } = useAside();

  return (
    <nav
      className="aboslute flex justify-between items-center w-full right-4 top-4"
    >
      <ul
        className="flex gap-1.5 items-center justify-end w-full"
      >
        <li
          onClick={() => toggleAside()}
          className="flex items-center justify-center w-8 h-8"
        >
          <Icon icon="heroicons-solid:menu-alt-2" width="24" height="24" />
        </li>
        <li
          className="flex items-center justify-center w-8 h-8"
        >
          <UserAvatar />
        </li>
      </ul>
    </nav>
  );
}
