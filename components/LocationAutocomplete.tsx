import { useLocationAutocomplete } from "@/lib/hooks";
import { PlacePrediction } from "@/lib/queries";
import clsx from "clsx";
import { UseFormRegisterReturn } from "react-hook-form";

const labelClass = "text-[13px] font-semibold text-[#334155] mb-2 block ml-1";
const inputClass =
  "w-full h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";

export default function LocationAutoComplete({
  onSelect,
  registration,
  error,
  required,
}: {
  onSelect: (loc: {
    locationName: string;
    latitude: number;
    longitude: number;
  }) => void;
  registration: UseFormRegisterReturn;
  error?: Error;
  required?: boolean;
}) {
  const {
    open,
    query,
    predictions,
    containerRef,
    isFetching,
    handleSelectLocation,
    handleSearchChange,
  } = useLocationAutocomplete();

  const handleSelect = (p: PlacePrediction) => {
    handleSelectLocation(p);
    registration.onChange({
      target: { value: p.description, name: registration.name },
    });
    onSelect({
      locationName: p.description,
      latitude: p.latitude,
      longitude: p.longitude,
    });
  };

  return (
    <div ref={containerRef}>
      <label className={labelClass}>
        Location {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search location…"
          value={query}
          className={clsx(`pl-10`, inputClass, {
            "border-red-400 focus:border-red-400 focus:ring-red-100": error!,
          })}
          name={registration.name}
          onBlur={registration.onBlur}
          onChange={(e) => {
            handleSearchChange(e);
            registration.onChange(e);
          }}
        />
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
          style={{ fontSize: 18 }}
        >
          {isFetching ? "progress_activity" : "location_on"}
        </span>

        {open && (
          <ul className="absolute z-20 top-full mt-1 w-full bg-white rounded-2xl border border-[rgba(226,207,183,0.4)] shadow-lg overflow-hidden">
            {predictions.map((p) => (
              <li key={p.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-4 py-3 text-[13px] text-[#1e293b] hover:bg-[rgba(225,207,183,0.2)] transition-colors flex items-center gap-2 border-b border-[rgba(226,207,183,0.2)] last:border-0"
                >
                  <span
                    className="material-symbols-outlined text-[#94a3b8] shrink-0"
                    style={{ fontSize: 16 }}
                  >
                    location_on
                  </span>
                  {p.description}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
