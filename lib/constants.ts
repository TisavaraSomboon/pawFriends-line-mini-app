import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

export function formatStartTim(startTime: Date) {
  const s = dayjs(startTime);
  return dayjs(s).calendar();
}

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

export const userProfile =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4gSy4vsT1ox_x5hsjIqAmtZvDGD0M2bz-Uc-S4ZXfvNx36-WMJIw3A_wTsq5V3SCLMA0WH42p17-dMPIzXglkeUOsDRV-KMglvxdMqsn5otPKKYnZfGay0Fk_LhmBHFeJ4_NfpSYIs7vhmz6q1rhpFMxBbLcBPoX-yVbc24dWvSWvzrFNg1QiLhlGhPL_SzzADktBskiBTdfJEpQrIn9IMdb1Z_YpxruXx7w06DoBG4mT7U1Xj0bE8scY1OKxCaOPohC1dB1pm-8c";

export const MAX_PACK_SIZE = 4;
