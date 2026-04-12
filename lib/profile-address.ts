import type { ProfileResponse } from "@/lib/profile-types"

export function hasProfileAddress(profile: Pick<ProfileResponse, "addressLine1">): boolean {
  const line = profile.addressLine1?.trim() ?? ""
  return line.length > 0
}
