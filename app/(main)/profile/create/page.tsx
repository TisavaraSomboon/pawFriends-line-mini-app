"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller, set } from "react-hook-form";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const photoPreview = photo ? URL.createObjectURL(photo) : null;

  const { mutateAsync: detectPet, isPending: isDetecting } = useDetectPet();
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
  };

  const onSubmit = (data: PetFormValues) => {
    createPetProfile({
      ...data,
      image: photo!,
      dateOfBirth: new Date(data.dateOfBirth),
    });
    toast(`${data.name} has been registered!`, "success");
    router.back();
  };

  useEffect(() => {
    const handleDetect = async () => {
      if (!photo) return;
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
        } = await detectPet(photo);
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
        toast("Pet details detected!", "success");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not detect pet.";
        toast(message, "error");
      }
    };
    if (photo) {
      handleDetect();
    }
  }, [photo]);

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
          Register Your Pet
        </h1>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">
          {/* ── Photo upload ── */}
          <div className="flex flex-col gap-2">
            <SectionTitle>Pet Photo</SectionTitle>
            <p className="text-[12px] text-[#64748b] -mt-1">
              Upload a clear photo of your pet for profile identification.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
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
                <div className="absolute top-3 left-3 bg-[#e2cfb7] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span
                    className="material-symbols-outlined text-[#1e293b]"
                    style={{ fontSize: 14 }}
                  >
                    auto_awesome
                  </span>
                  <span className="text-[#1e293b] text-[10px] font-bold uppercase tracking-wider">
                    Scan Ready
                  </span>
                </div>
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
            <p className="text-[10px] text-[#94a3b8] italic px-1">
              Tip: Clear, well-lit photos help other pack members recognize your
              pet.
            </p>
          </div>

          {isDetecting ? (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-5">
              {/* Spinner */}
              <Spinner />
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#1e293b]">
                  Detecting
                </p>
                <p className="text-[13px] text-[#64748b] mt-1">
                  Fetching your pack&hellip;
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Breed & Appearance ── */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <SectionTitle>Breed & Appearance</SectionTitle>
                  {photoPreview && (
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#e2cfb7] bg-[rgba(226,207,183,0.15)] border border-[rgba(226,207,183,0.3)] px-2 py-1 rounded-full hover:bg-[rgba(226,207,183,0.25)] transition-all disabled:opacity-50">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 12 }}
                      >
                        auto_awesome
                      </span>
                      Detect
                    </div>
                  )}
                </div>

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

                {/* Name */}
                <div>
                  <FieldLabel required>Pet Name</FieldLabel>
                  <input
                    placeholder="What's your pet's name?"
                    {...register("name", {
                      required: "Pet name is required.",
                    })}
                    className={clsx(
                      inputClass,
                      errors.name ? inputError : inputValid,
                    )}
                  />
                  <FieldError message={errors.name?.message} />
                </div>

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
                        className={clsx(
                          "w-full h-12 pl-4 pr-10 rounded-xl border border-[rgba(226,207,183,0.5)] bg-white text-[#1e293b] text-[13px] font-medium appearance-none focus:outline-none focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)] transition",
                        )}
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
            </>
          )}
        </div>
      </form>

      {/* ── Sticky submit bar ── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#f7f7f6]/90 backdrop-blur-md border-t border-[rgba(226,207,183,0.2)] px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <button
            type="submit"
            form="pet-form"
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
    </div>
  );
}
