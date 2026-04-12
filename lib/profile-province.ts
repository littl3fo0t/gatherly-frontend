/**
 * Canadian province and territory codes — must match the backend enum for profile (and event) addresses.
 * API examples use two-letter codes (e.g. ON, BC).
 */
export const PROFILE_PROVINCES = [
  { code: "AB", label: "Alberta" },
  { code: "BC", label: "British Columbia" },
  { code: "MB", label: "Manitoba" },
  { code: "NB", label: "New Brunswick" },
  { code: "NL", label: "Newfoundland and Labrador" },
  { code: "NS", label: "Nova Scotia" },
  { code: "NT", label: "Northwest Territories" },
  { code: "NU", label: "Nunavut" },
  { code: "ON", label: "Ontario" },
  { code: "PE", label: "Prince Edward Island" },
  { code: "QC", label: "Quebec" },
  { code: "SK", label: "Saskatchewan" },
  { code: "YT", label: "Yukon" },
] as const

export type ProfileProvinceCode = (typeof PROFILE_PROVINCES)[number]["code"]

const CODE_SET = new Set<string>(PROFILE_PROVINCES.map((p) => p.code))

export function isProfileProvinceCode(v: string): v is ProfileProvinceCode {
  return CODE_SET.has(v)
}

/** Map API / user input to canonical enum code when it matches (case-insensitive). */
export function normalizeProfileProvince(raw: string | null | undefined): string {
  const t = (raw ?? "").trim()
  if (!t) return ""
  const upper = t.toUpperCase()
  if (CODE_SET.has(upper)) return upper
  return t
}
