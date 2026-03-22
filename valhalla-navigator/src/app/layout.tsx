import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBI Case Navigator — Valhalla Health",
  description: "Answer 9 questions. Get a complete clinical pathway tailored to your case.",
  openGraph: {
    title: "TBI Case Navigator — Valhalla Health",
    description: "Find out exactly what your TBI case needs. Free clinical pathway tool.",
    siteName: "Valhalla Health",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
