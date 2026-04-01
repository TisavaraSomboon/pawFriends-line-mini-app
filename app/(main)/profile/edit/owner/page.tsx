"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { clsx } from "clsx";
import {
  useUpdateProfile,
  useIncrementAiPhotoCount,
  useProfile,
  useGeneratePhoto,
} from "@/lib/queries";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import CoverPhotoPicker from "@/components/CoverPhotoPicker";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import SpinLoader from "@/components/SpinLoader";

/* ── Types ── */
type Gender = "Male" | "Female" | "Other";

type ProfileFormValues = {
  name: string;
  bio: string;
  locationName: string;
  latitude: number;
  longitude: number;
  gender: Gender;
  dateOfBirth: string;
};

/* ── Shared style tokens ── */
const inputClass =
  "w-full h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e1cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";
const inputValid =
  "border-[rgba(226,207,183,0.5)] focus:border-[#e2cfb7] focus:ring-[rgba(226,207,183,0.3)]";
const inputError = "border-red-400 focus:border-red-400 focus:ring-red-100";

/* ── Sub-components ── */
function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p className="text-[13px] font-semibold text-[#334155] mb-2 block ml-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-500 mt-1 ml-0.5">{message}</p>;
}

/* ── Page ── */
export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const userId = searchParams.get("userId") ?? undefined;

  const { data: profileInfo, isPending: isUserLoading } = useProfile(userId);

  const userInfo = profileInfo?.user;

  const { mutate: updateProfile, isPending: isSaving } =
    useUpdateProfile(userId);
  const { mutate: incrementAiCount } = useIncrementAiPhotoCount(
    userId,
    "aiProfilePhotoCount",
  );
  const { mutateAsync: generatePhoto } = useGeneratePhoto(
    `dog owner profile portrait by their gender ${userInfo?.gender}. The photo should be a close-up headshot with a warm, friendly vibe, suitable for a social app profile. Always a single person in the image without dog.`,
  );

  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedAiUrl, setSelectedAiUrl] = useState<string | null>(null);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generatePhoto();
      setAiImages(data);
      incrementAiCount(userInfo?.aiProfilePhotoCount ?? 0);
    } finally {
      setIsGenerating(false);
    }
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    mode: "onBlur",
    defaultValues: {
      ...userInfo,
      dateOfBirth: userInfo?.dateOfBirth
        ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0]
        : "",
    },
  });

  // Pre-fill form once auth user data is available (runs once)
  useEffect(() => {
    if (userInfo) {
      reset({
        name: userInfo.name ?? "",
        bio: userInfo.bio ?? "",
        locationName: userInfo.locationName ?? "",
        gender: userInfo.gender ?? "Other",
        dateOfBirth: userInfo.dateOfBirth
          ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0]
          : "",
      });
    }
  }, [userInfo, reset]);

  // useWatch is memoization-safe (unlike watch()) — required by React Compiler
  const nameValue = useWatch({ name: "name", control, defaultValue: "" });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(
      {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        image: photo ?? selectedAiUrl ?? userInfo?.image ?? "",
      },
      {
        onSuccess: () => {
          toast("Profile updated successfully!", "success");
          router.back();
        },
        onError: (err) =>
          toast(err.message || "Failed to save profile.", "error"),
      },
    );
  };

  if (isUserLoading) return <SpinLoader title="Profile loading" />;

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
          Owner Information
        </h1>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="max-w-lg mx-auto px-4 flex flex-col gap-6 mt-10">
          {/* ── Photo section ── */}
          <CoverPhotoPicker
            label="Profile Photo"
            hint="Finalize your profile details below"
            previewUrl={
              photo
                ? URL.createObjectURL(photo)
                : (selectedAiUrl ?? userInfo?.image)
            }
            aiImages={aiImages}
            isGenerating={isGenerating}
            selectedAiUrl={selectedAiUrl}
            usedCount={userInfo?.aiProfilePhotoCount ?? 0}
            onFileChange={handlePhotoChange}
            onAiSelect={(url) => {
              setSelectedAiUrl(url);
              setPhoto(null);
            }}
            onGenerate={handleGenerate}
          />

          {/* ── Full Name ── */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold text-[#334155] mb-2 block ml-1">
                Full Name <span className="text-red-400">*</span>
              </p>
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
              type="text"
              placeholder="Enter your full name"
              {...register("name", {
                required: "Full name is required.",
                maxLength: {
                  value: 25,
                  message: "Name cannot exceed 25 characters.",
                },
              })}
              maxLength={25}
              className={clsx(
                inputClass,
                errors.name ? inputError : inputValid,
              )}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* ── Gender ── */}
          <div>
            <FieldLabel>Gender</FieldLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {(["Male", "Female", "Other"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => field.onChange(g)}
                      className={clsx(
                        "flex-1 py-3 px-4 rounded-xl font-medium text-[14px] border-2 transition-all",
                        field.value === g
                          ? "border-[#e2cfb7] bg-[rgba(226,207,183,0.2)] text-[#1e293b] font-bold"
                          : "border-[rgba(226,207,183,0.3)] bg-[#f7f7f6] text-[#64748b] hover:border-[#e2cfb7]",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* ── Date of Birth ── */}
          <label className="flex flex-col">
            <FieldLabel>Date of Birth</FieldLabel>
            <input
              type="date"
              {...register("dateOfBirth")}
              className={clsx(inputClass, inputValid)}
            />
          </label>

          {/* ── Location ── */}
          <label className="flex flex-col">
            <LocationAutoComplete
              onSelect={(loc) => {
                setValue("locationName", loc.locationName);
                setValue("latitude", loc.latitude);
                setValue("longitude", loc.longitude);
              }}
              registration={register("locationName")}
            />
          </label>

          {/* ── Bio ── */}
          <label className="flex flex-col">
            <FieldLabel>About You</FieldLabel>
            <textarea
              rows={3}
              placeholder="Tell the pack about yourself..."
              {...register("bio", {
                maxLength: { value: 300, message: "Max 300 characters." },
              })}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border bg-white text-[#1e293b] text-[15px] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 transition resize-none leading-relaxed",
                errors.bio ? inputError : inputValid,
              )}
            />
            <FieldError message={errors.bio?.message} />
          </label>
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
