import UserAvatar from "../UserAvatar";
import SelectModelMenu from "./SelectModelMenu";
import { ToggleAsideMenuButton } from "./ToggleAsideMenuButton";

export default function ChatNavBar() {
  return (
    <nav className="aboslute flex-col justify-center items-center w-full right-4 top-4">
      <div className="flex justify-between items-center">
        <SelectModelMenu />
        <ul className="flex gap-1.5 items-center justify-end w-full">
          <ToggleAsideMenuButton />
          <li className="flex items-center justify-center w-8 h-8">
            <UserAvatar />
          </li>
        </ul>
      </div>
      <div className="w-full h-0.5 rounded-2xl bg-almond/30 shadow-papaya shadow-lg mt-2" />
    </nav>
  );
}
