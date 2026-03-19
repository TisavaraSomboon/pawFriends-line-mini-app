"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { PetSizeCategory, useActivity } from "@/lib/queries";
import SpinLoader from "@/components/SpinLoader";

const ATTENDEES = [
  {
    name: "Bella",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS5b4OXDJ8IsGU2uWHjVLm2k_q-vX6J-DfXqn3g1qFLWgnthXt1U8yNOghfl-pdBGt21sihAIqxESDfXDDS914wQ1dr7NLeI_Ozhd2Swp4hi0LxwadD21e9xNJpiz65XCjUQeGvYRUfYyhONN3pQ45hTVrFmpvChwbjaVXZgrq96j_ycYYuDrP_bo-m4wm8TwLTOfqrSWMAMgIs1wjXXyCJ8gJBvsoxWGdDXIz8IiBZi2mc19Ir2MfrHBiAvIjKLEwzBOqMH7kB3-A",
  },
  {
    name: "Cooper",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiFMak9TEKkP4gI6X23YPwmGxe1GwtgyGu6uxpQGo9Nf92-ztgti4ifGNGjLJtXyjXErJQDkgoZlzwq5VISvKeilLE7tKO-vbJADSwNr6CRzRZojvG4dYfsWfuJW8jcjjoLhqiQYz22_HRY_b7-y3yctXvzDXiX2DrUtnXf8e5khgaxexcUVyGKGREFIShUiePkeYFZoIRXZDkJOwmpoHwuHIAz4S-Izu7Ab2j8Y7cuMn6zgUTB4wcTIa2yDckuPrPBVrZsFq5OU1d",
  },
  {
    name: "Daisy",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_TLx3ikjCrxeEEVHPlDhlXspkv10MmefYmcgXuThTecDJIzFhEfeN5697mAL2YLI_CrO4EdhrUA_h6IwcIYY0jw1tk4cxseKAgO61_QOYFLImgvwKtk6kKqJA6qlC72DmOFot6NzQ8H63XI4_WUjAQJ9gdqt80wzYDW1b0GZvIHeAplHel4CtF2zb_M6xeSYqzbDheMtp0o_Aa_0_8pXVxjT2KQtg9yO2CxYL8vmqcmo7icFUfJlfcERa_3wtCy83PsnaJYEHtGjL",
  },
  {
    name: "Milo",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL54sl5L0gykeqnF9A0n2oHFL1jlE4q-NVBbOEEAgDyhjjawVBsI-tvVYxw9DQpPaK7ANYCE9fgKn53CVsG_5KR_mqx_m4zGEV4A8YG-r7DoeZrBEbBMr2iG5OmkHeHHwV4kwDD_IaSI4WVq0HyDjOIrwRNjECDvTdo36RLfcsancvKVtp4uSjeLfgCjeEUpwPF2oZeHzNlqwn0nA084qBImXnSvjEFPD_ZwEvBqFbf5H7RZvNpgJeiUuCOjgcn7c8KECRZ_b1O9DJ",
  },
];

const HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXmfUp5G2wJWz4equkUn9ClUrly_jgGueg9dKc1DB71vnfbOxhh5U863IhThj58Yh6yu8yZXp9VZQjjqNke_14dUNexJm8p-jKtgxE0fKIAutsIr5GFBnNYLT3ehbUDTqkMbHPphfnLEKLbP51ybF6vIuYlDONPgJl_Jblbi1svV2cio-WBGh9oEUbLnKZCuUWTmAYjJGyNRGhdYDGMf-BWtXhT1MydFvpcuzqvBX_ExYk_wKSvPFWUE0XEU2sj7P3QdW_gRJjDbXL";

const size: { [key in PetSizeCategory]: string } = {
  XS: "Very Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Super Large",
};

export default function ActivityDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isHost = searchParams.get("view") === "host";

  const { data: activity, isFetching } = useActivity(id);

  const [joined, setJoined] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  if (isFetching) return <SpinLoader title="Loading activity" />;

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* Top nav bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] sticky top-0 z-10">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors"
          onClick={() => {
            router.back();
          }}
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </button>
        <h2 className="text-[17px] font-bold text-[#1e293b] md:text-xl tracking-tight text-center w-full">
          Activity Details
        </h2>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex-1 overflow-y-auto pb-32">
        <ActivityContent isHost={isHost} />
        {/* Fixed bottom action bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 p-4 bg-[#f7f7f6]/80 backdrop-blur-md border-t border-[rgba(226,207,183,0.3)]">
          {isHost ? (
            <HostActions
              showRequests={showRequests}
              setShowRequests={setShowRequests}
            />
          ) : (
            <UserAction joined={joined} setJoined={setJoined} />
          )}
        </div>
      </div>

      {/* ── Desktop layout: two columns ── */}
      <div className="hidden md:flex flex-1 gap-8 px-8 py-8 max-w-5xl mx-auto w-full items-start">
        {/* Left column: activity details */}
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          {/* Hero image */}
          <div
            className="w-full h-80 rounded-2xl bg-center bg-cover bg-no-repeat mb-6"
            style={{ backgroundImage: `url("${activity?.image ?? HERO}")` }}
          />

          {/* Title & tags */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight mb-3">
              {activity?.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[rgba(226,207,183,0.4)] text-[#334155] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {activity?.sizes.map((key) => `${size[key]} Dogs`).join(", ")}{" "}
                Only
              </span>
            </div>
          </div>

          {/* Location & date */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden mb-6 divide-y divide-[#f1f5f9]">
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(226,207,183,0.06)] transition-colors cursor-pointer">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[rgba(226,207,183,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[#1e293b]">
                  location_on
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1e293b] text-ellipsis overflow-hidden whitespace-nowrap w-60">
                  {activity?.locationName}
                </p>
                <p className="text-[13px] text-[#64748b]">
                  {
                    activity?.locationName.split(" ")[
                      activity?.locationName.split(" ").length - 1
                    ]
                  }{" "}
                  {/* TODO: will search for the way to get distance later */}
                  {/* • 0.8 miles away */}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#94a3b8]">
                chevron_right
              </span>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[rgba(226,207,183,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[#1e293b]">
                  calendar_today
                </span>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#1e293b]">
                  {dayjs(activity?.startDate).format("dddd, MMM D")}
                </p>
                <p className="text-[13px] text-[#64748b]">
                  {dayjs(activity?.startDate).format("dd DD hh:mm A")} –{" "}
                  {dayjs(activity?.endDate).format("dd DD hh:mm A")}
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] px-5 py-5 mb-6">
            <h3 className="text-[17px] font-bold text-[#1e293b] mb-2">
              About the Activity
            </h3>
            <p className="text-[15px] text-[#475569] leading-relaxed">
              {activity?.description}
            </p>
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-bold text-[#1e293b]">
                Attendees ({ATTENDEES.length})
              </h3>
              <button className="text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors">
                View All
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {ATTENDEES.map((a) => (
                <div
                  key={a.name}
                  className="flex flex-col items-center gap-1 w-16"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e2cfb7]">
                    <Image
                      src={a.src}
                      alt={a.name}
                      className="w-full h-full object-cover"
                      height={256}
                      width={256}
                    />
                  </div>
                  <p className="text-xs font-medium text-[#475569] text-center truncate w-full">
                    {a.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: sticky action panel */}
        <div className="w-80 shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden">
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-[#f1f5f9]">
              <h3 className="text-[16px] font-bold text-[#1e293b]">
                {isHost ? "Manage Activity" : "Join this Activity"}
              </h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">
                {isHost
                  ? "Review requests and end activity"
                  : "4 of 8 spots available"}
              </p>
            </div>

            {/* Attendee stack preview */}
            <div className="px-5 py-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {ATTENDEES.slice(0, 3).map((a) => (
                    <div
                      key={a.name}
                      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                    >
                      <img
                        src={a.src}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-[#475569]">
                  <span className="font-bold text-[#1e293b]">
                    {ATTENDEES.length} pups
                  </span>{" "}
                  already joined
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 py-5">
              {isHost ? (
                <HostActions
                  showRequests={showRequests}
                  setShowRequests={setShowRequests}
                />
              ) : (
                <UserAction joined={joined} setJoined={setJoined} />
              )}
            </div>
          </div>

          {/* Host info card */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] px-5 py-4 mt-4 flex items-center gap-3">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuzALWachO_YIj8n2rR-FLfaEYVj3LhYbo9hEjMEUR56kinTG63BRNgCKCr2UY94D71unYWxE4HXlvQwfOO6iH5U14SS6xGwZ_t0JPr2LaSWERa91zC5xmVFEP1EPhKdJ8RdW5EyNIgXqHO7I6fzubsaAgzj3wVnSlk40Xx5Gytefc7WB8s58QJOPu9U94Y_MWJX_HM2WRhjYJkQs6lMuDySUnFmGBw_Wn7XDJFOAxscL2Izuf3UznPYuNQVRv0x5nqBzhRT1i-uJ3"
              alt="Host"
              className="w-10 h-10 rounded-full object-cover shrink-0"
              width={265}
              height={265}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#64748b]">Hosted by</p>
              <p className="text-[14px] font-bold text-[#1e293b] truncate">
                Luna&apos;s Mom
              </p>
            </div>
            <button className="text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors shrink-0">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile activity content ── */
function ActivityContent({ isHost }: { isHost: boolean }) {
  return (
    <div>
      {/* Hero image */}
      <div
        className="w-full min-h-72 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url("${HERO}")` }}
      />

      {/* Title & tags */}
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight pb-2">
          Morning Park Zoomies
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="bg-[rgba(226,207,183,0.4)] text-[#334155] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Small Dogs Only
          </span>
          <span className="bg-[rgba(226,207,183,0.4)] text-[#334155] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            4/8 Spots Filled
          </span>
        </div>
      </div>

      {/* Location & date */}
      <div className="space-y-1">
        <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between hover:bg-[rgba(226,207,183,0.08)] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgba(226,207,183,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[#1e293b]">
                location_on
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1e293b]">
                Central Park, Dog Run
              </p>
              <p className="text-[13px] text-[#64748b]">
                New York, NY • 0.8 miles away
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#94a3b8]">
            chevron_right
          </span>
        </div>

        <div className="flex items-center gap-4 px-4 min-h-[72px] py-2">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgba(226,207,183,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[#1e293b]">
              calendar_today
            </span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#1e293b]">
              Saturday, Oct 21
            </p>
            <p className="text-[13px] text-[#64748b]">09:00 AM – 10:30 AM</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="px-4 py-6 border-t border-[rgba(226,207,183,0.2)] mt-4">
        <h3 className="text-[18px] font-bold text-[#1e293b] mb-2">
          About the Activity
        </h3>
        <p className="text-[15px] text-[#475569] leading-relaxed">
          Calling all small pups! Let&apos;s get together for some morning
          zoomies at the enclosed dog run. Great chance for socialization in a
          safe, size-appropriate environment. We&apos;ll grab coffee at the
          nearby cart afterwards!
        </p>
      </div>

      {/* Attendees */}
      <div className="px-4 py-6 border-t border-[rgba(226,207,183,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-[#1e293b]">
            Attendees ({ATTENDEES.length})
          </h3>
          <button className="text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors">
            View All
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {ATTENDEES.map((a) => (
            <div key={a.name} className="flex flex-col items-center gap-1 w-16">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e2cfb7]">
                <img
                  src={a.src}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium text-[#475569] text-center truncate w-full">
                {a.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── User action ── */
function UserAction({
  joined,
  setJoined,
}: {
  joined: boolean;
  setJoined: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => setJoined(!joined)}
      className={`w-full h-14 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
        joined
          ? "bg-white border-2 border-[#e2cfb7] text-[#1e293b] hover:bg-[rgba(226,207,183,0.1)]"
          : "bg-[#e2cfb7] text-[#1e293b] hover:opacity-90"
      }`}
    >
      <span className="material-symbols-outlined">
        {joined ? "check_circle" : "pets"}
      </span>
      {joined ? "Joined!" : "Request to Join"}
    </button>
  );
}

/* ── Host actions ── */
function HostActions({
  showRequests,
  setShowRequests,
}: {
  showRequests: boolean;
  setShowRequests: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setShowRequests(!showRequests)}
        className="w-full h-14 bg-white border-2 border-[#e2cfb7] text-[#1e293b] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[rgba(226,207,183,0.1)] transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">person_add</span>
        {showRequests ? "Hide Requests" : "Manage Requests (3)"}
      </button>

      {showRequests && (
        <div className="bg-white rounded-xl border border-[#f1f5f9] divide-y divide-[#f1f5f9] overflow-hidden">
          {["Rex", "Honey", "Archie"].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.4)] flex items-center justify-center text-lg">
                  🐶
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1e293b]">{name}</p>
                  <p className="text-[12px] text-[#64748b]">Wants to join</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-[rgba(226,207,183,0.3)] flex items-center justify-center hover:bg-[rgba(226,207,183,0.6)] transition-colors">
                  <span
                    className="material-symbols-outlined text-[#1e293b]"
                    style={{ fontSize: 18 }}
                  >
                    check
                  </span>
                </button>
                <button className="w-9 h-9 rounded-full bg-[rgba(226,207,183,0.1)] border border-[#e2e8f0] flex items-center justify-center hover:bg-red-50 transition-colors">
                  <span
                    className="material-symbols-outlined text-[#94a3b8]"
                    style={{ fontSize: 18 }}
                  >
                    close
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full h-14 bg-[#1e293b] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-[0.98]">
        <span className="material-symbols-outlined">pets</span>
        End Activity
      </button>
    </div>
  );
}
