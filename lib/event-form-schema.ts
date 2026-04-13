import { z } from "zod"

export const eventTypeEnum = z.enum(["virtual", "in_person", "hybrid"])
export const admissionTypeEnum = z.enum(["free", "paid"])

export type EventType = z.infer<typeof eventTypeEnum>
export type AdmissionType = z.infer<typeof admissionTypeEnum>

function isValidHttpOrHttpsUrl(s: string): boolean {
  const t = s.trim()
  if (!t) return false
  try {
    const u = new URL(t)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

/** Optional URL: empty → allowed; non-empty must be http(s) with host. */
const optionalUrl = z
  .string()
  .refine((s) => s.trim() === "" || isValidHttpOrHttpsUrl(s), {
    message: "Must be a valid http or https URL.",
  })

export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required."),
    description: z.string(),
    eventType: eventTypeEnum,
    admissionType: admissionTypeEnum,
    /** Raw input; validated in superRefine for paid. */
    admissionFee: z.string(),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required."),
    timezone: z.string().min(1, "Timezone is required."),
    addressLine1: z.string(),
    addressLine2: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
    meetingLink: z.string(),
    coverImageUrl: optionalUrl,
    maxCapacity: z
      .string()
      .min(1, "Capacity is required.")
      .refine((s) => /^\d+$/.test(s.trim()) && parseInt(s, 10) > 0, {
        message: "Enter a positive whole number.",
      }),
    categoryIds: z.array(z.string().uuid()).max(3, "Choose at most 3 categories."),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime)
    const end = Date.parse(data.endTime)
    if (Number.isNaN(start)) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Use a valid ISO 8601 datetime." })
    }
    if (Number.isNaN(end)) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "Use a valid ISO 8601 datetime." })
    }
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End must be after start." })
    }

    if (data.admissionType === "paid") {
      const fee = parseFloat(data.admissionFee.trim())
      if (Number.isNaN(fee) || fee <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["admissionFee"],
          message: "Enter a positive amount for paid events.",
        })
      }
    }

    const needsAddress = data.eventType === "in_person" || data.eventType === "hybrid"
    if (needsAddress) {
      if (!data.addressLine1.trim()) {
        ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Address line 1 is required." })
      }
      if (!data.city.trim()) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required." })
      if (!data.province.trim()) {
        ctx.addIssue({ code: "custom", path: ["province"], message: "Province is required." })
      }
      if (!data.postalCode.trim()) {
        ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Postal code is required." })
      }
    }

    const needsLink = data.eventType === "virtual" || data.eventType === "hybrid"
    if (needsLink) {
      if (!data.meetingLink.trim() || !isValidHttpOrHttpsUrl(data.meetingLink)) {
        ctx.addIssue({
          code: "custom",
          path: ["meetingLink"],
          message: "A valid http(s) meeting link is required.",
        })
      }
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export type EventCreateApiBody = {
  title: string
  description: string
  eventType: EventType
  admissionType: AdmissionType
  admissionFee: number | null
  startTime: string
  endTime: string
  timezone: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  meetingLink: string | null
  coverImageUrl: string | null
  maxCapacity: number
  categoryIds: string[]
}

export type EventUpdateApiBody = Omit<EventCreateApiBody, "eventType" | "admissionType" | "admissionFee">

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

export function eventFormValuesToCreateBody(values: EventFormValues): EventCreateApiBody {
  const admissionFee =
    values.admissionType === "free" ? null : parseFloat(values.admissionFee.trim())

  return {
    title: values.title.trim(),
    description: values.description,
    eventType: values.eventType,
    admissionType: values.admissionType,
    admissionFee,
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
    timezone: values.timezone.trim(),
    addressLine1: emptyToNull(values.addressLine1),
    addressLine2: emptyToNull(values.addressLine2),
    city: emptyToNull(values.city),
    province: emptyToNull(values.province),
    postalCode: emptyToNull(values.postalCode),
    meetingLink: emptyToNull(values.meetingLink),
    coverImageUrl: emptyToNull(values.coverImageUrl),
    maxCapacity: parseInt(values.maxCapacity.trim(), 10),
    categoryIds: values.categoryIds,
  }
}

export function eventFormValuesToUpdateBody(values: EventFormValues): EventUpdateApiBody {
  const full = eventFormValuesToCreateBody(values)
  return {
    title: full.title,
    description: full.description,
    startTime: full.startTime,
    endTime: full.endTime,
    timezone: full.timezone,
    addressLine1: full.addressLine1,
    addressLine2: full.addressLine2,
    city: full.city,
    province: full.province,
    postalCode: full.postalCode,
    meetingLink: full.meetingLink,
    coverImageUrl: full.coverImageUrl,
    maxCapacity: full.maxCapacity,
    categoryIds: full.categoryIds,
  }
}

export function defaultCreateFormValues(): EventFormValues {
  return {
    title: "",
    description: "",
    eventType: "in_person",
    admissionType: "free",
    admissionFee: "",
    startTime: "",
    endTime: "",
    timezone: "America/Toronto",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    meetingLink: "",
    coverImageUrl: "",
    maxCapacity: "50",
    categoryIds: [],
  }
}
