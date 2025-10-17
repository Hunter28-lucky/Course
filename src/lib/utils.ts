import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const averageRatingLabel = (rating: number) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Great";
  if (rating >= 3) return "Good";
  return "New";
};
