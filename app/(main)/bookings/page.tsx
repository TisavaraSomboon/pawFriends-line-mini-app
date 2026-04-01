"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import Link from "next/link";
import ActivitiesSection from "@/components/profile/ActivitiesSection";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import { Activity } from "@/lib/queries";

dayjs.extend(calendar);

/* ── Mock: activities I host ── */
const MOCK_MY_ACTIVITIES: Activity[] = [
  {
    _id: "act-1",
    owner: { _id: "user-1", name: "Tisavara S.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4gSy4vsT1ox_x5hsjIqAmtZvDGD0M2bz-Uc-S4ZXfvNx36-WMJIw3A_wTsq5V3SCLMA0WH42p17-dMPIzXglkeUOsDRV-KMglvxdMqsn5otPKKYnZfGay0Fk_LhmBHFeJ4_NfpSYIs7vhmz6q1rhpFMxBbLcBPoX-yVbc24dWvSWvzrFNg1QiLhlGhPL_SzzADktBskiBTdfJEpQrIn9IMdb1Z_YpxruXx7w06DoBG4mT7U1Xj0bE8scY1OKxCaOPohC1dB1pm-8c" },
    title: "Morning Park Run",
    locationName: "Lumpini Park, Bangkok",
    type: "park",
    sizes: ["SM", "MD"],
    amountOfAttendees: 8,
    maxDogs: 10,
    status: "active",
    hostId: "user-1",
    startDate: new Date("2026-04-05T07:00:00"),
    image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d3f?w=400&h=300&fit=crop",
    attendees: [
      { _id: "a1", name: "Mochi", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop", role: "pet", status: "pending", requestMessage: "My dog is very friendly!" },
      { _id: "a2", name: "Buddy", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop", role: "pet", status: "pending" },
    ],
  },
  {
    _id: "act-2",
    owner: { _id: "user-1", name: "Tisavara S.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4gSy4vsT1ox_x5hsjIqAmtZvDGD0M2bz-Uc-S4ZXfvNx36-WMJIw3A_wTsq5V3SCLMA0WH42p17-dMPIzXglkeUOsDRV-KMglvxdMqsn5otPKKYnZfGay0Fk_LhmBHFeJ4_NfpSYIs7vhmz6q1rhpFMxBbLcBPoX-yVbc24dWvSWvzrFNg1QiLhlGhPL_SzzADktBskiBTdfJEpQrIn9IMdb1Z_YpxruXx7w06DoBG4mT7U1Xj0bE8scY1OKxCaOPohC1dB1pm-8c" },
    title: "Dog Training Class",
    locationName: "Central Park BKK",
    type: "training",
    sizes: [],
    amountOfAttendees: 3,
    maxDogs: 8,
    status: "active",
    hostId: "user-1",
    startDate: new Date("2026-04-06T09:00:00"),
    attendees: [],
  },
];

/* ── Mock: activities I requested to join ── */
type RequestedActivity = {
  _id: string;
  title: string;
  image?: string;
  locationName: string;
  type: string;
  startDate: Date;
  hostName: string;
  hostImage: string;
  myPetName: string;
  myPetImage: string;
  status: "pending" | "joined" | "rejected";
  compatibilityScore?: number;
  compatibilityNote?: string;
};

const MOCK_REQUESTS: RequestedActivity[] = [
  {
    _id: "req-1",
    title: "Small Dog Playdate",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    locationName: "Benchakitti Park",
    type: "park",
    startDate: new Date("2026-04-07T10:00:00"),
    hostName: "Sarah K.",
    hostImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    myPetName: "Mochi",
    myPetImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop",
    status: "pending",
    compatibilityScore: 45,
    compatibilityNote: "Size mismatch — this activity is for small breeds only.",
  },
  {
    _id: "req-2",
    title: "Golden Gang Walk",
    image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d3f?w=400&h=300&fit=crop",
    locationName: "Rama 9 Park",
    type: "park",
    startDate: new Date("2026-04-08T08:00:00"),
    hostName: "James T.",
    hostImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    myPetName: "Luna",
    myPetImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop",
    status: "joined",
  },
  {
    _id: "req-3",
    title: "Agility Training Session",
    locationName: "Dog Zone Bangkok",
    type: "training",
    startDate: new Date("2026-04-03T14:00:00"),
    hostName: "Coach Mike",
    hostImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    myPetName: "Mochi",
    myPetImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop",
    status: "rejected",
    compatibilityScore: 30,
    compatibilityNote: "Energy level conflict with other participants.",
  },
];

/* ── Mock: calendar attendees by date ── */
const MOCK_ATTENDEES_BY_DATE: Record<string, { image: string; name: string }[]> = {
  "2026-04-05": [
    { image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=40&h=40&fit=crop", name: "Mochi" },
    { image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=40&h=40&fit=crop", name: "Buddy" },
  ],
  "2026-04-06": [
    { image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=40&h=40&fit=crop", name: "Luna" },
  ],
  "2026-04-08": [
    { image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=40&h=40&fit=crop", name: "Mochi" },
    { image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=40&h=40&fit=crop", name: "Luna" },
    { image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d3f?w=40&h=40&fit=crop", name: "Max" },
  ],
  "2026-04-12": [
    { image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=40&h=40&fit=crop", name: "Luna" },
  ],
};

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  joined:   { label: "Joined",   bg: "bg-green-50",  text: "text-green-600", border: "border-green-200" },
  rejected: { label: "Rejected", bg: "bg-red-50",    text: "text-red-500",   border: "border-red-200" },
};

const TABS = ["My Activities", "My Requests", "Calendar"] as const;
type Tab = (typeof TABS)[number];

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("My Activities");

  return (
    <div className="flex flex-col min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/90 backdrop-blur-md px-4 pt-4 pb-0 border-b border-[rgba(226,207,183,0.2)]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-[17px] font-bold text-[#1e293b] mb-3">Bookings</h1>
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2.5 text-[12px] font-bold border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#e2cfb7] text-[#1e293b]"
                    : "border-transparent text-[#94a3b8]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="max-w-lg mx-auto">

          {/* ── Section 1: My Activities ── */}
          {activeTab === "My Activities" && (
            <div className="bg-slate-50 rounded-2xl px-4 pt-4 min-h-48">
              <ActivitiesSection activity={MOCK_MY_ACTIVITIES} />
            </div>
          )}

          {/* ── Section 2: My Requests ── */}
          {activeTab === "My Requests" && (
            <div className="flex flex-col gap-3">
              {MOCK_REQUESTS.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <span className="material-symbols-outlined text-[#e2cfb7]" style={{ fontSize: 48 }}>event_available</span>
                  <p className="text-[15px] font-bold text-[#1e293b]">No requests yet</p>
                  <p className="text-[13px] text-[#64748b]">Browse activities and request to join!</p>
                  <Link href="/" className="mt-1 bg-[#e2cfb7] text-[#1e293b] font-bold text-[13px] px-5 py-2.5 rounded-xl">
                    Browse Activities
                  </Link>
                </div>
              )}

              {MOCK_REQUESTS.map((req) => {
                const s = STATUS_CONFIG[req.status];
                return (
                  <div key={req._id} className="bg-white rounded-2xl overflow-hidden border border-[#f1f5f9]">
                    {/* Activity info */}
                    <div className="flex gap-3 p-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[rgba(226,207,183,0.2)]">
                        {req.image ? (
                          <Image src={req.image} alt={req.title} width={56} height={56} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#e2cfb7]" style={{ fontSize: 24 }}>pets</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[14px] font-bold text-[#1e293b] leading-tight">{req.title}</p>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">{dayjs(req.startDate).format("ddd, MMM D · HH:mm")}</p>
                        <p className="text-[11px] text-[#64748b] flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>location_on</span>
                          {req.locationName}
                        </p>
                      </div>
                    </div>

                    {/* My pet + host row */}
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                          <Image src={req.myPetImage} alt={req.myPetName} width={24} height={24} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[12px] font-semibold text-[#1e293b]">{req.myPetName}</span>
                        <span className="text-[11px] text-[#94a3b8]">attending</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#94a3b8]">hosted by</span>
                        <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                          <Image src={req.hostImage} alt={req.hostName} width={24} height={24} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[12px] font-semibold text-[#1e293b]">{req.hostName}</span>
                      </div>
                    </div>

                    {/* Compatibility note */}
                    {req.compatibilityNote && (
                      <div className={`mx-4 mb-3 rounded-xl p-3 flex gap-2 items-start ${req.status === "rejected" ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
                        <span className={`material-symbols-outlined shrink-0 mt-0.5 ${req.status === "rejected" ? "text-red-400" : "text-amber-500"}`} style={{ fontSize: 15 }}>
                          {req.status === "rejected" ? "cancel" : "warning"}
                        </span>
                        <div>
                          <p className={`text-[11px] font-bold mb-0.5 ${req.status === "rejected" ? "text-red-600" : "text-amber-700"}`}>
                            AI Compatibility · {req.compatibilityScore}%
                          </p>
                          <p className={`text-[11px] leading-relaxed ${req.status === "rejected" ? "text-red-600" : "text-amber-700"}`}>
                            {req.compatibilityNote}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Section 3: Calendar ── */}
          {activeTab === "Calendar" && (
            <div className="flex flex-col gap-3">
              <DateRangeCalendar
                readOnly
                startDate=""
                endDate=""
                onStartChange={() => {}}
                onEndChange={() => {}}
                label="My Schedule"
                attendeesByDate={MOCK_ATTENDEES_BY_DATE}
                onDayClick={(dateKey) => router.push(`/?date=${dateKey}`)}
              />
              <p className="text-[12px] text-[#94a3b8] text-center">
                Tap a day to see activities scheduled on that date
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
