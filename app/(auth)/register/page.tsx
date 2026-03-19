"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmailField from "@/components/auth/EmailField";
import { useRegister } from "@/lib/queries";
import Spinner from "@/components/Spinner";
import { useRequireGuest } from "@/lib/hooks";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: register, isPending, error } = useRegister();
  const { isLoading: checkingAuth } = useRequireGuest();

  const handleSubmit = (email: string, password: string) => {
    register(
      { email, password },
      {
        onSuccess: () => {
          toast("Account created! Welcome to PawFriends.", "success");
          router.push("/");
        },
        onError: (err) => toast(err.message || "Registration failed.", "error"),
      },
    );
  };

  if (isPending || checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-5">
        {/* Spinner */}
        <Spinner />
        <div className="text-center">
          <p className="text-[16px] font-bold text-[#1e293b]">Signing up</p>
          <p className="text-[13px] text-[#64748b] mt-1">
            Fetching your pack&hellip;
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop heading */}
      <div className="hidden md:block px-6 pt-2 pb-2">
        <h2 className="text-[26px] font-extrabold text-[#1e293b] tracking-tight mb-1">
          Create your account
        </h2>
        <p className="text-[14px] font-medium text-[#64748b]">
          Join the pack — it&apos;s free forever.
        </p>
      </div>

      {/* Form */}
      <div className="px-6 pt-6 flex flex-col gap-0">
        <EmailField
          onSubmit={handleSubmit}
          serverError={error?.message}
          isPasswordValidating
        />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#e2e8f0]" />
          <span className="text-[10px] font-bold text-[#94a3b8] tracking-widest">
            OR SIGN UP WITH
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
      </div>

      {/* Footer */}
      <div className="px-6 pt-8 pb-10 flex flex-col items-center gap-4">
        <p className="text-[14px] font-medium text-[#64748b]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#1e293b]">
            Log in
          </Link>
        </p>
        <p className="text-[11px] text-[#94a3b8] text-center leading-4 px-4">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span>
          {" and "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </>
  );
}
