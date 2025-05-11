"use client"
import { useState, ReactNode, useEffect } from "react";
import AsideContext from "./asideContext";

export default function AsideProvider({ children }: { children: ReactNode }) {
    const [asideIsOpen, setAsideIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setAsideIsOpen(innerWidth > 640)
    }, [])

    return (
        <AsideContext.Provider
            value={{ asideIsOpen, setAsideIsOpen }}
        >
            {children}
        </AsideContext.Provider>
    )
}