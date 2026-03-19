import Spinner from "./Spinner";

export default function SpinLoader({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-5">
      <Spinner />
      <div className="text-center">
        <p className="text-[16px] font-bold text-[#1e293b]">{title}</p>
        <p className="text-[13px] text-[#64748b] mt-1">
          Fetching your pack&hellip;
        </p>
      </div>
    </div>
  );
}
