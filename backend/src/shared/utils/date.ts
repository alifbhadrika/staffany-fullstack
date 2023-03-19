import { nextSunday, previousMonday, previousSunday } from "date-fns";

export function getMonday(date: Date) {
  const today = date.getDay();
  return today === 1 ? date : previousMonday(date);
}

export function getSunday(date: Date) {
  const today = date.getDay();
  return today === 0 ? date : nextSunday(date);
}
