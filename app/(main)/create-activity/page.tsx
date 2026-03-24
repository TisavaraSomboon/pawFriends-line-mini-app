"use client";
import { useState } from "react";
import {
  useForm,
  Controller,
  useWatch,
  Control,
  FieldErrors,
  UseFormRegisterReturn,
} from "react-hook-form";
import { clsx } from "clsx";
import Link from "next/link";
import Footer from "@/components/MobileFooter";
import CoverPhotoPicker from "@/components/CoverPhotoPicker";
import {
  PetSizeCategory,
  useAuthUser,
  useCreateActivity,
  useGeneratePhoto,
  useIncrementAiPhotoCount,
} from "@/lib/queries";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import SpinLoader from "@/components/SpinLoader";
import dayjs from "dayjs";

/* ── Types ── */
type HostType = "personal" | "business";
type TimeSlot = { id: string; label: string; startTime: string; endTime: string; maxDogs: number };
type DaySlots = Record<string, TimeSlot[]>; // "YYYY-MM-DD" → slots

/* ── Constants ── */
const PERSONAL_ACTIVITY_TYPES = [
  { id: "park", icon: "🌳", label: "Park Run" },
  { id: "playdate", icon: "🐾", label: "Playdate" },
  { id: "training", icon: "🎓", label: "Training" },
  { id: "swimming", icon: "🏊", label: "Swimming" },
  { id: "hiking", icon: "🥾", label: "Hiking" },
  { id: "custom", icon: "✏️", label: "Custom" },
];

const BUSINESS_ACTIVITY_TYPES = [
  { id: "swimming_pool", icon: "🏊", label: "Swimming Pool" },
  { id: "artificial_turf", icon: "⛳", label: "Artificial Turf" },
  { id: "real_grass", icon: "🌿", label: "Grass Field" },
  { id: "grooming", icon: "✂️", label: "Grooming" },
  { id: "hotel_daycare", icon: "🏨", label: "Hotel & Daycare" },
  { id: "custom", icon: "✏️", label: "Custom" },
];

// Used for AI prompt only
const ACTIVITY_TYPES = PERSONAL_ACTIVITY_TYPES;

const SIZE_OPTIONS: PetSizeCategory[] = ["XS", "SM", "MD", "LG", "XL"];

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
};

/* ── Page ── */
export default function CreateActivityPage() {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [selectedAiUrl, setSelectedAiUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [daySlots, setDaySlots] = useState<DaySlots>({});
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));
  const { toast } = useToast();

  const { data: user } = useAuthUser();

  const { mutateAsync: generatePhoto } = useGeneratePhoto(
    `dog activity cover photo, ${ACTIVITY_TYPES[0].label} with dogs, outdoor setting, vibrant and inviting atmosphere. The image should prominently feature dogs having fun in a park environment, with greenery and sunlight. Always include dogs in the image.`,
  );
  const { mutate: incrementAiCount } = useIncrementAiPhotoCount(
    user?._id,
    "aiCoverImageCount",
  );
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
      startDate: "",
      endDate: "",
      description: "",
      autoEnd: true,
      petRequirements: ["Vaccine", "Flea & Tick", "Microchip Verified"],
    },
  });

  const hostType = useWatch({ control, name: "hostType" });
  const activityType = useWatch({ control, name: "type" });

  if (isPending) return <SpinLoader title="Creating the activity" />;

  const onSubmit = ({ dogLimit, customType, autoEnd, petRequirements, ...data }: ActivityForm) => {
    let startDate = data.startDate;
    let endDate = data.endDate;

    // For business, derive startDate/endDate from first slot
    if (data.hostType === "business") {
      const firstDay = Object.keys(daySlots).sort()[0];
      const firstSlot = firstDay ? daySlots[firstDay]?.[0] : null;
      if (firstSlot) {
        startDate = `${firstDay}T${firstSlot.startTime}`;
        endDate = `${firstDay}T${firstSlot.endTime}`;
      }
    }

    const resolvedType =
      data.type === "custom" ? (customType.trim() || "custom") : data.type;

    createActivity(
      {
        ...data,
        type: resolvedType,
        autoEnd,
        petRequirements,
        amountOfAttendees: dogLimit,
        image: coverFile ?? selectedAiUrl ?? undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
      },
      {
        onSuccess: () => {
          toast("Activity created successfully!", "success");
          router.push("/");
        },
      },
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generatePhoto();
      setAiImages(data ?? []);
      incrementAiCount(user?.aiCoverImageCount ?? 0);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitButton = (
    <button
      type="submit"
      className="h-14 rounded-[14px] bg-[#e2cfb7] flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity mb-2 gap-4"
    >
      <span className="text-[17px] font-bold">Create Activity</span>
      <span>🐾</span>
    </button>
  );

  const coverPickerProps = {
    previewUrl: coverFile
      ? URL.createObjectURL(coverFile)
      : (selectedAiUrl ?? undefined),
    aiImages,
    isGenerating,
    selectedAiUrl,
    usedCount: user?.aiCoverImageCount ?? 0,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
        setCoverFile(f);
        setSelectedAiUrl(null);
        setValue("image", URL.createObjectURL(f));
      }
    },
    onAiSelect: (url: string) => {
      setCoverFile(null);
      setSelectedAiUrl(url);
      setValue("image", url);
    },
    onGenerate: handleGenerate,
  };

  const hostTypeField = (
    <Controller
      control={control}
      name="hostType"
      render={({ field }) => (
        <HostTypeSection
          value={field.value}
          onChange={(v) => {
            field.onChange(v);
            setValue("type", v === "business" ? "swimming_pool" : "park");
          }}
        />
      )}
    />
  );

  const activityTypeField = (
    <>
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
    </>
  );

  const dateField =
    hostType === "business" ? (
      <BusinessCalendar
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        daySlots={daySlots}
        onDaySlotsChange={setDaySlots}
      />
    ) : (
      <DateRangeSection control={control} errors={errors} />
    );

  const autoEndField = hostType === "business" ? (
    <Controller
      control={control}
      name="autoEnd"
      render={({ field }) => (
        <AutoEndToggle value={field.value} onChange={field.onChange} />
      )}
    />
  ) : null;

  const petRequirementsField = (
    <Controller
      control={control}
      name="petRequirements"
      render={({ field }) => (
        <PetRequirementsSection value={field.value} onChange={field.onChange} />
      )}
    />
  );

  const locationField = (
    <div>
      <LocationAutoComplete
        onSelect={(loc) => {
          setValue("locationName", loc.locationName, { shouldValidate: true });
          setValue("latitude", loc.latitude);
          setValue("longitude", loc.longitude);
        }}
        registration={register("locationName", { required: "Location is required." })}
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
  );

  return (
    <div className="flex min-h-dvh bg-[#f7f7f6] w-full">
      <div className="flex flex-col flex-1 w-full">
        {/* Page header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] sticky top-0 z-10">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors md:hidden"
          >
            <span className="material-symbols-outlined text-[#1e293b]">
              arrow_back
            </span>
          </Link>
          <div className="text-center w-full">
            <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
              Create Activity
            </h1>
            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              New Event
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pb-24 md:pb-8 w-full"
        >
          {/* ── Mobile layout ── */}
          <div className="md:hidden px-4 pt-5 flex flex-col gap-5">
            {hostTypeField}
            <CoverPhotoPicker {...coverPickerProps} />
            <TitleField
              registration={register("title", {
                required: "Activity title is required.",
              })}
              error={errors.title?.message}
            />
            {activityTypeField}
            {locationField}
            {dateField}
            {autoEndField}
            {petRequirementsField}
            <Controller
              control={control}
              name="sizes"
              render={({ field }) => (
                <DogSizeSection value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="dogLimit"
              render={({ field }) => (
                <DogLimitSection value={field.value} onChange={field.onChange} />
              )}
            />
            <DescriptionSection
              registration={register("description", {
                required: "Description is required.",
              })}
              error={errors.description?.message}
            />
            {submitButton}
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-8 px-8 pt-8">
            {/* Left col */}
            <div className="flex flex-col gap-6">
              <CoverPhotoPicker {...coverPickerProps} />
              <Controller
                control={control}
                name="dogLimit"
                render={({ field }) => (
                  <DogLimitSection value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="sizes"
                render={({ field }) => (
                  <DogSizeSection value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-6">
              {hostTypeField}
              <TitleField
                registration={register("title", {
                  required: "Activity title is required.",
                })}
                error={errors.title?.message}
              />
              {activityTypeField}
              {locationField}
              {dateField}
              {autoEndField}
              {petRequirementsField}
              <DescriptionSection
                registration={register("description", {
                  required: "Description is required.",
                })}
                error={errors.description?.message}
              />
              {submitButton}
            </div>
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
  const options: { id: HostType; icon: string; label: string; desc: string }[] = [
    { id: "personal", icon: "🐾", label: "Personal", desc: "Free activities & events" },
    { id: "business", icon: "🏪", label: "Business", desc: "Dog services & venues" },
  ];

  return (
    <div>
      <label className={labelClass}>Host Type</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={clsx(
              "flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 transition-all text-left",
              value === opt.id
                ? "bg-[#1e293b] border-[#1e293b]"
                : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
            )}
          >
            <span className="text-xl mb-1">{opt.icon}</span>
            <p
              className={clsx(
                "text-[13px] font-bold",
                value === opt.id ? "text-white" : "text-[#1e293b]",
              )}
            >
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
                ? "bg-[#1e293b] border-[#1e293b]"
                : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
            )}
          >
            <span className="text-2xl">{type.icon}</span>
            <span
              className={clsx(
                "text-[11px] font-bold",
                value === type.id ? "text-white" : "text-[#334155]",
              )}
            >
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── TitleField ── */
function TitleField({
  registration,
  error,
}: {
  registration: UseFormRegisterReturn;
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
        className={clsx(
          inputClass,
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
        )}
        {...registration}
      />
      {error && <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
}

/* ── DateRangeSection (personal) ── */
function DateRangeSection({
  control,
  errors,
}: {
  control: Control<ActivityForm>;
  errors: FieldErrors<ActivityForm>;
}) {
  const startDate = useWatch({ control, name: "startDate" });
  const hasError = errors.startDate || errors.endDate;

  return (
    <div>
      <label className={labelClass}>
        Date &amp; Time <span className="text-red-400">*</span>
      </label>
      <div
        className={clsx(
          "bg-white rounded-[14px] border divide-y",
          hasError
            ? "border-red-400 divide-red-100"
            : "border-[rgba(226,207,183,0.4)] divide-[rgba(226,207,183,0.4)]",
        )}
      >
        <div className="flex items-center px-4 gap-3">
          <span
            className="material-symbols-outlined text-[#94a3b8]"
            style={{ fontSize: 18 }}
          >
            play_circle
          </span>
          <div className="flex-1 py-2">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">
              Start
            </p>
            <Controller
              control={control}
              name="startDate"
              rules={{ required: "Start date is required." }}
              render={({ field }) => (
                <input
                  type="datetime-local"
                  className="w-full text-[14px] text-[#1e293b] bg-transparent outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="flex items-center px-4 gap-3">
          <span
            className="material-symbols-outlined text-[#94a3b8]"
            style={{ fontSize: 18 }}
          >
            stop_circle
          </span>
          <div className="flex-1 py-2">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">
              End
            </p>
            <Controller
              control={control}
              name="endDate"
              rules={{ required: "End date is required." }}
              render={({ field }) => (
                <input
                  type="datetime-local"
                  min={startDate || undefined}
                  className="w-full text-[14px] text-[#1e293b] bg-transparent outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </div>
      {errors.startDate && (
        <p className="text-[11px] text-red-500 mt-1 ml-0.5">
          {errors.startDate.message}
        </p>
      )}
      {errors.endDate && (
        <p className="text-[11px] text-red-500 mt-1 ml-0.5">
          {errors.endDate.message}
        </p>
      )}
    </div>
  );
}

/* ── BusinessCalendar ── */
function BusinessCalendar({
  month,
  onMonthChange,
  daySlots,
  onDaySlotsChange,
}: {
  month: dayjs.Dayjs;
  onMonthChange: (m: dayjs.Dayjs) => void;
  daySlots: DaySlots;
  onDaySlotsChange: (slots: DaySlots) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const today = dayjs().startOf("day");
  const startOfMonth = month.startOf("month");
  const daysInMonth = month.daysInMonth();
  // Pad to Monday-start (dayjs: 0=Sun, convert → 0=Mon)
  const firstDayOffset = (startOfMonth.day() + 6) % 7;
  const cells: (dayjs.Dayjs | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, "day")),
  ];

  const handleAddSlot = (slot: Omit<TimeSlot, "id">) => {
    if (!selectedDay) return;
    const id = `${selectedDay}-${Date.now()}`;
    onDaySlotsChange({
      ...daySlots,
      [selectedDay]: [...(daySlots[selectedDay] ?? []), { ...slot, id }],
    });
  };

  const handleRemoveSlot = (slotId: string) => {
    if (!selectedDay) return;
    const updated = (daySlots[selectedDay] ?? []).filter((s) => s.id !== slotId);
    const next = { ...daySlots };
    if (updated.length === 0) delete next[selectedDay];
    else next[selectedDay] = updated;
    onDaySlotsChange(next);
  };

  return (
    <div>
      <label className={labelClass}>
        Available Dates &amp; Slots <span className="text-red-400">*</span>
      </label>
      <div className="bg-white rounded-[14px] border border-[rgba(226,207,183,0.4)] overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(226,207,183,0.3)]">
          <button
            type="button"
            onClick={() => {
              onMonthChange(month.subtract(1, "month"));
              setSelectedDay(null);
            }}
            disabled={month.isSame(dayjs().startOf("month"), "month")}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] disabled:opacity-30 transition-colors"
          >
            <span className="material-symbols-outlined text-[#1e293b]" style={{ fontSize: 18 }}>
              chevron_left
            </span>
          </button>
          <p className="text-[14px] font-bold text-[#1e293b]">
            {month.format("MMMM YYYY")}
          </p>
          <button
            type="button"
            onClick={() => {
              onMonthChange(month.add(1, "month"));
              setSelectedDay(null);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors"
          >
            <span className="material-symbols-outlined text-[#1e293b]" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center px-2 pt-2">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <p key={d} className="text-[10px] font-bold text-[#94a3b8] py-1">
              {d}
            </p>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateKey = day.format("YYYY-MM-DD");
            const slots = daySlots[dateKey] ?? [];
            const isPast = day.isBefore(today);
            const isSelected = selectedDay === dateKey;
            const hasSlots = slots.length > 0;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-xl py-2 gap-0.5 transition-all",
                  isPast && "opacity-30 cursor-not-allowed",
                  isSelected && "bg-[#1e293b]",
                  !isSelected && hasSlots && "bg-[rgba(226,207,183,0.35)]",
                  !isSelected && !hasSlots && !isPast && "hover:bg-[rgba(226,207,183,0.15)]",
                )}
              >
                <p
                  className={clsx(
                    "text-[13px] font-bold leading-none",
                    isSelected ? "text-white" : "text-[#1e293b]",
                  )}
                >
                  {day.date()}
                </p>
                {hasSlots && (
                  <div
                    className={clsx(
                      "text-[9px] font-bold px-1 rounded-full",
                      isSelected ? "text-[#e2cfb7]" : "text-[#94a3b8]",
                    )}
                  >
                    {slots.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Slot editor */}
        {selectedDay && (
          <SlotEditor
            date={selectedDay}
            slots={daySlots[selectedDay] ?? []}
            onAdd={handleAddSlot}
            onRemove={handleRemoveSlot}
          />
        )}
      </div>
    </div>
  );
}

/* ── SlotEditor ── */
function SlotEditor({
  date,
  slots,
  onAdd,
  onRemove,
}: {
  date: string;
  slots: TimeSlot[];
  onAdd: (slot: Omit<TimeSlot, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [maxDogs, setMaxDogs] = useState(8);

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({ label, startTime, endTime, maxDogs });
    setLabel("");
    setStartTime("09:00");
    setEndTime("11:00");
    setMaxDogs(8);
    setShowForm(false);
  };

  return (
    <div className="border-t border-[rgba(226,207,183,0.3)] px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#1e293b]">
          {dayjs(date).format("ddd, D MMM")} — Time Slots
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(226,207,183,0.3)] text-[12px] font-bold text-[#1e293b] hover:bg-[rgba(226,207,183,0.5)] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            add
          </span>
          Add Slot
        </button>
      </div>

      {/* Existing slots */}
      {slots.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-3 py-2.5 border border-[#f1f5f9]"
            >
              <div>
                <p className="text-[13px] font-bold text-[#1e293b]">{slot.label}</p>
                <p className="text-[11px] text-[#64748b]">
                  {slot.startTime} – {slot.endTime} · max {slot.maxDogs} dogs
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(slot.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors group"
              >
                <span
                  className="material-symbols-outlined text-[#94a3b8] group-hover:text-red-400 transition-colors"
                  style={{ fontSize: 16 }}
                >
                  delete
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {slots.length === 0 && !showForm && (
        <p className="text-[12px] text-[#94a3b8] text-center py-3">
          No slots yet. Click &ldquo;Add Slot&rdquo; to set a time window.
        </p>
      )}

      {/* Add slot form */}
      {showForm && (
        <div className="bg-[rgba(226,207,183,0.08)] rounded-xl border border-[rgba(226,207,183,0.4)] p-3 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">
              Slot Label
            </p>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Morning Session"
              className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">
                Start
              </p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">
                End
              </p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">
              Max Dogs
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxDogs(Math.max(1, maxDogs - 1))}
                className="w-8 h-8 rounded-full bg-white border border-[rgba(226,207,183,0.4)] flex items-center justify-center text-lg font-bold text-[#1e293b]"
              >
                −
              </button>
              <p className="text-[20px] font-extrabold text-[#1e293b] w-8 text-center">
                {maxDogs}
              </p>
              <button
                type="button"
                onClick={() => setMaxDogs(Math.min(50, maxDogs + 1))}
                className="w-8 h-8 rounded-full bg-white border border-[rgba(226,207,183,0.4)] flex items-center justify-center text-lg font-bold text-[#1e293b]"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 h-10 rounded-xl border border-[#e2e8f0] text-[13px] font-bold text-[#64748b] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!label.trim()}
              className="flex-1 h-10 rounded-xl bg-[#1e293b] text-[13px] font-bold text-white disabled:opacity-40 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PetRequirementsSection ── */
const MAX_REQUIREMENTS = 6;

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
                <span
                  className="material-symbols-outlined text-[#e2cfb7]"
                  style={{ fontSize: 16 }}
                >
                  check_circle
                </span>
                <p className="text-[13px] font-semibold text-[#1e293b]">{req}</p>
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

/* ── AutoEndToggle ── */
function AutoEndToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={clsx(
        "w-full flex items-center gap-4 rounded-[14px] border px-4 py-3.5 transition-all text-left",
        value
          ? "bg-white border-[rgba(226,207,183,0.4)]"
          : "bg-[rgba(226,207,183,0.12)] border-[#e2cfb7]",
      )}
    >
      <div
        className={clsx(
          "w-11 h-6 rounded-full relative transition-colors shrink-0",
          value ? "bg-[#e2cfb7]" : "bg-[#1e293b]",
        )}
      >
        <div
          className={clsx(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-0.5" : "translate-x-5",
          )}
        />
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#1e293b]">
          {value ? "Auto-end when time is up" : "Manual end only"}
        </p>
        <p className="text-[11px] text-[#64748b] mt-0.5">
          {value
            ? "Activity closes automatically after the end time"
            : "Activity stays active until you manually end it"}
        </p>
      </div>
    </button>
  );
}

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
      <label className={labelClass}>Dog Size</label>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all ${
              value.includes(size)
                ? "bg-[#1e293b] text-white border-[#1e293b]"
                : "bg-white text-[#64748b] border-[#e2e8f0]"
            }`}
          >
            {size}
          </button>
        ))}
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

/* ── DescriptionSection ── */
function DescriptionSection({
  registration,
  error,
}: {
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        Description <span className="text-red-400">*</span>
      </label>
      <textarea
        placeholder="Describe the activity, location details, and what to bring..."
        rows={4}
        className={clsx(
          "w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:ring-2 resize-none leading-relaxed",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-[rgba(226,207,183,0.4)] focus:border-[#e1cfb7] focus:ring-[rgba(226,207,183,0.3)]",
        )}
        {...registration}
      />
      {error && (
        <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>
      )}
    </div>
  );
}
