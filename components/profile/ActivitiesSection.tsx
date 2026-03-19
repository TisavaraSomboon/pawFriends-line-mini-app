"use client";

import { ACTIVITY_TYPE_BADGE } from "@/lib/constants";
import { Activity } from "@/lib/queries";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import { useRouter } from "next/navigation";

type ActivityProps = {
  activity?: Activity[];
};

dayjs.extend(calendar);

export default function ActivitiesSection({ activity }: ActivityProps) {
  const router = useRouter();
  if (!activity) return;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-bold text-[#1e293b]">My Activities</h3>
        <button
          className="text-[13px] font-bold text-[#e2cfb7] hover:opacity-80"
          onClick={() => {
            router.push("/activity");
          }}
        >
          View All {activity.length > 0 && `(${activity.length})`}
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {activity.map(({ title, type, startDate, locationName }) => {
          const badge = ACTIVITY_TYPE_BADGE[type] ?? {
            icon: "pets",
            label: type,
          };

          return (
            <div key={title} className="flex flex-col gap-3">
              <div className="bg-white rounded-xl border border-[#f1f5f9] shadow-sm overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-600">
                      {badge.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[14px] font-bold text-[#1e293b]">
                        {badge.label}
                      </p>
                      <span className="text-[10px] text-[#94a3b8]">
                        Organized by you
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1 flex gap-1">
                      <span>{dayjs(startDate).calendar()}</span>
                      <span>•</span>{" "}
                      <div className="text-ellipsis whitespace-nowrap overflow-hidden w-60">
                        {locationName}
                      </div>
                    </p>
                  </div>
                </div>
                <div className="border-t border-[#f8fafc]">
                  <div className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-[#64748b]">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      group_add
                    </span>
                    Member Requests (2)
                  </div>
                  <div className="px-4 pb-4 flex flex-col gap-3">
                    {[
                      {
                        name: "Luna & Mike",
                        msg: "Would love to join with our husky!",
                      },
                      {
                        name: "Cooper & Sarah",
                        msg: "Is it okay for puppies?",
                      },
                    ].map((req) => (
                      <div key={req.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(226,207,183,0.4)] flex items-center justify-center text-sm shrink-0">
                          🐶
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1e293b] truncate">
                            {req.name}
                          </p>
                          <p className="text-[10px] text-[#64748b] truncate">
                            &quot;{req.msg}&quot;
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded-lg bg-[#e2cfb7] flex items-center justify-center hover:opacity-80 transition-opacity">
                            <span
                              className="material-symbols-outlined text-[#1e293b]"
                              style={{ fontSize: 14 }}
                            >
                              check
                            </span>
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-[#f1f5f9] flex items-center justify-center hover:bg-red-50 transition-colors">
                            <span
                              className="material-symbols-outlined text-[#94a3b8]"
                              style={{ fontSize: 14 }}
                            >
                              close
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
