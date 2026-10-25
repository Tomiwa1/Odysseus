"use client";

import { IconContext } from "../icons";

/* One weight and size for every icon in the product, set once.
   Phosphor's bold weight keeps rounded caps — thicker and rounder, not sharper. */
export default function IconDefaults({ children }: { children: React.ReactNode }) {
  return <IconContext.Provider value={{ weight: "bold", size: 18 }}>{children}</IconContext.Provider>;
}
