import { useRouter } from "next/navigation";

export default function NotFoundPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 items-center justify-center mt-40 bg-[#f7f7f6] px-6 text-center gap-5">
      <div className="w-24 h-24 rounded-full bg-[rgba(226,207,183,0.3)] flex items-center justify-center">
        <span
          className="material-symbols-outlined text-[#e2cfb7]"
          style={{ fontSize: 48 }}
        >
          person_off
        </span>
      </div>
      <div>
        <h2 className="text-[20px] font-bold text-[#1e293b]">{title}</h2>
        <p className="text-[13px] text-[#64748b] mt-1 max-w-xs">
          {description}
        </p>
      </div>
      <button
        onClick={() => router.replace("/")}
        className="bg-[rgba(226,207,183,0.2)] border border-[#e2cfb7] text-[#1e293b] font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[rgba(226,207,183,0.35)]"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          home
        </span>
        Go home
      </button>
    </div>
  );
}
