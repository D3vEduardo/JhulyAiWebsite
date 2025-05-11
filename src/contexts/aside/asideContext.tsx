import { createContext, Dispatch, SetStateAction } from "react";

const AsideContext = createContext<{
    asideIsOpen: boolean;
    setAsideIsOpen?: Dispatch<SetStateAction<boolean>>;
}>({
    asideIsOpen: false
});

export default AsideContext;