"use client";

import Footer from "@/components/MobileFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#f7f7f6]">
      <div className="flex-1 overflow-auto pb-20">{children}</div>
      <Footer />
    </div>
  );
}
