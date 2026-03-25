"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { clsx } from "clsx";
import { validatePassword } from "@/lib/validation";

const inputClass =
  "h-14 rounded-[14px] border border-[rgba(226,207,183,0.4)] bg-white px-4 text-[15px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]";

type FormValues = { email: string; password: string };

interface EmailFieldProps {
  onSubmit: (email: string, password: string) => void;
  buttonLabel?: string;
  serverError?: string;
  isPasswordValidating?: boolean;
  hidePassword?: boolean;
}

export default function EmailField({
  onSubmit,
  buttonLabel = "Continue with Email",
  serverError,
  isPasswordValidating = false,
  hidePassword = false,
}: EmailFieldProps) {
  const {
    register,
    unregister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onBlur" });

  // When password is hidden, unregister it so RHF drops all validation rules.
  useEffect(() => {
    if (hidePassword) unregister("password");
  }, [hidePassword, unregister]);

  const submit = (data: FormValues) => {
    // When password is hidden, derive a stable placeholder so the same email
    // always produces the same credential (email-only / beta mode).
    const password = hidePassword ? `__beta__${data.email}` : data.password;
    onSubmit(data.email, password);
  };

  // First field error wins; server error shows when no local errors
  const displayError =
    errors.email?.message ?? (hidePassword ? "" : errors.password?.message ?? "") ?? serverError ?? "";

  return (
    <>
      <label className="text-[13px] font-semibold text-[#334155] mb-2 ml-1">
        Email address
      </label>
      <input
        type="email"
        placeholder="Enter your email"
        {...register("email", {
          required: "Email is required.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address.",
          },
        })}
        className={clsx(
          inputClass,
          "mb-1",
          errors.email && "border-red-400 focus:border-red-400 focus:ring-red-100",
        )}
      />

      {!hidePassword && (
        <>
          <label className="text-[13px] font-semibold text-[#334155] mb-2 ml-1 mt-3">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required.",
              validate: isPasswordValidating
                ? (val) => {
                    const { valid, error } = validatePassword(val);
                    return valid || error || "Invalid password.";
                  }
                : undefined,
            })}
            className={clsx(
              inputClass,
              "mb-1",
              errors.password && "border-red-400 focus:border-red-400 focus:ring-red-100",
            )}
          />
        </>
      )}

      {displayError ? (
        <p className="text-[12px] text-red-500 mb-3 ml-1">{displayError}</p>
      ) : (
        <div className="mb-4" />
      )}

      <button
        onClick={handleSubmit(submit)}
        className="h-14 rounded-[14px] bg-[#e2cfb7] flex items-center justify-center mt-2 shadow-sm hover:opacity-90 transition-opacity w-full"
      >
        <span className="text-[17px] font-bold text-[#1e293b]">{buttonLabel}</span>
      </button>
    </>
  );
}
