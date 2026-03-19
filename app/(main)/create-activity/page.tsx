"use client";
import { useState } from "react";
import { useForm, Controller, UseFormRegisterReturn } from "react-hook-form";
import { clsx } from "clsx";
import Link from "next/link";
import Footer from "@/components/MobileFooter";
import CoverPhotoPicker from "@/components/CoverPhotoPicker";
import {
  useAuthUser,
  useCreateActivity,
  useGeneratePhoto,
  useIncrementAiPhotoCount,
} from "@/lib/queries";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import Spinner from "@/components/Spinner";
import SpinLoader from "@/components/SpinLoader";

const ACTIVITY_TYPES = [
  { id: "park", icon: "🌳", label: "Park Run" },
  { id: "playdate", icon: "🐾", label: "Playdate" },
  { id: "training", icon: "🎓", label: "Training" },
  { id: "swimming", icon: "🏊", label: "Swimming" },
  { id: "hiking", icon: "🥾", label: "Hiking" },
  { id: "agility", icon: "🏆", label: "Agility" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "All Sizes"];

const labelClass = "text-[13px] font-semibold text-[#334155] mb-2 block ml-1";
const inputClass =
  "w-full h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";

type ActivityForm = {
  image: File | string;
  title: string;
  type: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  sizes: string[];
  dogLimit: number;
  startDate: string;
  endDate: string;
  description: string;
};

export default function CreateActivityPage() {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [selectedAiUrl, setSelectedAiUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
      locationName: "",
      latitude: null,
      longitude: null,
      sizes: ["All Sizes"],
      dogLimit: 8,
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  if (isPending) return <SpinLoader title="Creating the activity" />;

  const onSubmit = (data: ActivityForm) => {
    createActivity(
      {
        ...data,
        image: coverFile ?? selectedAiUrl ?? undefined,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
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
          {/* ── Mobile layout: single column ── */}
          <div className="md:hidden px-4 pt-5 flex flex-col gap-5">
            <CoverPhotoPicker {...coverPickerProps} />
            <TitleField
              registration={register("title", {
                required: "Activity title is required.",
              })}
              error={errors.title?.message}
            />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ActivityTypeSection
                  value={field.value}
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
            <DateRangeSection
              startDateReg={register("startDate", {
                required: "Start date is required.",
              })}
              endDateReg={register("endDate", {
                required: "End date is required.",
              })}
              startError={errors.startDate?.message}
              endError={errors.endDate?.message}
            />
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
                <DogLimitSection
                  value={field.value}
                  onChange={field.onChange}
                />
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

          {/* ── Desktop layout: two columns ── */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-8 px-8 pt-8">
            {/* Left col */}
            <div className="flex flex-col gap-6">
              <CoverPhotoPicker {...coverPickerProps} />
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
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-6">
              <TitleField
                registration={register("title", {
                  required: "Activity title is required.",
                })}
                error={errors.title?.message}
              />
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <ActivityTypeSection
                    value={field.value}
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
              <DateRangeSection
                startDateReg={register("startDate", {
                  required: "Start date is required.",
                })}
                endDateReg={register("endDate", {
                  required: "End date is required.",
                })}
                startError={errors.startDate?.message}
                endError={errors.endDate?.message}
              />
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

/* ── Sub-components ── */

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

function ActivityTypeSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>Activity Type</label>
      <div className="grid grid-cols-3 gap-2">
        {ACTIVITY_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`h-18 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
              value === type.id
                ? "bg-[#1e293b] border-[#1e293b]"
                : "bg-white border-[#e2e8f0]"
            }`}
          >
            <span className="text-2xl">{type.icon}</span>
            <span
              className={`text-[11px] font-bold ${value === type.id ? "text-white" : "text-[#334155]"}`}
            >
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateRangeSection({
  startDateReg,
  endDateReg,
  startError,
  endError,
}: {
  startDateReg: UseFormRegisterReturn;
  endDateReg: UseFormRegisterReturn;
  startError?: string;
  endError?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelClass}>
          Start <span className="text-red-400">*</span>
        </label>
        <input
          type="datetime-local"
          className={clsx(
            inputClass,
            startError &&
              "border-red-400 focus:border-red-400 focus:ring-red-100",
          )}
          {...startDateReg}
        />
        {startError && (
          <p className="text-[11px] text-red-500 mt-1 ml-0.5">{startError}</p>
        )}
      </div>
      <div>
        <label className={labelClass}>
          End (Expiry) <span className="text-red-400">*</span>
        </label>
        <input
          type="datetime-local"
          className={clsx(
            inputClass,
            endError &&
              "border-red-400 focus:border-red-400 focus:ring-red-100",
          )}
          {...endDateReg}
        />
        {endError && (
          <p className="text-[11px] text-red-500 mt-1 ml-0.5">{endError}</p>
        )}
      </div>
    </div>
  );
}

function DogSizeSection({
  value,
  onChange,
}: {
  value: string[];
  onChange: (sizes: string[]) => void;
}) {
  const toggle = (size: string) => {
    if (size === "All Sizes") {
      onChange(["All Sizes"]);
      return;
    }
    const filtered = value.filter((s) => s !== "All Sizes");
    onChange(
      filtered.includes(size)
        ? filtered.filter((s) => s !== size)
        : [...filtered, size],
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
      {error && <p className="text-[11px] text-red-500 mt-1 ml-0.5">{error}</p>}
    </div>
  );
}
