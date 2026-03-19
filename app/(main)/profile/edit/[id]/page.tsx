"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { clsx } from "clsx";
import {
  PetEnergyLevel,
  PetSizeCategory,
  usePetProfile,
  useUpdatePetProfile,
} from "@/lib/queries";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import SpinLoader from "@/components/SpinLoader";

/* ── Types ── */
type PetEditFormValues = {
  name: string;
  weight: string;
  size: PetSizeCategory;
  bio: string;
  locationName: string;
  latitude: number;
  longitude: number;
  energyLevel: PetEnergyLevel;
  emotions: string[];
  socialStyle: string;
  behaviorTraits: string[];
  goodWith: string[];
};

/* ── Constants ── */
const ENERGY_LEVELS: { value: PetEnergyLevel; label: string; icon: string }[] =
  [
    { value: PetEnergyLevel.Low, label: "Low", icon: "bedtime" },
    { value: PetEnergyLevel.Medium, label: "Medium", icon: "directions_walk" },
    { value: PetEnergyLevel.High, label: "High", icon: "directions_run" },
    { value: PetEnergyLevel.VeryHigh, label: "Very High", icon: "bolt" },
  ];

const EMOTION_OPTIONS = [
  "Happy",
  "Playful",
  "Relaxed",
  "Curious",
  "Affectionate",
  "Calm",
  "Excited",
  "Gentle",
  "Sad",
  "Anxious",
  "Nervous",
  "Aggressive",
  "Fearful",
  "Stubborn",
  "Timid",
];

const BEHAVIOR_OPTIONS = [
  "Curious",
  "Calm",
  "Confident",
  "Sociable",
  "Loyal",
  "Protective",
  "Gentle",
  "Playful",
  "Independent",
  "Obedient",
  "Energetic",
  "Nervous",
  "Timid",
  "Stubborn",
  "Vocal",
];

const GOOD_WITH_OPTIONS = [
  "Kids",
  "Adults",
  "Seniors",
  "Other Dogs",
  "Cats",
  "Small Animals",
  "Small Spaces",
  "Large Spaces",
  "Strangers",
  "Crowds",
];

const SIZE_LABELS: Record<PetSizeCategory, string> = {
  XS: "Extra Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Extra Large",
};

const inputClass =
  "w-full h-12 px-4 rounded-xl border bg-white text-[#1e293b] text-[14px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 transition";
const inputValid =
  "border-[rgba(226,207,183,0.5)] focus:border-[#e2cfb7] focus:ring-[rgba(226,207,183,0.3)]";
const inputError = "border-red-400 focus:border-red-400 focus:ring-red-100";

/* ── Sub-components ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
      {children}
    </h3>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p className="text-[13px] font-semibold text-[#475569] mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-500 mt-1 ml-0.5">{message}</p>;
}

/* ── Tag selector ── */
function TagSelector({
  options,
  value,
  onChange,
  max = 15,
  placeholder = "Search…",
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(
    (o) => o.toLowerCase().includes(search.toLowerCase()) && !value.includes(o),
  );

  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((v) => v !== tag));
    } else if (value.length < max) {
      onChange([...value, tag]);
      setSearch("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e2cfb7] text-[#1e293b] text-[12px] font-semibold transition-all hover:brightness-95"
            >
              {tag}
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 13 }}
              >
                close
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      {value.length < max && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className={clsx(inputClass, "h-10 text-[13px]", inputValid)}
          />
          <span
            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
            style={{ fontSize: 16 }}
          >
            search
          </span>
        </div>
      )}

      {/* Dropdown options */}
      {search && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="px-2.5 py-1 rounded-full border border-[rgba(226,207,183,0.5)] text-[#64748b] text-[12px] font-medium hover:border-[#e2cfb7] hover:bg-[rgba(226,207,183,0.15)] transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#94a3b8] px-0.5">
        {value.length}/{max} selected
      </p>
    </div>
  );
}

/* ── Page ── */
export default function EditPetProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const petId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: pet, isPending: isLoading } = usePetProfile(petId);
  const { mutate: updatePet, isPending: isSaving } = useUpdatePetProfile(petId);

  const photoPreview = photo
    ? URL.createObjectURL(photo)
    : (pet?.image ?? null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<PetEditFormValues>({
    mode: "onBlur",
    defaultValues: {
      size: "MD",
      energyLevel: PetEnergyLevel.Medium,
      emotions: [],
      behaviorTraits: [],
      goodWith: [],
      socialStyle: "",
    },
  });

  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name ?? "",
        weight: pet.weight ? String(pet.weight) : "",
        size: (pet.size as PetSizeCategory) ?? "MD",
        bio: pet.bio ?? "",
        energyLevel: pet.energyLevel ?? PetEnergyLevel.Medium,
        emotions: pet.emotions ?? [],
        socialStyle: pet.socialStyle ?? "",
        behaviorTraits: pet.behaviorTraits ?? [],
        goodWith: pet.goodWith ?? [],
      });
    }
  }, [pet, reset]);

  const nameValue = useWatch({ name: "name", control, defaultValue: "" });

  const onSubmit = (data: PetEditFormValues) => {
    updatePet(
      {
        ...data,
        weight: Number(data.weight),
        image: photo ?? pet?.image ?? "",
      },
      {
        onSuccess: () => {
          toast("Pet profile updated!", "success");
          router.back();
        },
        onError: (err) => toast(err.message || "Failed to save.", "error"),
      },
    );
  };

  if (isLoading) <SpinLoader title="Profile loading" />;

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center px-4 py-3 border-b border-[rgba(226,207,183,0.2)] gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[#1e293b] tracking-tight pr-10">
          Edit Pet Profile
        </h1>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">
          {/* ── Photo ── */}
          <div className="flex flex-col gap-2">
            <SectionTitle>Pet Photo</SectionTitle>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(f);
              }}
            />
            {photoPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[rgba(226,207,183,0.4)] shadow-sm">
                <Image
                  src={photoPreview}
                  alt="Pet photo"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
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
                <span className="text-[12px] font-semibold text-[#94a3b8] mt-2">
                  Tap to change photo
                </span>
              </button>
            )}
          </div>

          {/* ── Basic Info ── */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Basic Info</SectionTitle>

            {/* Name */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <FieldLabel required>Pet Name</FieldLabel>
                <span
                  className={clsx(
                    "text-[11px] font-semibold",
                    (nameValue?.length ?? 0) >= 25
                      ? "text-red-400"
                      : "text-[#94a3b8]",
                  )}
                >
                  {nameValue?.length ?? 0}/25
                </span>
              </div>
              <input
                placeholder="What's your pet's name?"
                maxLength={25}
                {...register("name", {
                  required: "Pet name is required.",
                  maxLength: { value: 25, message: "Max 25 characters." },
                })}
                className={clsx(
                  inputClass,
                  errors.name ? inputError : inputValid,
                )}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Weight & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Weight (kg)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  {...register("weight", {
                    min: { value: 0.1, message: "Must be > 0" },
                    max: { value: 200, message: "Must be < 200" },
                  })}
                  className={clsx(
                    inputClass,
                    errors.weight ? inputError : inputValid,
                  )}
                />
                <FieldError message={errors.weight?.message} />
              </div>
              <div>
                <FieldLabel>Size</FieldLabel>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-1.5">
                      {(Object.keys(SIZE_LABELS) as PetSizeCategory[]).map(
                        (s) => (
                          <button
                            key={s}
                            type="button"
                            title={SIZE_LABELS[s]}
                            onClick={() => field.onChange(s)}
                            className={clsx(
                              "flex-1 h-12 rounded-xl font-bold text-[12px] border transition-all",
                              field.value === s
                                ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                                : "bg-white border-[rgba(226,207,183,0.4)] text-[#64748b] hover:border-[#e2cfb7]",
                            )}
                          >
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <LocationAutoComplete
                onSelect={(loc) => {
                  setValue("locationName", loc.locationName);
                  setValue("latitude", loc.latitude);
                  setValue("longitude", loc.longitude);
                }}
                registration={register("locationName")}
              />
            </div>

            {/* Bio */}
            <div>
              <FieldLabel>About Your Pet</FieldLabel>
              <textarea
                rows={3}
                placeholder="Tell the pack about your pet's personality…"
                {...register("bio", {
                  maxLength: { value: 300, message: "Max 300 characters." },
                })}
                className={clsx(
                  "w-full px-4 py-3 rounded-xl border bg-white text-[#1e293b] text-[14px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 transition resize-none leading-relaxed",
                  errors.bio ? inputError : inputValid,
                )}
              />
              <FieldError message={errors.bio?.message} />
            </div>
          </div>

          {/* ── Personality ── */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Personality</SectionTitle>

            {/* Energy Level */}
            <div>
              <FieldLabel>Energy Level</FieldLabel>
              <Controller
                name="energyLevel"
                control={control}
                render={({ field }) => {
                  const currentIdx = ENERGY_LEVELS.findIndex(
                    (e) => e.value === field.value,
                  );
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {ENERGY_LEVELS.map((level, i) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => field.onChange(level.value)}
                            className={clsx(
                              "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
                              i <= currentIdx
                                ? "border-[#e2cfb7] bg-[rgba(226,207,183,0.2)] text-[#1e293b]"
                                : "border-[rgba(226,207,183,0.3)] bg-white text-[#94a3b8]",
                            )}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 20 }}
                            >
                              {level.icon}
                            </span>
                            <span className="text-[10px] font-bold">
                              {level.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full bg-[rgba(226,207,183,0.3)] overflow-hidden">
                        <div
                          className="h-full bg-[#e2cfb7] rounded-full transition-all"
                          style={{
                            width: `${((currentIdx + 1) / ENERGY_LEVELS.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Emotional Profile */}
            <div>
              <FieldLabel>Emotional Profile</FieldLabel>
              <Controller
                name="emotions"
                control={control}
                render={({ field }) => (
                  <TagSelector
                    options={EMOTION_OPTIONS}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    max={15}
                    placeholder="Search emotions…"
                  />
                )}
              />
            </div>

            {/* Social Behavior */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <FieldLabel>Social Behavior</FieldLabel>
                <Controller
                  name="socialStyle"
                  control={control}
                  render={({ field }) => (
                    <span
                      className={clsx(
                        "text-[11px] font-semibold",
                        (field.value?.length ?? 0) >= 250
                          ? "text-red-400"
                          : "text-[#94a3b8]",
                      )}
                    >
                      {field.value?.length ?? 0}/250
                    </span>
                  )}
                />
              </div>
              <textarea
                rows={3}
                placeholder="Describe how your pet interacts with others…"
                {...register("socialStyle", {
                  maxLength: { value: 250, message: "Max 250 characters." },
                })}
                className={clsx(
                  "w-full px-4 py-3 rounded-xl border bg-white text-[#1e293b] text-[14px] font-medium placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 transition resize-none leading-relaxed",
                  errors.socialStyle ? inputError : inputValid,
                )}
              />
              <FieldError message={errors.socialStyle?.message} />
            </div>

            {/* Key Behaviors */}
            <div>
              <FieldLabel>Key Behaviors</FieldLabel>
              <Controller
                name="behaviorTraits"
                control={control}
                render={({ field }) => (
                  <TagSelector
                    options={BEHAVIOR_OPTIONS}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    max={15}
                    placeholder="Search behaviors…"
                  />
                )}
              />
            </div>

            {/* Good With */}
            <div>
              <FieldLabel>Good With</FieldLabel>
              <Controller
                name="goodWith"
                control={control}
                render={({ field }) => (
                  <TagSelector
                    options={GOOD_WITH_OPTIONS}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    max={15}
                    placeholder="Search…"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </form>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#f7f7f6]/90 backdrop-blur-md border-t border-[rgba(226,207,183,0.2)] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || (!isDirty && photo === null)}
            className="w-full bg-[#e2cfb7] hover:brightness-95 disabled:bg-[#cbd5e1] text-[#1e293b] disabled:text-[#94a3b8] font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
