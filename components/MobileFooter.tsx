import Link from "next/link";

export default function Footer() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-[#f1f5f9] px-6 py-3 flex justify-between items-center z-20">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 text-[#e2cfb7]"
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Home
        </span>
      </Link>
      <Link
        href="/bookings"
        className="flex flex-col items-center gap-1 text-[#94a3b8]"
      >
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          bookings
        </span>
      </Link>
      <div className="relative -top-5">
        <Link
          href="/create-activity"
          className="bg-[#e2cfb7] text-[#1e293b] w-14 h-14 rounded-full shadow-lg border-4 border-[#f7f7f6] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[30px]">add</span>
        </Link>
      </div>
      <Link
        href="/chat"
        className="flex flex-col items-center gap-1 text-[#94a3b8]"
      >
        <span className="material-symbols-outlined">pets</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Chat
        </span>
      </Link>
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
