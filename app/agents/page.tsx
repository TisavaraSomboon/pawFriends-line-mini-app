"use client";
import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/MobileFooter";

const ACTIVE_AGENTS = [
  { name: "Max", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7", status: "Online" },
  { name: "Bella", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDILIU0mUpC0K-Z8R11GdSjk3LZLJJIQAQRVkmoCEaO5I-GtXbHvh6uNlTNZFFgfi5XCVvvfK0ZdsMJ8onVQ5zwx1-v94ztyjNUDsv6eqTq3z2QLybQSlhKXYB2qaAVez5JiJUhn3CDFqEqx43QtEI0nGJ6LWevTzI6lhx-mWC3hKDp4Fhk2vDKJq_2R-xwCRRzKl-JRi3mWtsbhhnRVxvAhJGievpKtCBMGIHuOqLwBkYeXDe_rk4IVDOBLnERG3QyzRV7Zg7SQgNv", status: "Online" },
  { name: "Charlie", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7", status: "Away" },
];

const DOGS = [
  { name: "Max", breed: "Golden Retriever", age: "3 yrs", online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7" },
  { name: "Buddy", breed: "Labrador", age: "2 yrs", online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDILIU0mUpC0K-Z8R11GdSjk3LZLJJIQAQRVkmoCEaO5I-GtXbHvh6uNlTNZFFgfi5XCVvvfK0ZdsMJ8onVQ5zwx1-v94ztyjNUDsv6eqTq3z2QLybQSlhKXYB2qaAVez5JiJUhn3CDFqEqx43QtEI0nGJ6LWevTzI6lhx-mWC3hKDp4Fhk2vDKJq_2R-xwCRRzKl-JRi3mWtsbhhnRVxvAhJGievpKtCBMGIHuOqLwBkYeXDe_rk4IVDOBLnERG3QyzRV7Zg7SQgNv" },
  { name: "Luna", breed: "Poodle Mix", age: "1 yr", online: false, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7" },
  { name: "Coco", breed: "Beagle", age: "4 yrs", online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDILIU0mUpC0K-Z8R11GdSjk3LZLJJIQAQRVkmoCEaO5I-GtXbHvh6uNlTNZFFgfi5XCVvvfK0ZdsMJ8onVQ5zwx1-v94ztyjNUDsv6eqTq3z2QLybQSlhKXYB2qaAVez5JiJUhn3CDFqEqx43QtEI0nGJ6LWevTzI6lhx-mWC3hKDp4Fhk2vDKJq_2R-xwCRRzKl-JRi3mWtsbhhnRVxvAhJGievpKtCBMGIHuOqLwBkYeXDe_rk4IVDOBLnERG3QyzRV7Zg7SQgNv" },
  { name: "Daisy", breed: "Shih Tzu", age: "5 yrs", online: false, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7" },
  { name: "Rocky", breed: "Bulldog", age: "2 yrs", online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDILIU0mUpC0K-Z8R11GdSjk3LZLJJIQAQRVkmoCEaO5I-GtXbHvh6uNlTNZFFgfi5XCVvvfK0ZdsMJ8onVQ5zwx1-v94ztyjNUDsv6eqTq3z2QLybQSlhKXYB2qaAVez5JiJUhn3CDFqEqx43QtEI0nGJ6LWevTzI6lhx-mWC3hKDp4Fhk2vDKJq_2R-xwCRRzKl-JRi3mWtsbhhnRVxvAhJGievpKtCBMGIHuOqLwBkYeXDe_rk4IVDOBLnERG3QyzRV7Zg7SQgNv" },
];

const FILTERS = ["All", "Online", "Nearby", "Small", "Medium", "Large"];

const NAV_LINKS = [
  { href: "/", icon: "home", label: "Home", active: false },
  { href: "/activities", icon: "calendar_today", label: "Activities", active: false },
  { href: "/agents", icon: "pets", label: "Paw Chat", active: true },
  { href: "/profile", icon: "account_circle", label: "Profile", active: false },
];

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = DOGS.filter((d) => {
    if (activeFilter === "Online" && !d.online) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex min-h-dvh bg-[#f7f7f6]">

      {/* ── Desktop: Left sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-[#ede8e0] bg-[#f7f7f6] px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#e2cfb7] overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsSKRt5tFy-1BdBd4c_QRh6ksE4CZDV0XfAuYzvyfEvfZwKt3ipjDz_96uK0F5JXnwzbli6DZCBn6ubCqtlyarVRtAsSfyBQzrkJUbDCzA4_R9rPAvq-HzHdpzQ8Xo2bCsR9JqsMxTHHikPqmmcpqxdxUE-Nw7uwmiYS6XZqyr-5vD5r0LSH6PAGrpNZ8-gaUl6lFCbIk3WFnSlQLaBTr3GJ9HSwidqH48VPhHSUt1HCGPB8sSyZYMYUkPufAwmJgT0Tjr5_5eudTZ"
              alt="Dog profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[18px] font-extrabold text-[#1e293b]">PawFriends</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-colors ${
                link.active
                  ? "bg-[#e2cfb7] text-[#1e293b]"
                  : "text-[#64748b] hover:bg-[rgba(226,207,183,0.2)] hover:text-[#1e293b]"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/create-activity"
          className="flex items-center justify-center gap-2 bg-[#1e293b] hover:opacity-90 text-white px-4 py-3 rounded-xl font-bold text-[14px] transition-opacity mt-4"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Create Activity
        </Link>
      </aside>

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[rgba(225,207,183,0.2)]">
          <div className="w-10 h-10" />
          <div className="text-center">
            <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">AI Playdates</h1>
            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Find a Match</p>
          </div>
          <button className="w-10 h-10 flex items-center justify-center">
            <span className="text-xl">🔔</span>
          </button>
        </div>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-[#ede8e0] sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md">
          <div>
            <h1 className="text-[20px] font-extrabold text-[#1e293b] tracking-tight">AI Playdates</h1>
            <p className="text-[13px] text-[#64748b]">Find the perfect match for your dog</p>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(226,207,183,0.2)] hover:bg-[rgba(226,207,183,0.4)] transition-colors">
            <span className="material-symbols-outlined text-[#1e293b]">notifications</span>
          </button>
        </header>

        {/* Content area */}
        <div className="flex flex-1 min-w-0">

          {/* Feed column */}
          <div className="flex-1 overflow-y-auto">

            {/* Active agents — mobile horizontal scroll */}
            <div className="md:hidden px-4 pt-4 pb-2">
              <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3">Active AI Agents</p>
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {ACTIVE_AGENTS.map((agent) => (
                  <Link key={agent.name} href="/chat" className="flex flex-col items-center gap-1.5 min-w-[64px]">
                    <div className="relative">
                      <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#e1cfb7]" />
                      <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#f7f7f6] ${agent.status === "Online" ? "bg-green-400" : "bg-amber-400"}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#1e293b]">{agent.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pt-2 pb-3 md:pt-4">
              <div className="flex items-center gap-2 h-11 rounded-[14px] bg-white border border-[#e2e8f0] px-3">
                <span className="material-symbols-outlined text-[#94a3b8]" style={{ fontSize: 18 }}>search</span>
                <input
                  type="text"
                  placeholder="Search dogs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 px-4 overflow-x-auto pb-3 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                    activeFilter === f
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : "bg-white text-[#64748b] border-[#e2e8f0]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Dog grid — 2 cols mobile / 3 cols desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4">
              {filtered.map((dog) => (
                <div key={dog.name} className="bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden shadow-sm">
                  <div className="relative">
                    <img src={dog.avatar} alt={dog.name} className="w-full h-36 object-cover" />
                    {dog.online && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-full px-2 py-0.5 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-[10px] font-bold text-[#1e293b]">Online</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[15px] font-bold text-[#1e293b]">{dog.name}</p>
                    <p className="text-[12px] text-[#64748b] mb-1">{dog.breed} · {dog.age}</p>
                    <Link
                      href="/chat"
                      className="mt-2 h-9 rounded-xl bg-[#e2cfb7] hover:opacity-90 transition-opacity flex items-center justify-center"
                    >
                      <span className="text-[12px] font-bold text-[#1e293b]">Chat with {dog.name}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── Desktop: Right panel — Active Agents ── */}
          <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 border-l border-[#ede8e0] px-4 py-6">
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-4">Active AI Agents</p>
            <div className="flex flex-col gap-3">
              {ACTIVE_AGENTS.map((agent) => (
                <Link
                  key={agent.name}
                  href="/chat"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(226,207,183,0.15)] transition-colors"
                >
                  <div className="relative shrink-0">
                    <img src={agent.avatar} alt={agent.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#e1cfb7]" />
                    <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#f7f7f6] ${agent.status === "Online" ? "bg-green-400" : "bg-amber-400"}`} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1e293b]">{agent.name}</p>
                    <p className={`text-[12px] font-medium ${agent.status === "Online" ? "text-green-500" : "text-amber-500"}`}>
                      {agent.status}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#94a3b8] ml-auto" style={{ fontSize: 18 }}>chat</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#ede8e0]">
              <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3">Quick Stats</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#64748b]">Online now</span>
                  <span className="font-bold text-[#1e293b]">{DOGS.filter((d) => d.online).length} dogs</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#64748b]">Total matches</span>
                  <span className="font-bold text-[#1e293b]">{DOGS.length} dogs</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}
