"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MapPin, Pencil, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/http"
import { putProfileMeBff, type PutProfileMeBody } from "@/lib/api/profile-me-bff"
import { hasProfileAddress } from "@/lib/profile-address"
import {
  isProfileProvinceCode,
  normalizeProfileProvince,
  PROFILE_PROVINCES,
} from "@/lib/profile-province"
import { queryKeys } from "@/lib/query-keys"
import type { ProfileResponse } from "@/lib/profile-types"

const PROVINCE_SELECT_EMPTY = "__none__"

type Draft = {
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
}

function addressDraftFromProfile(p: ProfileResponse): Draft {
  return {
    addressLine1: p.addressLine1 ?? "",
    addressLine2: p.addressLine2 ?? "",
    city: p.city ?? "",
    province: normalizeProfileProvince(p.province),
    postalCode: p.postalCode ?? "",
  }
}

function emptyDraft(): Draft {
  return {
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
  }
}

type ApiErrorBody = {
  message?: string
  errors?: { field?: string; message?: string }[]
}

function formatPutError(body: unknown): string {
  if (!body || typeof body !== "object") return "Something went wrong. Please try again."
  const b = body as ApiErrorBody
  if (Array.isArray(b.errors) && b.errors.length > 0) {
    const parts = b.errors
      .map((e) => (typeof e.message === "string" ? e.message : e.field))
      .filter((x): x is string => Boolean(x))
    if (parts.length > 0) return parts.join(" ")
  }
  return typeof b.message === "string" ? b.message : "Something went wrong. Please try again."
}

export type ProfileAddressSectionProps = {
  profile: ProfileResponse
}

export function ProfileAddressSection({ profile }: ProfileAddressSectionProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const idPrefix = React.useId()
  const hasAddress = hasProfileAddress(profile)

  const [flow, setFlow] = React.useState<"idle" | "add" | "edit">("idle")
  const [draft, setDraft] = React.useState<Draft>(() => addressDraftFromProfile(profile))
  const [error, setError] = React.useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: (body: PutProfileMeBody) => putProfileMeBff(body),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.profile.me(), next)
      setFlow("idle")
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login")
        return
      }
      if (err instanceof ApiError) {
        const raw = err.bodyText?.trim()
        if (raw) {
          try {
            setError(formatPutError(JSON.parse(raw)))
          } catch {
            setError(raw || err.message)
          }
        } else {
          setError(err.message)
        }
        return
      }
      setError("Could not reach the server. Please try again.")
    },
  })

  const isFormActive = (!hasAddress && flow === "add") || (hasAddress && flow === "edit")
  const inputsDisabled = hasAddress && flow !== "edit"

  React.useEffect(() => {
    if (!isFormActive) {
      setDraft(addressDraftFromProfile(profile))
    }
  }, [
    profile.addressLine1,
    profile.addressLine2,
    profile.city,
    profile.province,
    profile.postalCode,
    isFormActive,
  ])

  function startAdd() {
    setFlow("add")
    setDraft(emptyDraft())
    setError(null)
  }

  function startEdit() {
    setFlow("edit")
    setDraft(addressDraftFromProfile(profile))
    setError(null)
  }

  function cancel() {
    setFlow("idle")
    setError(null)
    setDraft(addressDraftFromProfile(profile))
  }

  function save() {
    setError(null)
    const trimOrNull = (s: string) => {
      const t = s.trim()
      return t.length > 0 ? t : null
    }
    saveMutation.mutate({
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      addressLine1: trimOrNull(draft.addressLine1),
      addressLine2: trimOrNull(draft.addressLine2),
      city: trimOrNull(draft.city),
      province: trimOrNull(normalizeProfileProvince(draft.province)),
      postalCode: trimOrNull(draft.postalCode),
    })
  }

  const saving = saveMutation.isPending

  const fieldId = (name: string) => `${idPrefix}-${name}`

  const v = isFormActive
    ? draft
    : {
        addressLine1: profile.addressLine1 ?? "",
        addressLine2: profile.addressLine2 ?? "",
        city: profile.city ?? "",
        province: normalizeProfileProvince(profile.province),
        postalCode: profile.postalCode ?? "",
      }

  const rawProvince = normalizeProfileProvince(v.province)
  const legacyProvince = rawProvince !== "" && !isProfileProvinceCode(rawProvince)
  const provinceSelectValue = rawProvince === "" ? PROVINCE_SELECT_EMPTY : rawProvince

  const showEmpty = !hasAddress && flow !== "add"

  if (showEmpty) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Address</h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          You haven&apos;t added an address yet. An address is optional, but it can speed things up when you create
          in-person or hybrid events.
        </p>
        <div>
          <Button type="button" variant="default" onClick={startAdd}>
            <MapPin data-icon="inline-start" className="size-4" aria-hidden />
            Add address
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Address</h2>
        {isFormActive ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" disabled={saving} onClick={cancel}>
              <X data-icon="inline-start" className="size-4" aria-hidden />
              Cancel
            </Button>
            <Button type="button" variant="default" disabled={saving} onClick={() => save()}>
              <Save data-icon="inline-start" className="size-4" aria-hidden />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={startEdit}>
            <Pencil data-icon="inline-start" className="size-4" aria-hidden />
            Edit
          </Button>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("addressLine1")}>Address line 1</Label>
          <Input
            id={fieldId("addressLine1")}
            value={v.addressLine1}
            onChange={
              isFormActive ? (e) => setDraft((d) => ({ ...d, addressLine1: e.target.value })) : undefined
            }
            placeholder="Street number and name"
            disabled={inputsDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fieldId("addressLine2")}>Address line 2</Label>
          <Input
            id={fieldId("addressLine2")}
            value={v.addressLine2}
            onChange={
              isFormActive ? (e) => setDraft((d) => ({ ...d, addressLine2: e.target.value })) : undefined
            }
            placeholder="Apartment, suite, etc. (optional)"
            disabled={inputsDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fieldId("city")}>City</Label>
          <Input
            id={fieldId("city")}
            value={v.city}
            onChange={isFormActive ? (e) => setDraft((d) => ({ ...d, city: e.target.value })) : undefined}
            placeholder="City"
            disabled={inputsDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fieldId("province")}>Province or territory</Label>
          <Select
            value={provinceSelectValue}
            onValueChange={
              isFormActive
                ? (val) =>
                    setDraft((d) => ({
                      ...d,
                      province: val === PROVINCE_SELECT_EMPTY ? "" : val,
                    }))
                : undefined
            }
            disabled={inputsDisabled}
          >
            <SelectTrigger id={fieldId("province")} className="w-full max-w-full" size="default">
              <SelectValue placeholder="Select province or territory" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] max-h-72">
              <SelectItem value={PROVINCE_SELECT_EMPTY}>Not selected</SelectItem>
              {legacyProvince ? (
                <SelectItem value={rawProvince}>
                  {rawProvince} (legacy value)
                </SelectItem>
              ) : null}
              {PROFILE_PROVINCES.map(({ code, label }) => (
                <SelectItem key={code} value={code}>
                  {label} ({code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fieldId("postalCode")}>Postal code</Label>
          <Input
            id={fieldId("postalCode")}
            value={v.postalCode}
            onChange={
              isFormActive ? (e) => setDraft((d) => ({ ...d, postalCode: e.target.value })) : undefined
            }
            placeholder="Postal or ZIP code"
            disabled={inputsDisabled}
          />
        </div>
      </div>
    </section>
  )
}
