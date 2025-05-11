"use client"

import { useContext } from "react";
import AsideContext from "./asideContext";

export default function useAside() {
    const ctx = useContext(AsideContext);

    return ctx;
}