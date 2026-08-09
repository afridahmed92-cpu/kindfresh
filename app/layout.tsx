import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fresh Kind | Real Fruit. Real Freshness.",
  description: "Explore Fresh Kind fruit beverages and distribution opportunities from Mangalore, Karnataka.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
