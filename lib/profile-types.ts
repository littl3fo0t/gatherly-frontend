export type ProfileResponse = {
  id: string
  fullName: string
  email: string
  role: "user" | "moderator" | "admin" | string
  avatarUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  createdAt: string
  updatedAt: string
}
