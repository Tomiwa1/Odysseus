"use client";

/* Client-side adapter for the central approved icon set.
   Phosphor components use React context, so they cannot be evaluated in a
   server component. Everything in the product imports icons from here;
   the icons themselves still come from the canonical Design Sorcery set. */
export * from "../icons";
