import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ConvexClientProvider } from "@/components/convex-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TP Extractor - Luxembourg Transfer Pricing Analysis",
  description:
    "Extract financial data from Luxembourg annual accounts and identify transfer pricing opportunities",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-slate-950`}
      >
        <ConvexClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
