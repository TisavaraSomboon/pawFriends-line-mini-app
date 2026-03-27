"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMounted } from "@/lib/hooks";
import LayoutSkeleton from "@/components/skeletons/LayoutSkeleton";
import clsx from "clsx";
import { useProfile } from "@/lib/queries";
import Footer from "@/components/MobileFooter";
import { userProfile } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/", icon: "home", label: "Home" },
  {
    href: "/discovery",
    icon: "calendar_today",
    label: "Discovery",
    disabled: true,
  },
  { href: "/agents", icon: "pets", label: "Paw Chat", disabled: true },
  { href: "/profile", icon: "account_circle", label: "Profile" },
];

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const mounted = useMounted();

  const { data: userInfo } = useProfile();

  // Show skeleton until client has hydrated — prevents layout flash
  if (!mounted) return <LayoutSkeleton />;

  return (
    <div className="main-layout flex min-h-dvh bg-[#f7f7f6]">
      {/* ── Desktop: Left sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-[#ede8e0] bg-[#f7f7f6] px-4 py-6 overflow-hidden">
        {/* Logo — next/image caches + optimizes, no reload on navigation */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#e2cfb7] overflow-hidden relative">
            <Image
              src={userInfo?.user.image || userProfile}
              alt="PawFriends"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-[18px] font-extrabold text-[#1e293b]">
            PawFriends
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            if (link.disabled) {
              return (
                <div
                  key={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold text-[#cbd5e1] cursor-not-allowed select-none"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 22 }}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#94a3b8] px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-colors",
                  {
                    "bg-[#e2cfb7] text-[#1e293b]": active,
                    "text-[#475569] hover:bg-[#e2cfb7]/50 hover:text-[#1e293b]":
                      !active,
                  },
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Create activity button */}
        <Link
          href="/create-activity"
          className="flex items-center justify-center gap-2 bg-[#e2cfb7] hover:opacity-90 px-4 py-3 rounded-xl font-bold text-[14px] transition-opacity mt-4"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
          Create Activity
        </Link>
      </aside>
      <div className="flex w-full h-screen overflow-auto">{children}</div>
      <Footer />
    </div>
  );
}
