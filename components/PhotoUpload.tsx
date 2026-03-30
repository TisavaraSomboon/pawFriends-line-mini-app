import { useRef } from "react";
import Image from "next/image";

// Single-image mode (default)
interface SingleProps {
  multiple?: false;
  files?: never;
  onChange?: never;
  photoPreview?: string;
  onFileChange: (file: File) => void;
  onRemove: () => void;
}

// Multi-image mode
interface MultipleProps {
  multiple: true;
  files: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  photoPreview?: never;
  onFileChange?: never;
  onRemove?: never;
}

type PhotoUploadProps = SingleProps | MultipleProps;

export default function PhotoUpload(props: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Multi-image mode ── */
  if (props.multiple) {
    const { files, onChange } = props;
    const previews = files.map((f) =>
      typeof f === "string" ? f : URL.createObjectURL(f),
    );

    const MAX = 5;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (!selected.length) return;
      const merged = [...files, ...selected].slice(0, MAX);
      onChange(merged);
      e.target.value = "";
    };

    const handleRemove = (index: number) =>
      onChange(files.filter((_, i) => i !== index));

    const canAdd = files.length < MAX;

    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex gap-2 h-64">
          {/* Left: big cover slot */}
          {(() => {
            const src = previews[0];
            return src ? (
              <div className="relative flex-1 rounded-xl overflow-hidden border border-[rgba(226,207,183,0.4)] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Cover photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#e2cfb7] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span
                    className="material-symbols-outlined text-[#1e293b]"
                    style={{ fontSize: 10 }}
                  >
                    auto_awesome
                  </span>
                  <span className="text-[#1e293b] text-[9px] font-bold uppercase tracking-wider">
                    Cover
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(0)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: 13 }}
                  >
                    close
                  </span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-xl border-2 border-dashed border-[rgba(226,207,183,0.5)] bg-white flex flex-col items-center justify-center gap-2 group hover:bg-[rgba(226,207,183,0.08)] transition-all"
              >
                <span
                  className="material-symbols-outlined text-[rgba(226,207,183,0.7)] group-hover:text-[#e2cfb7] group-hover:scale-110 transition-all"
                  style={{ fontSize: 36 }}
                >
                  add_a_photo
                </span>
                <span className="text-[11px] font-semibold text-[#94a3b8] group-hover:text-[#64748b]">
                  Add cover photo
                </span>
              </button>
            );
          })()}

          {/* Right: 4 small slots */}
          <div className="flex flex-col gap-2 w-[42%]">
            {[1, 2, 3, 4].map((i) => {
              const src = previews[i];
              const slotCanAdd = canAdd && !!previews[i - 1]; // only enable if previous slot filled

              return src ? (
                <div
                  key={i}
                  className="relative flex-1 rounded-lg overflow-hidden border border-[rgba(226,207,183,0.4)] shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: 11 }}
                    >
                      close
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => slotCanAdd && fileInputRef.current?.click()}
                  disabled={!slotCanAdd}
                  className="flex-1 rounded-lg border-2 border-dashed border-[rgba(226,207,183,0.5)] bg-white flex items-center justify-center group transition-all hover:enabled:bg-[rgba(226,207,183,0.08)]"
                >
                  <span
                    className="material-symbols-outlined text-[rgba(226,207,183,0.6)] group-hover:text-[#e2cfb7] transition-colors"
                    style={{ fontSize: 16 }}
                  >
                    add
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-[#94a3b8] mt-1 px-0.5">
          {files.length}/{MAX} photos · First image used as cover
        </p>
      </>
    );
  }

  /* ── Single-image mode (default) ── */
  const { photoPreview, onFileChange, onRemove } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {photoPreview ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[rgba(226,207,183,0.4)] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={photoPreview}
            alt="Pet photo"
            className="w-full h-full object-cover"
            unoptimized={true}
            width={1098}
            height={1098}
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 16 }}
            >
              close
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-[rgba(226,207,183,0.5)] bg-white hover:bg-[rgba(226,207,183,0.08)] transition-all group"
        >
          <span
            className="material-symbols-outlined text-[rgba(226,207,183,0.8)] group-hover:text-[#e2cfb7] group-hover:scale-110 transition-all"
            style={{ fontSize: 44 }}
          >
            add_a_photo
          </span>
          <span className="text-[12px] font-semibold text-[#94a3b8] group-hover:text-[#64748b] mt-2 tracking-wide">
            Tap to upload a photo
          </span>
          <span className="text-[10px] text-[#b0bec5] mt-1">
            JPG, PNG up to 10MB
          </span>
        </button>
      )}
    </>
  );
}
