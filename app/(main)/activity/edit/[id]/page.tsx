"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { clsx } from "clsx";
import Image from "next/image";
import {
  PetSizeCategory,
  useActivity,
  useUpdateActivity,
  uploadActivityImages,
} from "@/lib/queries";
import { useToast } from "@/components/Toast";
import { useParams, useRouter } from "next/navigation";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import SpinLoader from "@/components/SpinLoader";
import PhotoUpload from "@/components/PhotoUpload";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import BusinessDateSlotPicker, {
  WeekdaySlots,
} from "@/components/BusinessDateSlotPicker";

/* ── Constants (same as create-activity) ── */
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
    "🌿 Chilling", "🌳 Park", "✈️ Travel", "🎡 Amusement Park", "🛍️ Shopping",
    "🛕 Temple", "🌙 Night Market", "🎬 Movie", "🏃 Running", "📖 Reading",
    "🎵 Concert", "🚶 Walking", "🤝 Volunteer", "⚽ Sport", "🧘 Yoga",
    "🔥 BBQ", "🍕 Pizza", "🥗 Vegan", "🍣 Buffet", "🍜 Ramen",
  ],
  love: ["✈️ Travel", "☕ Meetup", "🌳 Park", "🏠 Home", "🏢 Condo"],
  training: ["✈️ Travel", "🌳 Park", "🏠 Home", "🏢 Condo", "⚽ Sport", "🤝 Volunteer", "🌲 Forest"],
  sport: ["🏃 Running", "🚶 Walking", "⚽ Football", "🏊 Swimming", "🧘 Yoga", "🥾 Hiking", "🛝 Playground", "⚽ Sport"],
  travel: ["🏖️ Beach", "🏔️ Mountain", "🌲 Forest", "🌳 Park"],
  grooming: ["🛁 Bath", "✂️ Haircare", "💅 Nail", "💄 Makeup", "👗 Dress Up", "🧹 Cleaning", "🩺 Anal Glands"],
  hotel: ["✈️ Travel", "🛏️ Bed", "🏠 Home", "🏢 Condo"],
  place: ["⛳ Artificial Turf", "🌿 Grass Field", "🛝 Playground", "🏠 Home", "🏢 Condo", "🌳 Park", "🏖️ Beach", "🏟️ Indoor Park"],
  custom: [],
};

const PET_REQUIREMENT_OPTIONS = [
  "Vaccine",
  "Flea & Tick",
  "Microchip Verified",
  "Sterilized",
  "Friendly",
];

const labelClass = "text-[13px] font-semibold text-[#334155] mb-2 block ml-1";
const inputClass =
  "w-full h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";

type ActivityForm = {
  image: File | string;
  title: string;
  type: string;
  customType: string;
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
  tags: string[];
};

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function EditActivityPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: activity, isLoading } = useActivity(id);
  const { mutate: updateActivity, isPending } = useUpdateActivity(id);
  const { toast } = useToast();

  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [scheduleMode, setScheduleMode] = useState<"dateRange" | "scheduler">("dateRange");
  const [weekdaySlots, setWeekdaySlots] = useState<WeekdaySlots>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityForm>({
    defaultValues: {
      title: "",
      type: "park",
      customType: "",
      locationName: "",
      latitude: null,
      longitude: null,
      sizes: ["MD"],
      dogLimit: 8,
      startDate: "",
      endDate: "",
      description: "",
      autoEnd: true,
      petRequirements: [],
      tags: [],
    },
  });

  // Pre-fill form when activity loads
  useEffect(() => {
    if (!activity) return;
    const knownTypes = [
      ...PERSONAL_ACTIVITY_TYPES,
      ...BUSINESS_ACTIVITY_TYPES,
    ].map((t) => t.id);
    const isCustomType = !knownTypes.includes(activity.type);

    reset({
      title: activity.title ?? "",
      type: isCustomType ? "custom" : (activity.type ?? "park"),
      customType: isCustomType ? activity.type : "",
      locationName: activity.locationName ?? "",
      latitude: activity.latitude ?? null,
      longitude: activity.longitude ?? null,
      sizes: activity.sizes ?? ["MD"],
      dogLimit: activity.amountOfAttendees ?? 8,
      startDate: activity.startDate
        ? toLocalDateTimeString(new Date(activity.startDate))
        : "",
      endDate: activity.endDate
        ? toLocalDateTimeString(new Date(activity.endDate))
        : "",
      description: activity.description ?? "",
      autoEnd: activity.autoEnd ?? true,
      petRequirements: activity.petRequirements ?? [],
      tags: activity.tags ?? [],
    });
  }, [activity, reset]);

  const activityType = useWatch({ control, name: "type" });
  const watchStartDate = useWatch({ control, name: "startDate" });
  const watchEndDate = useWatch({ control, name: "endDate" });
  const isBusiness = activity?.hostType === "business";
  const isLove = activityType === "love";

  if (isLoading) return <SpinLoader title="Loading activity" />;
  if (isPending) return <SpinLoader title="Saving changes" />;

  const allTypes = isBusiness ? BUSINESS_ACTIVITY_TYPES : PERSONAL_ACTIVITY_TYPES;

  const onSubmit = async ({
    dogLimit,
    customType,
    autoEnd,
    petRequirements,
    image: _image,
    ...data
  }: ActivityForm) => {
    const resolvedType =
      data.type === "custom" ? customType.trim() || "custom" : data.type;

    // Upload new cover image if one was selected, otherwise keep existing URL
    let image: string | undefined =
      typeof _image === "string" ? _image : undefined;
    if (coverFiles.length > 0) {
      const urls = await uploadActivityImages(coverFiles);
      if (urls[0]) image = urls[0];
    }

    updateActivity(
      {
        ...data,
        type: resolvedType,
        autoEnd,
        petRequirements,
        amountOfAttendees: dogLimit,
        ...(image && { image }),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
      },
      {
        onSuccess: () => {
          toast("Activity updated successfully!", "success");
          router.push(`/activity/${id}`);
        },
        onError: () => toast("Failed to update activity.", "error"),
      },
    );
  };

  return (
    <div
      className={clsx(
        "min-h-dvh w-full transition-colors duration-300",
        isLove ? "bg-rose-50" : "bg-[#f7f7f6]",
      )}
    >
      <div className="flex flex-col w-full">
        {/* Header */}
        <div
          className={clsx(
            "flex items-center px-4 py-3 border-b sticky top-0 z-10 transition-colors",
            isLove
              ? "bg-rose-50/90 border-rose-200 backdrop-blur-md"
              : "border-[rgba(225,207,183,0.2)] bg-[#f7f7f6]",
          )}
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[#1e293b]">
              arrow_back
            </span>
          </button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
              Edit Activity
            </h1>
            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              {activity?.title}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="pb-16">
          <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-5">

            {/* Cover photo */}
            <div>
              {activity?.image && coverFiles.length === 0 && (
                <div className="mb-2 w-full h-44 rounded-2xl overflow-hidden">
                  <Image
                    src={activity.image}
                    alt="Current cover"
                    width={600}
                    height={176}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <PhotoUpload
                multiple
                files={coverFiles}
                onChange={setCoverFiles}
              />
            </div>

            {/* Title */}
            <Controller
              control={control}
              name="title"
              rules={{ required: "Activity title is required." }}
              render={({ field }) => (
                <div>
                  <label className={labelClass}>
                    Activity Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name your activity"
                    className={clsx(
                      inputClass,
                      errors.title && "border-red-400 focus:border-red-400 focus:ring-red-100",
                    )}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors.title && (
                    <p className="text-[11px] text-red-500 mt-1 ml-0.5">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Activity type */}
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div>
                  <label className={labelClass}>Activity Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {allTypes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => field.onChange(t.id)}
                        className={clsx(
                          "flex flex-col items-center gap-1 rounded-2xl border py-3 transition-all",
                          field.value === t.id
                            ? "bg-[#e2cfb7] border-[#e2cfb7]"
                            : "bg-white border-[#e2e8f0] hover:border-[#e2cfb7]",
                        )}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <p className="text-[12px] font-bold text-[#1e293b]">
                          {t.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
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
                    errors.customType && "border-red-400 focus:border-red-400 focus:ring-red-100",
                  )}
                  {...register("customType", {
                    validate: (v) =>
                      activityType !== "custom" ||
                      !!v.trim() ||
                      "Please enter a custom activity name.",
                  })}
                />
              </div>
            )}

            {/* Tags */}
            <Controller
              control={control}
              name="tags"
              render={({ field }) => {
                const tagList = ACTIVITY_TAGS[activityType] ?? [];
                if (tagList.length === 0) return <></>;
                return (
                  <div>
                    <label className={labelClass}>Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {tagList.map((tag) => {
                        const selected = field.value.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((t) => t !== tag)
                                  : [...field.value, tag],
                              )
                            }
                            className={clsx(
                              "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all",
                              selected
                                ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                                : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#e2cfb7]",
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />

            {/* Location */}
            <div>
              <LocationAutoComplete
                onSelect={(loc) => {
                  setValue("locationName", loc.locationName, { shouldValidate: true });
                  setValue("latitude", loc.latitude);
                  setValue("longitude", loc.longitude);
                }}
                registration={register("locationName", { required: "Location is required." })}
                required
                error={errors.locationName ? new Error(errors.locationName.message) : undefined}
              />
              {errors.locationName && (
                <p className="text-[11px] text-red-500 mt-1 ml-0.5">
                  {errors.locationName.message}
                </p>
              )}
            </div>

            {/* Dates */}
            {isBusiness ? (
              <>
                {/* Schedule mode toggle */}
                <div className="flex rounded-xl overflow-hidden border border-[rgba(226,207,183,0.4)] bg-white">
                  {(["dateRange", "scheduler"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setScheduleMode(mode)}
                      className={clsx(
                        "flex-1 py-3 text-[13px] font-semibold transition-colors",
                        scheduleMode === mode
                          ? "bg-[#e2cfb7] text-[#1e293b]"
                          : "text-[#94a3b8]",
                      )}
                    >
                      {mode === "dateRange" ? "Date Range" : "Weekly Schedule"}
                    </button>
                  ))}
                </div>
                {scheduleMode === "scheduler" ? (
                  <BusinessDateSlotPicker
                    weekdaySlots={weekdaySlots}
                    onChange={setWeekdaySlots}
                  />
                ) : (
                  <DateRangeCalendar
                    startDate={watchStartDate}
                    endDate={watchEndDate}
                    onStartChange={(v) => setValue("startDate", v, { shouldValidate: true })}
                    onEndChange={(v) => setValue("endDate", v, { shouldValidate: true })}
                  />
                )}
              </>
            ) : (
              <DateRangeCalendar
                isSingleDate={isLove}
                startDate={watchStartDate}
                endDate={watchEndDate}
                onStartChange={(v) => setValue("startDate", v, { shouldValidate: true })}
                onEndChange={(v) => setValue("endDate", v, { shouldValidate: true })}
              />
            )}

            {/* Pet requirements */}
            {!isLove && (
              <Controller
                control={control}
                name="petRequirements"
                render={({ field }) => (
                  <div>
                    <label className={labelClass}>Pet Requirements</label>
                    <div className="flex flex-wrap gap-2">
                      {PET_REQUIREMENT_OPTIONS.map((req) => {
                        const selected = field.value.includes(req);
                        return (
                          <button
                            key={req}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((r) => r !== req)
                                  : [...field.value, req],
                              )
                            }
                            className={clsx(
                              "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all",
                              selected
                                ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                                : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#e2cfb7]",
                            )}
                          >
                            {req}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Dog sizes */}
            {!isLove && (
              <Controller
                control={control}
                name="sizes"
                render={({ field }) => (
                  <div>
                    <label className={labelClass}>Accepted Dog Sizes</label>
                    <div className="flex gap-2 flex-wrap">
                      {SIZE_OPTIONS.map((s) => {
                        const selected = field.value.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((x) => x !== s)
                                  : [...field.value, s],
                              )
                            }
                            className={clsx(
                              "w-14 h-14 rounded-2xl border text-[13px] font-bold transition-all",
                              selected
                                ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                                : "bg-white border-[#e2e8f0] text-[#94a3b8] hover:border-[#e2cfb7]",
                            )}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Dog limit (personal only) */}
            {!isLove && !isBusiness && (
              <Controller
                control={control}
                name="dogLimit"
                render={({ field }) => (
                  <div>
                    <label className={labelClass}>Max Dogs</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                        className="w-10 h-10 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white flex items-center justify-center text-[#1e293b] hover:bg-[rgba(226,207,183,0.2)]"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
                      </button>
                      <span className="text-[20px] font-bold text-[#1e293b] w-8 text-center">
                        {field.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value + 1)}
                        className="w-10 h-10 rounded-xl border border-[rgba(226,207,183,0.4)] bg-white flex items-center justify-center text-[#1e293b] hover:bg-[rgba(226,207,183,0.2)]"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                      </button>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Description */}
            <Controller
              control={control}
              name="description"
              rules={{ required: "Description is required." }}
              render={({ field }) => (
                <div>
                  <label className={labelClass}>
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your activity…"
                    className={clsx(
                      "w-full rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 py-3 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)] resize-none",
                      errors.description && "border-red-400 focus:border-red-400 focus:ring-red-100",
                    )}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors.description && (
                    <p className="text-[11px] text-red-500 mt-1 ml-0.5">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Save button */}
            <button
              type="submit"
              className="w-full h-14 rounded-[14px] bg-[#1e293b] text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] mb-2"
            >
              <span className="material-symbols-outlined">save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
