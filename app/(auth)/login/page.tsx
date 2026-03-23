"use client";

import { useState } from "react";
import Link from "next/link";
import EmailField from "@/components/auth/EmailField";
import OtpInput from "@/components/auth/OtpInput";
import { useLogin, useSendOtp, useVerifyOtp } from "@/lib/queries";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useRequireGuest } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import { FLAGS } from "@/lib/flags";

type Step = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: sendOtp, isPending: isSending } = useSendOtp();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { isLoading: checkingAuth } = useRequireGuest();

  const [step, setStep] = useState<Step>("form");
  const [pending, setPending] = useState<{ email: string; password: string } | null>(null);
  const [otpError, setOtpError] = useState("");

  function handleFormSubmit(email: string, password: string) {
    if (!FLAGS.OTP_VERIFICATION) {
      // POC: skip OTP, go straight to login
      login(
        { email, password },
        {
          onSuccess: (user) => {
            toast(`Welcome back${user.name ? `, ${user.name}` : ""}!`, "success");
            router.push("/");
          },
          onError: (err) => toast(err.message || "Login failed.", "error"),
        },
      );
      return;
    }

    sendOtp(email, {
      onSuccess: () => {
        setPending({ email, password });
        setStep("otp");
      },
      onError: (err) => toast(err.message || "Failed to send code.", "error"),
    });
  }

  function handleOtpComplete(code: string) {
    if (!pending || code.length !== 6) return;
    setOtpError("");
    verifyOtp(
      { email: pending.email, code },
      {
        onSuccess: () => {
          login(pending, {
            onSuccess: (user) => {
              toast(`Welcome back${user.name ? `, ${user.name}` : ""}!`, "success");
              router.push("/");
            },
            onError: (err) => toast(err.message || "Login failed.", "error"),
          });
        },
        onError: (err) => setOtpError(err.message || "Invalid code."),
      },
    );
  }

  if (isSending || isLoggingIn || checkingAuth)
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-5">
        <Spinner />
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#1e293b]">
            {isSending ? "Sending code…" : "Signing you in"}
          </p>
          <p className="text-[13px] text-[#64748b] mt-1">
            {isSending ? "Check your inbox shortly." : "Fetching your pack\u2026"}
          </p>
        </div>
      </div>
    );

  return (
    <>
      {/* Desktop heading */}
      <div className="hidden md:block px-6 pt-2 pb-2">
        <h2 className="text-[26px] font-extrabold text-[#1e293b] tracking-tight mb-1">
          {step === "form" ? "Welcome back" : "Check your email"}
        </h2>
        <p className="text-[14px] font-medium text-[#64748b]">
          {step === "form"
            ? "Sign in to continue to PawFriends"
            : "Enter the 6-digit code we sent you"}
        </p>
      </div>

      {/* Form / OTP */}
      <div className="px-6 pt-6 flex flex-col gap-0">
        {step === "form" || !FLAGS.OTP_VERIFICATION ? (
          <>
            <EmailField onSubmit={handleFormSubmit} />

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#e2e8f0]" />
              <span className="text-[10px] font-bold text-[#94a3b8] tracking-widest">
                OR CONTINUE WITH
              </span>
              <div className="flex-1 h-px bg-[#e2e8f0]" />
            </div>

            {/* Social Buttons */}
            <div className="flex gap-3">
              <Link
                href="/agents"
                className="flex-1 h-14 rounded-[14px] border border-[#e2e8f0] bg-white flex items-center justify-center gap-2.5 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-[18px] font-bold text-[#4285F4]">G</span>
                <span className="text-[15px] font-bold text-[#334155]">Google</span>
              </Link>
              <Link
                href="/agents"
                className="flex-1 h-14 rounded-[14px] border border-[#e2e8f0] bg-white flex items-center justify-center gap-2.5 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">📱</span>
                <span className="text-[15px] font-bold text-[#334155]">Phone</span>
              </Link>
            </div>
          </>
        ) : (
          <OtpInput
            email={pending!.email}
            onComplete={handleOtpComplete}
            onBack={() => setStep("form")}
            isVerifying={isVerifying}
            error={otpError}
          />
        )}
      </div>

      {/* Footer */}
      {(step === "form" || !FLAGS.OTP_VERIFICATION) && (
        <div className="px-6 pt-8 pb-10 flex flex-col items-center gap-4">
          <p className="text-[14px] font-medium text-[#64748b]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-[#1e293b]">
              Sign up
            </Link>
          </p>
          <p className="text-[11px] text-[#94a3b8] text-center leading-4 px-4">
            By continuing, you agree to our{" "}
            <span className="underline">Terms of Service</span>
            {" and "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      )}
    </>
  );
}
