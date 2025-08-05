import { createContext, ReactNode, useContext, useState } from "react";

interface iNavbarMenuContext {
  menuIsOpen: boolean;
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarMenuContext = createContext<iNavbarMenuContext>({
  menuIsOpen: false,
  setMenuIsOpen: () => {},
});

export const useNavbarMenuContext = () => {
  const context = useContext(NavbarMenuContext);
  if (context === undefined) {
    throw new Error(
      "useNavbarMenuContext must be used within a NavbarMenuProvider",
    );
  }
  return context;
};

export const NavbarMenuContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <NavbarMenuContext.Provider value={{ menuIsOpen, setMenuIsOpen }}>
      {children}
    </NavbarMenuContext.Provider>
  );
};
