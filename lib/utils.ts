import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUrl(url: string) {
  const urlRegex = /^(https?:\/\/)|([\w-]+\.)+[\w-]+(\/.*)?$/i;
  if (url.match(urlRegex)) return true;
  return false;
}

export function transformUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return "https://" + url;
}
