"use client";
import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { clsx } from "clsx";
import Link from "next/link";
import Footer from "@/components/MobileFooter";
import Image from "next/image";
import {
  Pet,
  PetEnergyLevel,
  PetSizeCategory,
  useCreateActivity,
  useProfile,
} from "@/lib/queries";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import SpinLoader from "@/components/SpinLoader";
import PhotoUpload from "@/components/PhotoUpload";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import BusinessDateSlotPicker, {
  WeekdaySlots,
} from "@/components/BusinessDateSlotPicker";

/* ── Types ── */
type HostType = "personal" | "business";
type ScheduleMode = "dateRange" | "scheduler";

/* ── Constants ── */
const PERSONAL_ACTIVITY_TYPES = [
  { id: "park", icon: "🌳", label: "Park Run" },
  { id: "love", icon: "💕", label: "Love" },
  { id: "training", icon: "🎓", label: "Training" },
  { id: "sport", icon: "🏊", label: "Sport" },
  { id: "travel", icon: "🥾", label: "Travel" },
  { id: "custom", icon: "✏️", label: "Custom" },
];

const BUSINESS_ACTIVITY_TYPES = [
  { id: "grooming", icon: "✂️", label: "Grooming" },
  { id: "hotel", icon: "🏨", label: "Hotel & Daycare" },
  { id: "sport", icon: "🏊", label: "Sport" },
  { id: "travel", icon: "🥾", label: "Travel" },
  { id: "place", icon: "🌿", label: "Place" },
  { id: "custom", icon: "✏️", label: "Custom" },
];

const SIZE_OPTIONS: PetSizeCategory[] = ["XS", "SM", "MD", "LG", "XL"];

const ACTIVITY_TAGS: Record<string, string[]> = {
  park: [
    "🌿 Chilling",
    "🌳 Park",
    "✈️ Travel",
    "🎡 Amusement Park",
    "🛍️ Shopping",
    "🛕 Temple",
    "🌙 Night Market",
    "🎬 Movie",
    "🏃 Running",
    "📖 Reading",
    "🎵 Concert",
    "🚶 Walking",
    "🤝 Volunteer",
    "⚽ Sport",
    "🧘 Yoga",
    "🔥 BBQ",
    "🍕 Pizza",
    "🥗 Vegan",
    "🍣 Buffet",
    "🍜 Ramen",
  ],
  love: ["✈️ Travel", "☕ Meetup", "🌳 Park", "🏠 Home", "🏢 Condo"],
  training: [
    "✈️ Travel",
    "🌳 Park",
    "🏠 Home",
    "🏢 Condo",
    "⚽ Sport",
    "🤝 Volunteer",
    "🌲 Forest",
  ],
  sport: [
    "🏃 Running",
    "🚶 Walking",
    "⚽ Football",
    "🏊 Swimming",
    "🧘 Yoga",
    "🥾 Hiking",
    "🛝 Playground",
    "⚽ Sport",
  ],
  travel: ["🏖️ Beach", "🏔️ Mountain", "🌲 Forest", "🌳 Park"],
  grooming: [
    "🛁 Bath",
    "✂️ Haircare",
    "💅 Nail",
    "💄 Makeup",
    "👗 Dress Up",
    "🧹 Cleaning",
    "🩺 Anal Glands",
  ],
  hotel: ["✈️ Travel", "🛏️ Bed", "🏠 Home", "🏢 Condo"],
  place: [
    "⛳ Artificial Turf",
    "🌿 Grass Field",
    "🛝 Playground",
    "🏠 Home",
    "🏢 Condo",
    "🌳 Park",
    "🏖️ Beach",
    "🏟️ Indoor Park",
  ],
  custom: [],
};

const labelClass = "text-[13px] font-semibold text-[#334155] mb-2 block ml-1";
const inputClass =
  "w-full h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";

type ActivityForm = {
  image: File | string;
  title: string;
  type: string;
  customType: string;
  hostType: HostType;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  sizes: PetSizeCategory[];
  amountOfAttendees: number;
  dogLimit: number;
  startDate: string;
  endDate: string;
  description: string;
  autoEnd: boolean;
  petRequirements: string[];
  lovePetId: string;
  tags: string[];
};

/** Format a Date as "YYYY-MM-DDTHH:mm" for datetime-local inputs */
function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function buildLovePetRequirements(pet: Pet): string[] {
  const genetic: string[] = [];
  genetic.push("Must not be sterilized");
  genetic.push("Vaccine up to date");
  genetic.push("Flea & Tick protected");
  if (pet.breed) genetic.push(`Breed: ${pet.breed} or compatible`);
  if (pet.size) genetic.push(`Size: ${pet.size}`);
  if (pet.ageGroup) genetic.push(`Age group: ${pet.ageGroup}`);
  if (pet.microchipVerified) genetic.push("Microchip verified preferred");

  const personality: string[] = [];
  if (pet.energyLevel !== undefined) {
    const energyMap: Record<number, string> = {
      [PetEnergyLevel.Low]: "Calm & gentle energy",
      [PetEnergyLevel.Medium]: "Balanced energy level",
      [PetEnergyLevel.High]: "Active & playful energy",
      [PetEnergyLevel.VeryHigh]: "High energy & adventurous",
    };
    const label = energyMap[pet.energyLevel as number];
    if (label) personality.push(label);
  }
  if (pet.socialStyle)
    personality.push(`Compatible social style: ${pet.socialStyle}`);
  pet.emotions
    ?.slice(0, 2)
    .forEach((e) => personality.push(`Appreciates: ${e}`));
  if (pet.goodWith?.includes("Dogs"))
    personality.push("Must be friendly with dogs");
  if (pet.goodWith?.includes("Kids"))
    personality.push("Kid-friendly preferred");

  return [
    ...genetic.map((item) => `genetic:${item}`),
    ...personality.map((item) => `personality:${item}`),
  ];
}

function getHealthBadge(pet: Pet): {
  icon: string;
  label: string;
  colorClass: string;
} {
  if (pet.vaccine && pet.fleaTick)
    return {
      icon: "verified",
      label: "Health Verified",
      colorClass: "text-green-600",
    };
  if (pet.vaccine)
    return {
      icon: "vaccines",
      label: "Vaccinated",
      colorClass: "text-blue-500",
    };
  if (pet.fleaTick)
    return {
      icon: "shield",
      label: "Flea Protected",
      colorClass: "text-teal-500",
    };
  return {
    icon: "warning",
    label: "Needs Update",
    colorClass: "text-amber-500",
  };
}

const defaultTime = {
  start: Date.now(),
  end: Date.now(),
};

/* ── Page ── */
export default function CreateActivityPage() {
  const router = useRouter();
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("dateRange");
  const [weekdaySlots, setWeekdaySlots] = useState<WeekdaySlots>({});
  const { toast } = useToast();
  const { data: allProfiles } = useProfile();
  const { mutate: createActivity, isPending } = useCreateActivity();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivityForm>({
    defaultValues: {
      title: "",
      type: "park",
      customType: "",
      hostType: "personal",
      locationName: "",
      latitude: null,
      longitude: null,
      sizes: ["MD"],
      dogLimit: 8,
      startDate: toLocalDateTimeString(
        new Date(defaultTime.start + 60 * 60 * 1000),
      ),
      endDate: toLocalDateTimeString(
        new Date(defaultTime.end + 3 * 60 * 60 * 1000),
      ),
      description: "",
      autoEnd: true,
      petRequirements: ["Vaccine", "Flea & Tick", "Microchip Verified"],
      lovePetId: "",
      tags: [],
    },
  });

  const hostType = useWatch({ control, name: "hostType" });
  const activityType = useWatch({ control, name: "type" });
  const isLove = activityType === "love";
  const lovePetId = useWatch({ control, name: "lovePetId" });
  const watchStartDate = useWatch({ control, name: "startDate" });
  const watchEndDate = useWatch({ control, name: "endDate" });

  if (isPending) return <SpinLoader title="Creating the activity" />;

  const onSubmit = ({
    dogLimit,
    customType,
    autoEnd,
    petRequirements,
    ...data
  }: ActivityForm) => {
    const startDate = data.startDate;
    const endDate = data.endDate;

    const resolvedType =
      data.type === "custom" ? customType.trim() || "custom" : data.type;

    // For love, auto-generate pet requirements from selected pet
    let resolvedPetRequirements = petRequirements;
    if (data.type === "love" && data.lovePetId) {
      const pet = allProfiles?.pets.find((p) => p._id === data.lovePetId);
      if (pet) {
        resolvedPetRequirements = buildLovePetRequirements(pet);
      }
    }

    createActivity(
      {
        ...data,
        type: resolvedType,
        autoEnd,
        petRequirements: resolvedPetRequirements,
        amountOfAttendees: dogLimit,
        image: coverFiles ?? undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        ...(scheduleMode === "scheduler" && Object.keys(weekdaySlots).length > 0
          ? { weekdaySlots }
          : {}),
      },
      {
        onSuccess: () => {
          toast("Activity created successfully!", "success");
          router.push("/");
        },
      },
    );
  };

  const pets = allProfiles?.pets ?? [];
  const selectedLovePet = pets.find((p) => p._id === lovePetId) ?? null;

  return (
    <div
      className={clsx(
        "min-h-dvh w-full transition-colors duration-300",
        isLove ? "bg-rose-50" : "bg-[#f7f7f6]",
      )}
    >
      <div className="flex flex-col w-full">
        {/* Page header */}
        <div
          className={clsx(
            "flex items-center px-4 py-3 border-b sticky top-0 z-10 transition-colors",
            isLove
              ? "bg-rose-50/90 border-rose-200 backdrop-blur-md"
              : "border-[rgba(225,207,183,0.2)] bg-[#f7f7f6]",
          )}
        >
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[#1e293b]">
              arrow_back
            </span>
          </Link>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
              Create Activity
            </h1>
            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              New Event
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="pb-28">
          <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-5">
            <Controller
              control={control}
              name="hostType"
              render={({ field }) => (
                <HostTypeSection
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue(
                      "type",
                      v === "business" ? "swimming_pool" : "park",
                    );
                  }}
                />
              )}
            />

            <div>
              <label className={labelClass}>
                Activity Photos <span className="text-red-400">*</span>
              </label>
              <p className="text-[11px] text-[#94a3b8] mb-2 ml-0.5">
                At least 1 photo required. Add up to 5 — the first will be the
                cover.
              </p>
              <PhotoUpload
                multiple
                files={coverFiles}
                onChange={setCoverFiles}
              />
            </div>

            <Controller
              control={control}
              name="title"
              rules={{ required: "Activity title is required." }}
              render={({ field }) => (
                <TitleField
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ActivityTypeSection
                  value={field.value}
                  onChange={field.onChange}
                  hostType={hostType}
                />
              )}
            />
            {activityType === "custom" && (
              <div>
                <label className={labelClass}>
                  Custom Activity Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frisbee in the park"
                  className={clsx(
                    inputClass,
                    errors.customType &&
                      "border-red-400 focus:border-red-400 focus:ring-red-100",
                  )}
                  {...register("customType", {
                    validate: (v) =>
                      activityType !== "custom" ||
                      !!v.trim() ||
                      "Please enter a custom activity name.",
                  })}
                />
                {errors.customType && (
                  <p className="text-[11px] text-red-500 mt-1 ml-0.5">
                    {errors.customType.message}
                  </p>
                )}
              </div>
            )}

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagSection
                  activityType={activityType}
                  selected={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div>
              <LocationAutoComplete
                onSelect={(loc) => {
                  setValue("locationName", loc.locationName, {
                    shouldValidate: true,
                  });
                  setValue("latitude", loc.latitude);
                  setValue("longitude", loc.longitude);
                }}
                registration={register("locationName", {
                  required: "Location is required.",
                })}
                required
                error={
                  errors.locationName
                    ? new Error(errors.locationName.message)
                    : undefined
                }
              />
              {errors.locationName && (
                <p className="text-[11px] text-red-500 mt-1 ml-0.5">
                  {errors.locationName.message}
                </p>
              )}
            </div>
            {hostType === "business" ? (
              <>
                <ScheduleModeToggle
                  mode={scheduleMode}
                  onChange={setScheduleMode}
                />
                {scheduleMode === "scheduler" ? (
                  <BusinessDateSlotPicker
                    weekdaySlots={weekdaySlots}
                    onChange={setWeekdaySlots}
                  />
                ) : (
                  <DateRangeCalendar
                    startDate={watchStartDate}
                    endDate={watchEndDate}
                    onStartChange={(v) =>
                      setValue("startDate", v, { shouldValidate: true })
                    }
                    onEndChange={(v) =>
                      setValue("endDate", v, { shouldValidate: true })
                    }
                  />
                )}
              </>
            ) : (
              <DateRangeCalendar
                isSingleDate={isLove}
                startDate={watchStartDate}
                endDate={watchEndDate}
                onStartChange={(v) =>
                  setValue("startDate", v, { shouldValidate: true })
                }
                onEndChange={(v) =>
                  setValue("endDate", v, { shouldValidate: true })
                }
              />
            )}

            {isLove ? (
              <>
                <Controller
                  control={control}
                  name="lovePetId"
                  rules={{ required: "Please select a dog for matching." }}
                  render={({ field }) => (
                    <PetSelectorSection
                      pets={pets}
                      selectedId={field.value}
                      onChange={field.onChange}
                      error={errors.lovePetId?.message}
                    />
                  )}
                />
                {selectedLovePet && (
                  <LovePetRequirements pet={selectedLovePet} />
                )}
              </>
            ) : (
              <>
                <Controller
                  control={control}
                  name="petRequirements"
                  render={({ field }) => (
                    <PetRequirementsSection
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="sizes"
                  render={({ field }) => (
                    <DogSizeSection
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {hostType === "personal" && (
                  <Controller
                    control={control}
                    name="dogLimit"
                    render={({ field }) => (
                      <DogLimitSection
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                )}
              </>
            )}

            <Controller
              control={control}
              name="description"
              rules={{ required: "Description is required." }}
              render={({ field }) => (
                <DescriptionSection
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.description?.message}
                />
              )}
            />

            <button
              type="submit"
              className={clsx(
                "w-full h-14 rounded-[14px] flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity mb-2 gap-3",
                isLove
                  ? "bg-rose-500 text-white"
                  : "bg-[#e2cfb7] text-[#1e293b]",
              )}
            >
              <span className="text-[17px] font-bold">
                {isLove ? "Find My Match 💕" : "Create Activity"}
              </span>
              {!isLove && <span>🐾</span>}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

/* ── HostTypeSection ── */
function HostTypeSection({
  value,
  onChange,
}: {
  value: HostType;
  onChange: (v: HostType) => void;
}) {
  const options: { id: HostType; icon: string; label: string; desc: string }[] =
    [
      {
        id: "personal",
        icon: "🐾",
        label: "Community / Personal",
        desc: "Organising a free meetup, walk, or dog park hangout",
      },
      {
        id: "business",
        icon: "🏪",
        label: "Business / Service",
        desc: "Running a paid service — grooming, training, daycare, etc.",
      },
    ];

  return (
    <div>
      <label className={labelClass}>Are you a business or an individual?</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={clsx(
              "flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 transition-all text-left",
              value === opt.id
                ? "bg-[#e2cfb7] border-[#e2cfb7]"
                : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
            )}
          >
            <span className="text-xl mb-1">{opt.icon}</span>
            <p className={clsx("text-[13px] font-bold text-[#1e293b]")}>
              {opt.label}
            </p>
            <p
              className={clsx(
                "text-[11px]",
                value === opt.id ? "text-[#94a3b8]" : "text-[#64748b]",
              )}
            >
              {opt.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── ActivityTypeSection ── */
function ActivityTypeSection({
  value,
  onChange,
  hostType,
}: {
  value: string;
  onChange: (id: string) => void;
  hostType: HostType;
}) {
  const types =
    hostType === "business" ? BUSINESS_ACTIVITY_TYPES : PERSONAL_ACTIVITY_TYPES;

  return (
    <div>
      <label className={labelClass}>Activity Type</label>
      <div className="grid grid-cols-3 gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={clsx(
              "h-18 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all",
              value === type.id
                ? "bg-[#e2cfb7] border-[#e2cfb7]"
                : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
            )}
          >
            <span className="text-2xl">{type.icon}</span>
            <span className={clsx("text-[11px] font-bold text-[#334155]")}>
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── TagSection ── */
function TagSection({
  activityType,
  selected,
  onChange,
}: {
  activityType: string;
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [emoji, setEmoji] = useState("🏷️");
  const [showPicker, setShowPicker] = useState(false);

  const EMOJI_OPTIONS = [
    "🏷️",
    "🐾",
    "🌿",
    "⭐",
    "🎯",
    "🔥",
    "💡",
    "🏅",
    "✅",
    "📍",
    "🎪",
    "🌟",
    "🧡",
    "🐕",
    "🌈",
    "🏆",
    "🎉",
    "💪",
    "🌸",
    "☕",
  ];

  const options =
    activityType === "custom"
      ? [...new Set(Object.values(ACTIVITY_TAGS).flat())]
      : (ACTIVITY_TAGS[activityType] ?? []);

  const toggle = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );

  const addCustom = () => {
    const label = input.trim();
    if (!label) return;
    const tag = `${emoji} ${label}`;
    if (selected.includes(tag)) return;
    onChange([...selected, tag]);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className={labelClass}>Tags</label>

      {options.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {options.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all shrink-0",
                  active
                    ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                    : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#e2cfb7]",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom tag input with emoji prefix */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            title="Pick emoji"
            className="h-10 w-10 shrink-0 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white flex items-center justify-center text-lg hover:border-[#e2cfb7] transition-colors"
          >
            {emoji}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowPicker(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add your own tag…"
            className="flex-1 h-10 px-3 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white text-[13px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={
              !input.trim() || selected.includes(`${emoji} ${input.trim()}`)
            }
            className="h-10 px-4 shrink-0 rounded-xl bg-[#e2cfb7] text-[#1e293b] text-[12px] font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
        {/* Duplicate warning */}
        {input.trim() && selected.includes(`${emoji} ${input.trim()}`) && (
          <p className="text-[11px] text-amber-500 px-1">Already added</p>
        )}
        {/* Filtered suggestions from preset options */}
        {input.trim() &&
          !selected.includes(`${emoji} ${input.trim()}`) &&
          (() => {
            const q = input.trim().toLowerCase();
            const suggestions = options.filter(
              (t) => t.toLowerCase().includes(q) && !selected.includes(t),
            );
            return suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      toggle(t);
                      setInput("");
                    }}
                    className="px-3 py-1 rounded-full text-[12px] font-semibold border border-[#e2cfb7] bg-[rgba(226,207,183,0.15)] text-[#64748b] hover:bg-[#e2cfb7] hover:text-[#1e293b] transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : null;
          })()}
        {showPicker && (
          <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-[rgba(226,207,183,0.4)] rounded-xl">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setEmoji(e);
                  setShowPicker(false);
                }}
                className={clsx(
                  "w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all",
                  e === emoji
                    ? "bg-[#e2cfb7]"
                    : "hover:bg-[rgba(226,207,183,0.2)]",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User-added custom tags not in preset list */}
      {selected.filter((t) => !options.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected
            .filter((t) => !options.includes(t))
            .map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-[#e2cfb7] border border-[#e2cfb7] text-[#1e293b]"
              >
                {tag}
                <button type="button" onClick={() => toggle(tag)}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 12 }}
                  >
                    close
                  </span>
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

/* ── TitleField ── */
function TitleField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        Activity Title <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        placeholder="e.g. Morning run at Lumphini Park"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          inputClass,
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
        )}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
}

/* ── PetRequirementsSection ── */
const MAX_REQUIREMENTS = 6;

const REQ_EMOJI: Record<string, string> = {
  vaccine: "💉",
  vaccination: "💉",
  "flea & tick": "🛡️",
  flea: "🛡️",
  tick: "🛡️",
  microchip: "📡",
  "microchip verified": "📡",
  sterilized: "✂️",
  neutered: "✂️",
  spayed: "✂️",
  friendly: "🐾",
  trained: "🎓",
  health: "🩺",
  insurance: "📋",
  leash: "🦮",
  collar: "🏷️",
  groomed: "✨",
};

function getReqEmoji(req: string): string {
  const key = req.toLowerCase();
  for (const [k, emoji] of Object.entries(REQ_EMOJI)) {
    if (key.includes(k)) return emoji;
  }
  return "✅";
}

function PetRequirementsSection({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const canAdd = value.length < MAX_REQUIREMENTS;

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || !canAdd || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[13px] font-semibold text-[#334155] ml-1">
          Pet Requirements
        </label>
        <span className="text-[11px] font-semibold text-[#94a3b8]">
          {value.length}/{MAX_REQUIREMENTS}
        </span>
      </div>

      {/* List */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {value.map((req) => (
            <div
              key={req}
              className="flex items-center justify-between bg-white border border-[rgba(226,207,183,0.4)] rounded-xl px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">
                  {getReqEmoji(req)}
                </span>
                <p className="text-[13px] font-semibold text-[#1e293b]">
                  {req}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(req)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors group"
              >
                <span
                  className="material-symbols-outlined text-[#94a3b8] group-hover:text-red-400 transition-colors"
                  style={{ fontSize: 16 }}
                >
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {canAdd ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="e.g. Up-to-date vaccination"
            className="flex-1 h-10 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7]"
          />
          <button
            type="button"
            onClick={add}
            disabled={!input.trim()}
            className="h-10 px-4 rounded-xl bg-[#1e293b] text-[12px] font-bold text-white disabled:opacity-30 transition-opacity"
          >
            Add
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-[#94a3b8] text-center py-1">
          Maximum {MAX_REQUIREMENTS} requirements reached.
        </p>
      )}
    </div>
  );
}

/* ── ScheduleModeToggle ── */
function ScheduleModeToggle({
  mode,
  onChange,
}: {
  mode: ScheduleMode;
  onChange: (m: ScheduleMode) => void;
}) {
  return (
    <div>
      <label className={labelClass}>Schedule Type</label>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            {
              id: "dateRange",
              icon: "date_range",
              label: "Date Range",
              desc: "Single start & end date",
            },
            {
              id: "scheduler",
              icon: "calendar_view_week",
              label: "Scheduler",
              desc: "Pick dates & add slots",
            },
          ] as { id: ScheduleMode; icon: string; label: string; desc: string }[]
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={clsx(
              "flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 transition-all text-left",
              mode === opt.id
                ? "bg-[#e2cfb7] border-[#e2cfb7]"
                : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
            )}
          >
            <span
              className="material-symbols-outlined text-[#1e293b] mb-1"
              style={{ fontSize: 20 }}
            >
              {opt.icon}
            </span>
            <p className="text-[13px] font-bold text-[#1e293b]">{opt.label}</p>
            <p
              className={clsx(
                "text-[11px]",
                mode === opt.id ? "text-[#94a3b8]" : "text-[#64748b]",
              )}
            >
              {opt.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

const SIZE_DETAILS: Record<PetSizeCategory, { label: string; weight: string }> =
  {
    XS: { label: "Extra Small", weight: "< 3 kg" },
    SM: { label: "Small", weight: "3 – 10 kg" },
    MD: { label: "Medium", weight: "11 – 15 kg" },
    LG: { label: "Large", weight: "16 – 25 kg" },
    XL: { label: "Extra Large", weight: "> 25 kg" },
  };

/* ── DogSizeSection ── */
function DogSizeSection({
  value,
  onChange,
}: {
  value: PetSizeCategory[];
  onChange: (sizes: PetSizeCategory[]) => void;
}) {
  const toggle = (size: PetSizeCategory) => {
    onChange(
      value.includes(size) ? value.filter((s) => s !== size) : [...value, size],
    );
  };

  return (
    <div>
      <label className={labelClass}>
        Accepted Dog Sizes
        <span className="ml-1 font-normal text-[#94a3b8] text-[11px]">
          — select all that apply
        </span>
      </label>
      <div className="flex flex-col gap-2">
        {SIZE_OPTIONS.map((size) => {
          const { label, weight } = SIZE_DETAILS[size];
          const selected = value.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggle(size)}
              className={clsx(
                "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left",
                selected
                  ? "bg-[#1e293b] border-[#1e293b] text-white"
                  : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#e2cfb7]",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-[13px] font-bold w-6",
                    selected ? "text-white" : "text-[#1e293b]",
                  )}
                >
                  {size}
                </span>
                <span
                  className={clsx(
                    "text-[13px]",
                    selected ? "text-white/90" : "text-[#475569]",
                  )}
                >
                  {label}
                </span>
              </div>
              <span
                className={clsx(
                  "text-[12px] font-semibold",
                  selected ? "text-white/70" : "text-[#94a3b8]",
                )}
              >
                {weight}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── DogLimitSection ── */
function DogLimitSection({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className={labelClass}>Max Dogs</label>
      <div className="flex items-center justify-between bg-white rounded-2xl border border-[#e2e8f0] px-4 py-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-10 h-10 rounded-full bg-[rgba(225,207,183,0.3)] flex items-center justify-center text-xl font-bold text-[#1e293b]"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-[28px] font-extrabold text-[#1e293b] leading-none">
            {value}
          </p>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">dogs max</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          className="w-10 h-10 rounded-full bg-[rgba(225,207,183,0.3)] flex items-center justify-center text-xl font-bold text-[#1e293b]"
        >
          +
        </button>
      </div>
    </div>
  );
}

const DESCRIPTION_PROMPTS: { icon: string; label: string; text: string }[] = [
  { icon: "🎒", label: "What to bring", text: "What to bring: " },
  { icon: "💰", label: "Price / fee", text: "Price: " },
  { icon: "📞", label: "Contact", text: "Contact: " },
  { icon: "🐕", label: "Dog behaviour", text: "Dog behaviour expected: " },
  { icon: "🅿️", label: "Parking", text: "Parking: " },
  { icon: "ℹ️", label: "Extra info", text: "Extra info: " },
];

/* ── DescriptionSection ── */
function DescriptionSection({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const appendPrompt = (text: string) => {
    const prefix = value && !value.endsWith("\n") ? "\n" : "";
    onChange(value + prefix + text);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className={labelClass}>
          Description <span className="text-red-400">*</span>
        </label>
        <p className="text-[11px] text-[#94a3b8] mt-0.5 ml-0.5">
          Tell people what to expect — the more detail, the better.
        </p>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap gap-1.5">
        {DESCRIPTION_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => appendPrompt(p.text)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[rgba(226,207,183,0.5)] text-[12px] font-semibold text-[#475569] hover:border-[#e2cfb7] hover:bg-[#faf8f5] active:scale-95 transition-all"
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        placeholder={`e.g.\nMeeting point: Main gate of Lumphini Park\nWhat to bring: Water bowl, leash, poop bags\nRules: Friendly dogs only, keep on leash`}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:ring-2 resize-none leading-relaxed",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-[rgba(226,207,183,0.4)] focus:border-[#e1cfb7] focus:ring-[rgba(226,207,183,0.3)]",
        )}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
}

/* ── PetSelectorSection ── */
function PetSelectorSection({
  pets,
  selectedId,
  onChange,
  error,
}: {
  pets: Pet[];
  selectedId: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  if (pets.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <span className="material-symbols-outlined text-rose-300 text-4xl">
          pets
        </span>
        <p className="text-[13px] text-rose-400 mt-2 font-medium">
          No pets found. Add a pet profile first.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-[13px] font-semibold text-rose-600 mb-3 block ml-1">
        🐶 Select Your Dog <span className="text-red-400">*</span>
      </label>
      <div className="flex flex-col gap-3">
        {pets.map((pet) => {
          const badge = getHealthBadge(pet);
          const isSelected = selectedId === pet._id;
          const isDisabled = !!pet.sterilizing;
          return (
            <label
              key={pet._id}
              className={clsx(
                "flex items-center gap-4 rounded-xl border-2 bg-white p-4 transition-all",
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "border-rose-400 bg-rose-50/60 cursor-pointer"
                    : "border-rose-200/40 hover:border-rose-300 cursor-pointer",
              )}
            >
              {pet.image ? (
                <Image
                  src={pet.image}
                  alt={pet.name ?? "Pet"}
                  width={64}
                  height={64}
                  className="size-16 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="size-16 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px] text-rose-400">
                    pets
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col min-w-0">
                <p className="text-[#1e293b] text-base font-bold truncate">
                  {pet.name ?? "—"}
                </p>
                <p className="text-[#64748b] text-sm">
                  {pet.breed ?? "Mixed"} • {pet.size ?? "—"}
                </p>
                {isDisabled ? (
                  <p className="mt-1 text-xs font-medium text-[#94a3b8]">
                    Already sterilized — not eligible for Love
                  </p>
                ) : (
                  <div
                    className={clsx(
                      "mt-1 flex items-center gap-1 text-xs font-medium",
                      badge.colorClass,
                    )}
                  >
                    <span className="material-symbols-outlined text-xs leading-none">
                      {badge.icon}
                    </span>
                    {badge.label}
                  </div>
                )}
              </div>
              <input
                type="radio"
                name="dog-selection"
                value={pet._id}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => !isDisabled && onChange(pet._id)}
                className="size-6 shrink-0 appearance-none rounded-full border-2 border-rose-200 transition-colors"
                style={
                  isSelected
                    ? {
                        backgroundColor: "#f43f5e",
                        borderColor: "#f43f5e",
                        backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
            </label>
          );
        })}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
}

/* ── LovePetRequirements ── */
function LovePetRequirementsSection({
  title,
  icon,
  items,
  chipClass,
}: {
  title: string;
  icon: string;
  items: string[];
  chipClass: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-rose-400"
          style={{ fontSize: 16 }}
        >
          {icon}
        </span>
        <p className="text-[12px] font-bold text-rose-600 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={clsx(
              "px-3 py-1 rounded-full text-[12px] font-semibold",
              chipClass,
            )}
          >
            {item}
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-[12px] text-[#94a3b8]">—</span>
        )}
      </div>
    </div>
  );
}

function LovePetRequirements({ pet }: { pet: Pet }) {
  // Genetic requirements — what the partner dog must have
  const genetic: string[] = [];
  genetic.push("Vaccine up to date");
  genetic.push("Flea & Tick protected");
  if (pet.breed) genetic.push(`Breed: ${pet.breed} or compatible`);
  if (pet.size) genetic.push(`Size: ${pet.size}`);
  if (pet.ageGroup) genetic.push(`Age group: ${pet.ageGroup}`);
  if (pet.microchipVerified) genetic.push("Microchip verified preferred");

  // Personality requirements — compatible traits for the partner dog
  const personality: string[] = [];
  if (pet.energyLevel !== undefined) {
    const energyMap: Record<number, string> = {
      [PetEnergyLevel.Low]: "Calm & gentle energy",
      [PetEnergyLevel.Medium]: "Balanced energy level",
      [PetEnergyLevel.High]: "Active & playful energy",
      [PetEnergyLevel.VeryHigh]: "High energy & adventurous",
    };
    const label = energyMap[pet.energyLevel as number];
    if (label) personality.push(label);
  }
  if (pet.socialStyle)
    personality.push(`Compatible social style: ${pet.socialStyle}`);
  pet.emotions
    ?.slice(0, 2)
    .forEach((e) => personality.push(`Appreciates: ${e}`));
  if (pet.goodWith?.includes("Dogs"))
    personality.push("Must be friendly with dogs");
  if (pet.goodWith?.includes("Kids"))
    personality.push("Kid-friendly preferred");

  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">💝</span>
        <p className="text-[13px] font-bold text-rose-600">
          Match Requirements
        </p>
        <span className="ml-auto text-[11px] text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
          Auto-filled
        </span>
      </div>
      <LovePetRequirementsSection
        title="Genetic Information"
        icon="genetics"
        items={genetic}
        chipClass="bg-rose-50 border border-rose-200 text-rose-700"
      />
      <LovePetRequirementsSection
        title="Personality Traits"
        icon="psychology"
        items={personality}
        chipClass="bg-purple-50 border border-purple-200 text-purple-700"
      />
    </div>
  );
}
