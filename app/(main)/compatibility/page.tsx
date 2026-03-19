"use client";

import Link from "next/link";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4Ngz46KGK94OS_jIYm_JyfKRRKCw9D86jzitVGVGZTV7QvBivjvtfL5pOaYpkCnchC__fUciAMDvBxuIUzzwfM0v9zLhKytWZE_zUUXwzNRgnvudN364WsnqLMrajBP3D02uEkJwLLLn7ac5y4DIiPaK1V-Bc6_iGqxGd-9VOXrS43vx4z5ado0nQEcAGyAxOUYawuOgZYZmNEAS8gHLODqh4hRDCbEy8w47xFLnWPp3Sm1pYQR6ZnQRWP76hC-8w_Pa1DvKTTYE";

const DOG_A =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDS5b4OXDJ8IsGU2uWHjVLm2k_q-vX6J-DfXqn3g1qFLWgnthXt1U8yNOghfl-pdBGt21sihAIqxESDfXDDS914wQ1dr7NLeI_Ozhd2Swp4hi0LxwadD21e9xNJpiz65XCjUQeGvYRUfYyhONN3pQ45hTVrFmpvChwbjaVXZgrq96j_ycYYuDrP_bo-m4wm8TwLTOfqrSWMAMgIs1wjXXyCJ8gJBvsoxWGdDXIz8IiBZi2mc19Ir2MfrHBiAvIjKLEwzBOqMH7kB3-A";

const DOG_B =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCiFMak9TEKkP4gI6X23YPwmGxe1GwtgyGu6uxpQGo9Nf92-ztgti4ifGNGjLJtXyjXErJQDkgoZlzwq5VISvKeilLE7tKO-vbJADSwNr6CRzRZojvG4dYfsWfuJW8jcjjoLhqiQYz22_HRY_b7-y3yctXvzDXiX2DrUtnXf8e5khgaxexcUVyGKGREFIShUiePkeYFZoIRXZDkJOwmpoHwuHIAz4S-Izu7Ab2j8Y7cuMn6zgUTB4wcTIa2yDckuPrPBVrZsFq5OU1d";

function ScoreBar({ score, color }: { score: number; color: "red" | "orange" }) {
  const barColor = color === "red" ? "bg-red-400" : "bg-orange-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-bold text-[#1e293b] w-8 text-right">{score}%</span>
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">

      {/* Top bar */}
      <div className="flex items-center px-4 md:px-8 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] sticky top-0 z-10 gap-3">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[#1e293b]">arrow_back</span>
        </Link>
        <h2 className="text-[17px] text-center w-full font-bold text-[#1e293b] md:text-xl tracking-tight">
          Compatibility Results
        </h2>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pb-8">

        {/* Desktop intro banner */}
        <div className="hidden md:block px-8 py-6 border-b border-[rgba(226,207,183,0.2)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1e293b] mb-1">AI Compatibility Analysis</h1>
              <p className="text-[15px] text-[#64748b]">
                Our AI reviewed this activity against your dog&apos;s profile and found some potential concerns.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#f1f5f9] rounded-2xl px-5 py-3 shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-3xl">shield_with_heart</span>
              <div>
                <p className="text-xs text-[#64748b] font-medium">Overall Score</p>
                <p className="text-2xl font-bold text-[#1e293b]">37%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="px-4 md:px-8 py-4 md:py-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ── Card 1: Size Compatibility Warning ── */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-sm border border-red-100">

              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  <p className="text-[15px] font-bold text-[#1e293b]">Size Compatibility Warning</p>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Mismatch</span>
              </div>

              {/* Score */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-sm font-medium text-[#64748b]">AI Compatibility Score</p>
                </div>
                <ScoreBar score={45} color="red" />
              </div>

              {/* Visual */}
              <div
                className="w-full aspect-video rounded-xl bg-center bg-cover bg-no-repeat grayscale opacity-80"
                style={{ backgroundImage: `url("${HERO_IMG}")` }}
              />

              {/* Message */}
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#1e293b] mb-2">Size Compatibility Warning</p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-sm font-medium text-red-700 leading-relaxed">
                    This activity is specifically for small breeds. Your dog&apos;s size profile (Large) doesn&apos;t meet
                    the primary requirement for this playdate.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full h-12 rounded-xl bg-[#f1f5f9] text-[#1e293b] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[rgba(226,207,183,0.3)] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
                Check Status Updates
              </button>
            </div>

            {/* ── Card 2: Energy Level Mismatch ── */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-sm border border-orange-100">

              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">error</span>
                  <p className="text-[15px] font-bold text-[#1e293b]">Energy Level Mismatch</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">Conflict</span>
              </div>

              {/* Score */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-sm font-medium text-[#64748b]">AI Compatibility Score</p>
                </div>
                <ScoreBar score={30} color="orange" />
              </div>

              {/* Dog vs dog visual */}
              <div className="flex items-center justify-center gap-6 py-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#e2e8f0]">
                    <img src={DOG_A} alt="Cooper" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-[#1e293b]">Cooper</p>
                  <span className="text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full uppercase tracking-wide">Calm</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-orange-500 text-3xl">bolt</span>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Conflict</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#e2e8f0]">
                    <img src={DOG_B} alt="Luna" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-[#1e293b]">Luna</p>
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-orange-100">High Energy</span>
                </div>
              </div>

              {/* Message */}
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#1e293b] mb-2">Character Conflict Detected</p>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <p className="text-sm font-medium text-orange-800 leading-relaxed">
                    Your dog (Cooper) is known for a calm and shy temperament. However, another participant (Luna)
                    has a very high-energy play style that might be overwhelming for Cooper at this time.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full h-12 rounded-xl bg-[#f1f5f9] text-[#1e293b] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[rgba(226,207,183,0.3)] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
                Check Status Updates
              </button>
            </div>

          </div>

          {/* Desktop bottom action row */}
          <div className="max-w-4xl mx-auto mt-6 hidden md:flex items-center justify-between gap-4 bg-white border border-[#f1f5f9] rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#64748b]">info</span>
              <p className="text-sm text-[#64748b]">
                These results are based on your dog&apos;s profile. You can still request to join and let the host decide.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 bg-[#e2cfb7] hover:opacity-90 text-[#1e293b] font-bold text-sm px-5 py-2.5 rounded-xl transition-opacity"
            >
              Browse Other Activities
            </Link>
          </div>

          {/* Mobile bottom action */}
          <div className="md:hidden mt-4 flex flex-col gap-3">
            <div className="bg-white border border-[#f1f5f9] rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#64748b] shrink-0 mt-0.5" style={{ fontSize: 18 }}>info</span>
              <p className="text-[13px] text-[#64748b] leading-relaxed">
                You can still request to join and let the host decide.
              </p>
            </div>
            <Link
              href="/"
              className="w-full h-12 rounded-xl bg-[#e2cfb7] text-[#1e293b] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Browse Other Activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
