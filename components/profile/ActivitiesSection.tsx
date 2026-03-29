"use client";

import { Activity, useUpdateAttendee } from "@/lib/queries";
import { useToast } from "@/components/Toast";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import Image from "next/image";
import Link from "next/link";

type ActivityProps = {
  activity?: Activity[];
};

dayjs.extend(calendar);

export default function ActivitiesSection({ activity }: ActivityProps) {
  const { toast } = useToast();
  const { mutate: updateAttendee } = useUpdateAttendee();
  if (!activity) return;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-bold text-[#1e293b]">My Activities</h3>
      </div>
      <div className="flex flex-col gap-4">
        {(!activity || activity.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[rgba(226,207,183,0.2)] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#e2cfb7]"
                style={{ fontSize: 40 }}
              >
                pets
              </span>
            </div>
            <div>
              <p className="text-[17px] font-bold text-[#1e293b]">
                No activities yet
              </p>
              <p className="text-[13px] text-[#64748b] mt-1">
                Be the first to create an activity for the pack!
              </p>
            </div>
            <a
              href="/create-activity"
              className="mt-2 bg-[#1e293b] text-white font-bold text-[14px] px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                add
              </span>
              Create Activity
            </a>
          </div>
        )}
        {activity.length > 0 &&
          activity.map(
            ({ _id: id, title, image, startDate, locationName, attendees }) => {
              return (
                <div key={title} className="flex flex-col gap-3">
                  <div className="bg-white rounded-xl border border-[#f1f5f9] shadow-sm overflow-hidden">
                    <Link href={`/activity/${id}`} className="flex gap-4 p-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            className="h-full object-cover rounded-xl"
                            alt="LOGO"
                            width={256}
                            height={256}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-orange-600">
                            pets
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[14px] font-bold text-[#1e293b]">
                            {title}
                          </p>
                        </div>
                        <p className="text-xs text-[#64748b] mt-1 flex flex-col gap-1">
                          <span>{dayjs(startDate).calendar()}</span>
                          <div className="text-ellipsis whitespace-nowrap overflow-hidden w-60">
                            {locationName}
                          </div>
                        </p>
                      </div>
                    </Link>
                    <div className="border-t border-[#f8fafc]">
                      <div className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-[#64748b]">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                        >
                          group_add
                        </span>
                        Member join ({attendees.length})
                      </div>
                      <div className="px-4 pb-4 flex flex-col gap-3">
                        {attendees.map(
                          ({ _id, role, name, status, requestMessage }) => {
                            if (status === "joined") return null;
                            return (
                              <div
                                key={_id}
                                className="flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-[rgba(226,207,183,0.4)] flex items-center justify-center text-sm shrink-0">
                                  {role === "pet" ? "🐶" : "👩🏻‍🦲"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#1e293b] truncate">
                                    {name}
                                  </p>
                                  {requestMessage && (
                                    <p className="text-[10px] text-[#64748b] truncate">
                                      &quot;{requestMessage}&quot;
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      updateAttendee(
                                        { _id, status: "joined" },
                                        {
                                          onSuccess: () =>
                                            toast(
                                              `${name} has been approved!`,
                                              "success",
                                            ),
                                          onError: () =>
                                            toast(
                                              "Failed to approve request.",
                                              "error",
                                            ),
                                        },
                                      )
                                    }
                                    className="w-7 h-7 rounded-lg bg-[#e2cfb7] flex items-center justify-center hover:opacity-80 transition-opacity"
                                  >
                                    <span
                                      className="material-symbols-outlined text-[#1e293b]"
                                      style={{ fontSize: 14 }}
                                    >
                                      check
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateAttendee(
                                        { _id, status: "rejected" },
                                        {
                                          onSuccess: () =>
                                            toast(
                                              `${name} has been rejected.`,
                                              "info",
                                            ),
                                          onError: () =>
                                            toast(
                                              "Failed to reject request.",
                                              "error",
                                            ),
                                        },
                                      )
                                    }
                                    className="w-7 h-7 rounded-lg bg-[#f1f5f9] flex items-center justify-center hover:bg-red-50 transition-colors"
                                  >
                                    <span
                                      className="material-symbols-outlined text-[#94a3b8]"
                                      style={{ fontSize: 14 }}
                                    >
                                      close
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}
      </div>
    </div>
  );
}
