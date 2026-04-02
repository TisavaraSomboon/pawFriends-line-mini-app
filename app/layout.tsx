import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import LiffProvider from "@/components/LiffProvider";

export const metadata: Metadata = {
  title: "PawFriends",
  description: "Every dog finds their pack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased">
        <LiffProvider>
          <QueryProvider>
            <ToastProvider>
              <ErrorBoundary>
                <div className="app-shell">
                  {children}
                </div>
              </ErrorBoundary>
            </ToastProvider>
          </QueryProvider>
        </LiffProvider>
      </body>
    </html>
  );
}
