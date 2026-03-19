import dayjs from "dayjs";

export function formatActivityTime(start?: Date, end?: Date): string {
  if (!start) return "Date TBD";
  const s = dayjs(start);
  const dateStr = s.format("ddd, MMM D");
  const startTime = s.format("h:mm A");
  if (!end) return `${dateStr} • ${startTime}`;
  const endTime = dayjs(end).format("h:mm A");
  return `${dateStr} • ${startTime} – ${endTime}`;
}

export const ACTIVITY_TYPE_BADGE: Record<
  string,
  { icon: string; label: string }
> = {
  park: { icon: "potted_plant", label: "Outdoor" },
  playdate: { icon: "pets", label: "Playdate" },
  training: { icon: "school", label: "Training" },
  swimming: { icon: "pool", label: "Swimming" },
  hiking: { icon: "hiking", label: "Hiking" },
  agility: { icon: "emoji_events", label: "Agility" },
};
