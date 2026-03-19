const SIZES = {
  sm: { ring: "w-5 h-5 border-2", inner: "inset-1", icon: "text-[10px]" },
  md: { ring: "w-16 h-16 border-4", inner: "inset-2", icon: "text-lg" },
};

export default function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const s = SIZES[size];
  return (
    <div className={`relative shrink-0 ${s.ring.split(" ").slice(0, 2).join(" ")}`}>
      <div className={`absolute inset-0 rounded-full ${s.ring.split(" ").slice(2).join(" ")} border-[rgba(226,207,183,0.2)]`} />
      <div className={`absolute inset-0 rounded-full ${s.ring.split(" ").slice(2).join(" ")} border-transparent border-t-[#e2cfb7] animate-spin`} />
      {size === "md" && (
        <div className={`absolute ${s.inner} rounded-full bg-[#e2cfb7]/20 flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-[#1e293b] ${s.icon}`}>pets</span>
        </div>
      )}
    </div>
  );
}
