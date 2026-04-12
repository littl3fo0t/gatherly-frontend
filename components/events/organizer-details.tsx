export type OrganizerDetailsProps = {
  id: string
  name: string
}

/**
 * Host block for authenticated viewers only. Parent should render when the API
 * returned `organizer` (JWT-present request); do not pass guessed values.
 */
export function OrganizerDetails({ id, name }: OrganizerDetailsProps) {
  return (
    <section className="flex flex-col gap-1 border-t border-border pt-6" aria-labelledby="event-host-heading">
      <h2 id="event-host-heading" className="text-sm font-medium text-muted-foreground">
        Host
      </h2>
      <p className="text-base font-medium text-foreground" data-organizer-id={id}>
        {name}
      </p>
    </section>
  )
}
