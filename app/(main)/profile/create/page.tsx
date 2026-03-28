"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { clsx } from "clsx";
import { useToast } from "@/components/Toast";
import {
  Gender,
  PetAgeGroup,
  PetEnergyLevel,
  PetSizeCategory,
  useCreatePetProfile,
  useDetectPet,
} from "@/lib/queries";
import Spinner from "@/components/Spinner";
import LocationAutoComplete from "@/components/LocationAutocomplete";
import PhotoUpload from "@/components/PhotoUpload";

type PetFormValues = {
  name: string;
  image: File | null;
  breed: string;
  color: string;
  gender: Gender;
  locationName: string;
  latitude: number;
  longitude: number;
  dateOfBirth: string;
  ageGroup: PetAgeGroup;
  weight: number;
  size: PetSizeCategory;
  bio: string;
  energyLevel?: PetEnergyLevel;
  emotions?: string[];
  socialStyle?: string;
  behaviorTraits?: string[];
  goodWith?: string[];
  considerNotes?: string;
};

const SIZE_LABELS: Record<PetSizeCategory, string> = {
  XS: "Extra Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Extra Large",
};

const AGE_OPTIONS: { [key in PetAgeGroup]: string } = {
  Puppy: "Puppy (< 1 yr)",
  Young: "Young (1–3 yrs)",
  Adult: "Adult (3–8 yrs)",
  Senior: "Senior (8+ yrs)",
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

/* ── Page ── */

export default function CreatePetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [isDetecting, setIsDetecting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const photoPreview = photo ? URL.createObjectURL(photo) : undefined;

  const { mutateAsync: detectPet } = useDetectPet();
  const { mutate: createPetProfile } = useCreatePetProfile();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PetFormValues>({
    mode: "onBlur",
    defaultValues: {
      gender: Gender.Other,
      ageGroup: PetAgeGroup.Adult,
      size: "MD",
    },
  });

  const onSubmit = (data: PetFormValues) => {
    createPetProfile({
      ...data,
      image: photo!,
      dateOfBirth: new Date(data.dateOfBirth),
    });
    toast(`${data.name} has been registered!`, "success");
    router.back();
  };

  const handlePhotoSelected = async (file: File) => {
    setPhoto(file);
    setIsDetecting(true);
    try {
      const {
        breed,
        color,
        gender,
        size,
        ageGroup,
        weight,
        energyLevel,
        emotions,
        socialStyle,
        behaviorTraits,
        goodWith,
        considerNotes,
      } = await detectPet(file);
      setValue("breed", breed, { shouldValidate: true, shouldDirty: true });
      setValue("color", color, { shouldDirty: true });
      setValue("gender", gender as Gender, { shouldDirty: true });
      setValue("size", size as PetSizeCategory, { shouldDirty: true });
      setValue("ageGroup", ageGroup as PetAgeGroup, { shouldDirty: true });
      setValue("energyLevel", energyLevel, { shouldDirty: true });
      setValue("emotions", emotions, { shouldDirty: true });
      setValue("socialStyle", socialStyle, { shouldDirty: true });
      setValue("behaviorTraits", behaviorTraits, { shouldDirty: true });
      setValue("goodWith", goodWith, { shouldDirty: true });
      setValue("considerNotes", considerNotes, { shouldDirty: true });
      if (weight) setValue("weight", weight, { shouldDirty: true });
      setStep(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not detect pet.";
      toast(message, "error");
      setPhoto(null);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center px-4 py-3 border-b border-[rgba(226,207,183,0.2)] gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </button>
        <div className="flex-1 flex flex-col items-center pr-10">
          <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
            Register Your Pet
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className={clsx(
                "h-1.5 w-8 rounded-full transition-all",
                step >= 1 ? "bg-[#e2cfb7]" : "bg-[#e2e8f0]",
              )}
            />
            <div
              className={clsx(
                "h-1.5 w-8 rounded-full transition-all",
                step >= 2 ? "bg-[#e2cfb7]" : "bg-[#e2e8f0]",
              )}
            />
          </div>
        </div>
      </header>

      {/* ── Step 1: Upload photo ── */}
      {step === 1 && (
        <div className="flex flex-col flex-1 max-w-lg w-full mx-auto px-4 py-8">
          {isDetecting ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-6">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-[rgba(226,207,183,0.4)] shadow-sm">
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Uploaded pet"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Spinner />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[17px] font-bold text-[#1e293b]">
                  Analysing your pet…
                </p>
                <p className="text-[13px] text-[#64748b] mt-1">
                  Our AI is detecting breed, size & personality
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-[22px] font-bold text-[#1e293b] tracking-tight">
                  Upload a photo
                </h2>
                <p className="text-[14px] text-[#64748b] mt-1">
                  Our AI will auto-fill your pet&apos;s details — breed, size,
                  personality and more.
                </p>
              </div>

              <PhotoUpload
                photoPreview={photoPreview}
                onFileChange={handlePhotoSelected}
                onRemove={() => setPhoto(null)}
              />

              <p className="text-[11px] text-[#94a3b8] italic mt-3 px-1">
                Tip: Use a clear, well-lit front-facing photo for the best
                detection results.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Step 2: Review & complete ── */}
      {step === 2 && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pb-32"
        >
          <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">
            {/* Photo thumbnail + detected badge */}
            {photoPreview && (
              <div className="flex items-center gap-3 bg-white border border-[rgba(226,207,183,0.4)] rounded-2xl p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Pet photo"
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="material-symbols-outlined text-[#e2cfb7]"
                      style={{ fontSize: 14 }}
                    >
                      auto_awesome
                    </span>
                    <span className="text-[11px] font-bold text-[#e2cfb7] uppercase tracking-wider">
                      AI Detected
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748b]">
                    Review and correct the fields below, then add your
                    pet&apos;s name.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="shrink-0 text-[11px] font-semibold text-[#94a3b8] hover:text-[#64748b] underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* ── Pet Name (first — most important) ── */}
            <div className="flex flex-col gap-2">
              <SectionTitle>Pet Name</SectionTitle>
              <input
                placeholder="What's your pet's name?"
                {...register("name", { required: "Pet name is required." })}
                className={clsx(
                  inputClass,
                  errors.name ? inputError : inputValid,
                )}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* ── Breed & Appearance ── */}
            <div className="flex flex-col gap-4">
              <SectionTitle>Breed & Appearance</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Breed</FieldLabel>
                  <input
                    placeholder="e.g. Golden Retriever"
                    {...register("breed", { required: "Breed is required." })}
                    className={clsx(
                      inputClass,
                      errors.breed ? inputError : inputValid,
                    )}
                  />
                  <FieldError message={errors.breed?.message} />
                </div>
                <div>
                  <FieldLabel>Primary Color</FieldLabel>
                  <input
                    placeholder="e.g. Golden / Cream"
                    {...register("color")}
                    className={clsx(inputClass, inputValid)}
                  />
                </div>
              </div>
            </div>

            {/* ── Pet Details ── */}
            <div className="flex flex-col gap-4">
              <SectionTitle>Pet Details</SectionTitle>

              {/* Gender */}
              <div>
                <FieldLabel>Gender</FieldLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-3">
                      {(["Male", "Female"] as Gender[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => field.onChange(g)}
                          className={clsx(
                            "flex-1 py-3 px-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 border transition-all",
                            field.value === g
                              ? "bg-[#e2cfb7] border-[#e2cfb7] text-[#1e293b]"
                              : "bg-white border-[rgba(226,207,183,0.4)] text-[#64748b] hover:border-[#e2cfb7]",
                          )}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            {g === "Male" ? "male" : "female"}
                          </span>
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Birthday */}
              <label className="flex flex-col">
                <FieldLabel>Birthday</FieldLabel>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className={clsx(inputClass, inputValid)}
                />
              </label>

              {/* Age & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Age Group</FieldLabel>
                  <div className="relative">
                    <select
                      {...register("ageGroup")}
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-[rgba(226,207,183,0.5)] bg-white text-[#1e293b] text-[13px] font-medium appearance-none focus:outline-none focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)] transition"
                    >
                      {Object.entries(AGE_OPTIONS).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <span
                      className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[#94a3b8]"
                      style={{ fontSize: 20 }}
                    >
                      expand_more
                    </span>
                  </div>
                </div>

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
              </div>

              {/* Size */}
              <div>
                <FieldLabel>Size Category</FieldLabel>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex gap-2">
                        {(Object.keys(SIZE_LABELS) as PetSizeCategory[]).map(
                          (s) => (
                            <button
                              key={s}
                              type="button"
                              title={SIZE_LABELS[s]}
                              onClick={() => field.onChange(s)}
                              className={clsx(
                                "flex-1 h-11 rounded-xl font-bold text-[13px] border transition-all",
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
                      <p className="text-[11px] text-[#94a3b8] mt-1.5 px-0.5">
                        Selected:{" "}
                        <span className="font-semibold text-[#64748b]">
                          {SIZE_LABELS[field.value]}
                        </span>
                      </p>
                    </>
                  )}
                />
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
                  placeholder="Tell the pack about your pet's personality, favorite activities, quirks..."
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
          </div>
        </form>
      )}

      {/* ── Sticky submit bar (step 2 only) ── */}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#f7f7f6]/90 backdrop-blur-md border-t border-[rgba(226,207,183,0.2)] px-4 py-4">
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid}
              className="w-full bg-[#1e293b] disabled:bg-[#cbd5e1] text-white disabled:text-[#94a3b8] font-bold py-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                pets
              </span>
              Register Pet
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                chevron_right
              </span>
            </button>
            <p className="text-center text-[10px] text-[#94a3b8] leading-relaxed px-4">
              By registering, you agree to our Terms of Service and Pet Registry
              Guidelines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
