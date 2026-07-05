import type { OfficeScheduleStatus } from "./types";

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const COFFEE_MORNING_START = toMinutes("09:30");
const COFFEE_MORNING_END = toMinutes("09:45");
const LUNCH_START = toMinutes("12:00");
const LUNCH_END = toMinutes("13:00");
const COFFEE_AFTERNOON_START = toMinutes("15:00");
const COFFEE_AFTERNOON_END = toMinutes("15:15");

export function getOfficeScheduleStatus(now: Date): OfficeScheduleStatus {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= LUNCH_START && minutes < LUNCH_END) {
    return "lunch";
  }
  if (
    (minutes >= COFFEE_MORNING_START && minutes < COFFEE_MORNING_END) ||
    (minutes >= COFFEE_AFTERNOON_START && minutes < COFFEE_AFTERNOON_END)
  ) {
    return "coffeeBreak";
  }
  return "idle";
}
