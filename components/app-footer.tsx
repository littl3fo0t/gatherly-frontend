import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

const githubHref = process.env.NEXT_PUBLIC_PROFILE_GITHUB_URL ?? "https://github.com"
const linkedinHref = process.env.NEXT_PUBLIC_PROFILE_LINKEDIN_URL ?? "https://www.linkedin.com"
const mailHref = process.env.NEXT_PUBLIC_CONTACT_MAILTO ?? "mailto:hello@example.com"

export function AppFooter() {
  return (
    <footer className="mt-auto w-full bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-4 py-10">
        <p className="text-center text-base leading-relaxed">Made by Thomas, with 💖</p>
        <div className="flex items-center justify-center gap-10">
          <Link
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-opacity hover:opacity-80"
            aria-label="GitHub profile"
          >
            <Github className="size-10" strokeWidth={1.75} aria-hidden />
          </Link>
          <Link
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-opacity hover:opacity-80"
            aria-label="LinkedIn profile"
          >
            <Linkedin className="size-10" strokeWidth={1.75} aria-hidden />
          </Link>
          <Link
            href={mailHref}
            className="text-white transition-opacity hover:opacity-80"
            aria-label="Send email"
          >
            <Mail className="size-10" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </footer>
  )
}
