"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, CircleX, Pencil } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessageForUser } from "@/lib/api/api-error-message"
import type { PublicEventDetail } from "@/lib/api/event-detail-schema"
import { createEvent, updateEvent } from "@/lib/api/events-mutations"
import { fetchOrganizerEventById } from "@/lib/api/organizer-events"
import { getPublicCategories } from "@/lib/api/public"
import { publicDetailToFormValues } from "@/lib/event-form-defaults"
import {
  defaultCreateFormValues,
  eventFormSchema,
  eventFormValuesToCreateBody,
  eventFormValuesToUpdateBody,
  type EventFormValues,
} from "@/lib/event-form-schema"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

export type EventUpsertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  /** Required for `edit` mode. */
  eventId?: string
  initialDetail?: PublicEventDetail
  accessToken: string | null
  onSuccess?: () => void
}

function fieldError(className?: string) {
  return cn("text-sm text-destructive", className)
}

export function EventUpsertDialog({
  open,
  onOpenChange,
  mode,
  eventId,
  initialDetail,
  accessToken,
  onSuccess,
}: EventUpsertDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: defaultCreateFormValues(),
  })

  const { register, control, handleSubmit, reset, setValue, formState } = form
  const eventTypeW = useWatch({ control, name: "eventType" })
  const admissionType = useWatch({ control, name: "admissionType" })
  const categoryIds = useWatch({ control, name: "categoryIds" }) ?? []
  const eventType = eventTypeW ?? "in_person"

  const { data: categories = [], isPending: categoriesPending } = useQuery({
    queryKey: queryKeys.public.categories(),
    queryFn: () => getPublicCategories(),
    enabled: open,
    staleTime: 300_000,
  })

  const {
    data: organizerRow,
    isPending: organizerPending,
    isError: organizerError,
  } = useQuery({
    queryKey: queryKeys.organizer.eventRow(eventId ?? ""),
    queryFn: ({ signal }) =>
      fetchOrganizerEventById(eventId!, accessToken!, signal),
    enabled: open && mode === "edit" && Boolean(eventId && accessToken),
  })

  const defaultsReady =
    mode === "create" ||
    (Boolean(initialDetail) && !categoriesPending && !organizerPending)

  React.useEffect(() => {
    if (!open || !defaultsReady) return
    if (mode === "create") {
      reset(defaultCreateFormValues())
      return
    }
    // `defaultsReady` for edit already implies `!categoriesPending`; categories may be [].
    if (initialDetail) {
      reset(
        publicDetailToFormValues(
          initialDetail,
          organizerRow?.meetingLink ?? null,
          categories,
        ),
      )
    }
  }, [open, defaultsReady, mode, initialDetail, organizerRow, categories, reset])

  const saveMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!accessToken) throw new Error("You must be signed in.")
      if (mode === "create") {
        return createEvent(eventFormValuesToCreateBody(values), accessToken)
      }
      if (!eventId) throw new Error("Missing event id.")
      return updateEvent(eventId, eventFormValuesToUpdateBody(values), accessToken)
    },
    onSuccess: () => {
      toast.success(mode === "create" ? "Event created" : "Event updated")
      void queryClient.invalidateQueries({ queryKey: queryKeys.public.all })
      if (eventId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.organizer.eventRow(eventId),
        })
      }
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err) => {
      const hint = getApiErrorMessageForUser(err)
      toast.error(hint ?? (err instanceof Error ? err.message : "Request failed"))
    },
  })

  const onSubmit = handleSubmit((values) => {
    void saveMutation.mutateAsync(values)
  })

  function handleCancel() {
    onOpenChange(false)
  }

  const showAddress = eventType === "in_person" || eventType === "hybrid"
  const showMeetingLink = eventType === "virtual" || eventType === "hybrid"
  const editBlocked = mode === "edit" && (categoriesPending || organizerPending)
  const showOrganizerFetchError = mode === "edit" && organizerError && !organizerPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-xl"
      >
        <div className="p-4 pb-2">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create event" : "Edit event"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new event to the public listing. Fields marked required depend on event type."
                : "Update this event. Event type and admission settings cannot be changed."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <form id="event-upsert-form" className="grid gap-4 pb-4" onSubmit={onSubmit}>
            {editBlocked ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Loading organizer details…
              </p>
            ) : null}
            {showOrganizerFetchError ? (
              <p className={fieldError()} role="alert">
                Could not load meeting link from your dashboard. If this is a virtual or hybrid
                event, enter the meeting link below before saving.
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="event-title">Title</Label>
              <Input id="event-title" autoComplete="off" disabled={editBlocked} {...register("title")} />
              {formState.errors.title ? (
                <p className={fieldError()}>{formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-description">Description (HTML allowed)</Label>
              <Textarea
                id="event-description"
                rows={5}
                disabled={editBlocked}
                className="min-h-[120px] resize-y"
                {...register("description")}
              />
              {formState.errors.description ? (
                <p className={fieldError()}>{formState.errors.description.message}</p>
              ) : null}
            </div>

            {mode === "create" ? (
              <>
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Event type</span>
                  <Controller
                    name="eventType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-2"
                        disabled={editBlocked}
                      >
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value="in_person" id="et-in" />
                          <span className="text-sm">In person</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value="virtual" id="et-v" />
                          <span className="text-sm">Virtual</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value="hybrid" id="et-h" />
                          <span className="text-sm">Hybrid</span>
                        </label>
                      </RadioGroup>
                    )}
                  />
                  {formState.errors.eventType ? (
                    <p className={fieldError()}>{formState.errors.eventType.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Admission</span>
                  <Controller
                    name="admissionType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-2"
                        disabled={editBlocked}
                      >
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value="free" id="ad-free" />
                          <span className="text-sm">Free</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value="paid" id="ad-paid" />
                          <span className="text-sm">Paid</span>
                        </label>
                      </RadioGroup>
                    )}
                  />
                </div>
              </>
            ) : initialDetail ? (
              <div className="grid gap-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                <p>
                  <span className="font-medium text-muted-foreground">Event type · </span>
                  {initialDetail.eventType.replaceAll("_", " ")}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">Admission · </span>
                  {initialDetail.admissionType === "free"
                    ? "Free"
                    : `Paid (${initialDetail.admissionFee?.toFixed(2) ?? "—"} CAD)`}
                </p>
              </div>
            ) : null}

            {admissionType === "paid" && mode === "create" ? (
              <div className="grid gap-2">
                <Label htmlFor="admission-fee">Admission fee (CAD)</Label>
                <Input
                  id="admission-fee"
                  type="text"
                  inputMode="decimal"
                  disabled={editBlocked}
                  {...register("admissionFee")}
                />
                {formState.errors.admissionFee ? (
                  <p className={fieldError()}>{formState.errors.admissionFee.message}</p>
                ) : null}
              </div>
            ) : null}

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="start-time">Start time (ISO 8601)</Label>
              <Input id="start-time" disabled={editBlocked} {...register("startTime")} />
              {formState.errors.startTime ? (
                <p className={fieldError()}>{formState.errors.startTime.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-time">End time (ISO 8601)</Label>
              <Input id="end-time" disabled={editBlocked} {...register("endTime")} />
              {formState.errors.endTime ? (
                <p className={fieldError()}>{formState.errors.endTime.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone (IANA)</Label>
              <Input
                id="timezone"
                placeholder="America/Toronto"
                disabled={editBlocked}
                {...register("timezone")}
              />
              {formState.errors.timezone ? (
                <p className={fieldError()}>{formState.errors.timezone.message}</p>
              ) : null}
            </div>

            {showAddress ? (
              <>
                <p className="text-sm font-medium">Address</p>
                <div className="grid gap-2">
                  <Label htmlFor="addr1">Address line 1</Label>
                  <Input id="addr1" disabled={editBlocked} {...register("addressLine1")} />
                  {formState.errors.addressLine1 ? (
                    <p className={fieldError()}>{formState.errors.addressLine1.message}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr2">Address line 2 (optional)</Label>
                  <Input id="addr2" disabled={editBlocked} {...register("addressLine2")} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" disabled={editBlocked} {...register("city")} />
                    {formState.errors.city ? (
                      <p className={fieldError()}>{formState.errors.city.message}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" disabled={editBlocked} {...register("province")} />
                    {formState.errors.province ? (
                      <p className={fieldError()}>{formState.errors.province.message}</p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postal">Postal code</Label>
                  <Input id="postal" disabled={editBlocked} {...register("postalCode")} />
                  {formState.errors.postalCode ? (
                    <p className={fieldError()}>{formState.errors.postalCode.message}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            {showMeetingLink ? (
              <div className="grid gap-2">
                <Label htmlFor="meeting-link">Meeting link</Label>
                <Input id="meeting-link" type="url" disabled={editBlocked} {...register("meetingLink")} />
                {formState.errors.meetingLink ? (
                  <p className={fieldError()}>{formState.errors.meetingLink.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="cover-url">Cover image URL (optional)</Label>
              <Input id="cover-url" type="url" disabled={editBlocked} {...register("coverImageUrl")} />
              {formState.errors.coverImageUrl ? (
                <p className={fieldError()}>{formState.errors.coverImageUrl.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max-cap">Max capacity</Label>
              <Input id="max-cap" inputMode="numeric" disabled={editBlocked} {...register("maxCapacity")} />
              {formState.errors.maxCapacity ? (
                <p className={fieldError()}>{formState.errors.maxCapacity.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Categories (up to 3)</span>
              <div className="grid gap-2 rounded-lg border border-border p-3">
                {categories.map((cat) => {
                  const checked = categoryIds.includes(cat.id)
                  return (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={editBlocked || (!checked && categoryIds.length >= 3)}
                        onCheckedChange={(v) => {
                          const on = v === true
                          if (on && categoryIds.length >= 3) return
                          const next = on
                            ? [...categoryIds, cat.id]
                            : categoryIds.filter((id) => id !== cat.id)
                          setValue("categoryIds", next, { shouldValidate: true })
                        }}
                      />
                      {cat.name}
                    </label>
                  )
                })}
              </div>
              {formState.errors.categoryIds ? (
                <p className={fieldError()}>{formState.errors.categoryIds.message}</p>
              ) : null}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t bg-muted/50">
          <Button
            type="button"
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={handleCancel}
          >
            <CircleX data-icon="inline-start" className="size-4" aria-hidden />
            Cancel
          </Button>
          <Button
            type="submit"
            form="event-upsert-form"
            variant="default"
            disabled={saveMutation.isPending || !accessToken || editBlocked}
          >
            {mode === "create" ? (
              <>
                <Check data-icon="inline-start" className="size-4" aria-hidden />
                Create Event
              </>
            ) : (
              <>
                <Pencil data-icon="inline-start" className="size-4" aria-hidden />
                Edit Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
