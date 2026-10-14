import { clsx, type ClassValue } from "clsx";

/** Join class names (no Tailwind here, so no class merging is needed). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
