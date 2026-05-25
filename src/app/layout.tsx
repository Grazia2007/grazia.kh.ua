import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Оновлені метадані для Меблі Grazia
export const metadata: Metadata = {
  title: "Меблі Grazia — Харків",
  description: "Виробництво ексклюзивних корпусних меблів у Харкові. Кухні, шафи, гардеробні на замовлення. 18 років досвіду.",
  icons: {
    icon: '/favicon.ico', // Твій новий логотип
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}