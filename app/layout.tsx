import type { Metadata } from "next";
import { Manrope, Gabarito } from "next/font/google";
import "./globals.css";

/* Manrope runs the interface; Gabarito carries the headlines. */
const ui = Manrope({ subsets: ["latin"], variable: "--font-ui", weight: ["400", "500", "600", "700", "800"] });
const gabarito = Gabarito({ subsets: ["latin"], variable: "--f-gabarito", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Odysseus",
  description: "The long search, handled.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${ui.variable} ${gabarito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
