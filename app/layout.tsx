import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialPilot AI — твій розумний простір для зростання",
  description: "Єдиний простір для планування, створення, публікації та розвитку всіх соціальних каналів.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
