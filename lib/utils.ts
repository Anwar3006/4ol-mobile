import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Regular utility for merging classNames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toUppercaseFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatTextToTitleCase = (text: string, delimiter: string) => {
  return text
    .split(delimiter)
    .map((word) => toUppercaseFirstLetter(word))
    .join(" ");
};

export const getLiveStatus = (businessHours: any[]) => {
  if (!businessHours || businessHours.length === 0)
    return { isOpen: false, label: "Hours N/A" };

  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = days[now.getDay()];

  const todaySchedule = businessHours.find((h) => h.day === currentDay);

  if (!todaySchedule || todaySchedule.isClosed) {
    return { isOpen: false, label: "Closed Today" };
  }

  // Convert current time to minutes since midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse Open/Close times (format "HH:mm")
  const [openH, openM] = todaySchedule.open.split(":").map(Number);
  const [closeH, closeM] = todaySchedule.close.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
    return { isOpen: true, label: "Open Now" };
  }

  return { isOpen: false, label: "Closed Now" };
};
