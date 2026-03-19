import Link from "next/link";

export default function Footer() {
  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-[#f1f5f9] px-6 py-3 flex justify-between items-center z-20">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 text-[#e2cfb7]"
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Home
        </span>
      </Link>
      <div className="flex flex-col items-center gap-1 text-[#cbd5e1] cursor-not-allowed select-none relative">
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Discovery
        </span>
        <span className="absolute -top-1 -right-2 text-[8px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#94a3b8] px-1.5 py-0.5 rounded-full leading-none">
          Soon
        </span>
      </div>
      {/* <Link
        href="/discovery"
        className="flex flex-col items-center gap-1 text-[#94a3b8]"
      >
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Discovery
        </span>
      </Link> */}
      <div className="relative -top-5">
        <Link
          href="/create-activity"
          className="bg-[#e2cfb7] text-[#1e293b] w-14 h-14 rounded-full shadow-lg border-4 border-[#f7f7f6] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[30px]">add</span>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#cbd5e1] cursor-not-allowed select-none relative">
        <span className="material-symbols-outlined">pets</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Chat
        </span>
        <span className="absolute -top-1 -right-2 text-[8px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#94a3b8] px-1.5 py-0.5 rounded-full leading-none">
          Soon
        </span>
      </div>
      <Link
        href="/profile"
        className="flex flex-col items-center gap-1 text-[#94a3b8]"
      >
        <span className="material-symbols-outlined">account_circle</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Profile
        </span>
      </Link>
    </nav>
  );
}
