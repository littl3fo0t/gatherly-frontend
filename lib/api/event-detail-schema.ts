import { z } from "zod"

const addressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
})

export const publicEventDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  eventType: z.enum(["virtual", "in_person", "hybrid"]),
  admissionType: z.enum(["free", "paid"]),
  admissionFee: z.number().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string(),
  address: addressSchema.nullable(),
  coverImageUrl: z.string().nullable(),
  rsvpCount: z.number(),
  maxCapacity: z.number(),
  isHot: z.boolean(),
  categories: z.array(z.string()),
  organizer: z
    .object({
      id: z.string().uuid(),
      fullName: z.string(),
    })
    .optional(),
})

export type PublicEventDetail = z.infer<typeof publicEventDetailSchema>

export function parsePublicEventDetail(data: unknown): PublicEventDetail {
  return publicEventDetailSchema.parse(data)
}
