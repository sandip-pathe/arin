"use client";

import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Mail,
  Receipt,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import Footer from "@/components/footer";
import Logo from "@/components/logo";

const contactEmail =
  process.env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "hello@anaya.legal";

const buildMailto = (subject: string, body: string) =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

const sampleHref = buildMailto(
  "Oklahoma wind/hail ClaimBrief sample",
  `Hi Sandy,

I want to test ClaimBrief on one old closed or redacted Oklahoma wind/hail claim packet.

The packet can include:
- policy excerpts or full policy
- carrier denial or coverage letter
- carrier estimate
- contractor or public-adjuster estimate if available
- key correspondence

Please confirm the safest way to send the packet.
`
);

const reviewItems = [
  "Carrier position in its own wording",
  "Policy provisions and exclusions mentioned",
  "Roof, wind, hail, and scope facts found in the packet",
  "Missing evidence checklist",
  "Estimate or scope mismatch notes",
  "Draft response outline for human review",
];

const packetItems = [
  "Policy or relevant policy excerpts",
  "Carrier denial, coverage, or partial-payment letter",
  "Carrier estimate and any supplement estimate",
  "Public-adjuster, contractor, or engineering notes if available",
  "Important email, portal, or letter correspondence",
  "Questions the reviewer wants checked",
];

const boundaries = [
  "No legal advice",
  "No public-adjusting services",
  "No carrier contact",
  "No claim submission",
  "No coverage determination",
  "No settlement recommendation",
];

export default function OklahomaHailPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo />
          <a
            href="/claimbrief"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ClaimBrief
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[calc(100vh-68px)] overflow-hidden border-b border-slate-200 bg-slate-950">
          <Image
            src="/claimbrief-preview.png"
            alt="ClaimBrief document analysis workspace"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="relative mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl flex-col justify-center px-4 py-12 text-white sm:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Oklahoma wind/hail claim packet review
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
                Turn one Oklahoma wind/hail file into a cited review brief.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
                For public adjusters and claim professionals reviewing denied,
                underpaid, or disputed property files. Send one old closed or
                redacted packet and get a ClaimBrief with source-linked facts,
                evidence gaps, and a response outline.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={sampleHref}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-base font-semibold text-slate-950 hover:bg-slate-100"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request free Oklahoma sample
                </a>
                <a
                  href="/claimbrief/starter"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/50 px-5 text-base font-semibold text-white hover:bg-white/10"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Start $99 batch
                </a>
                <a
                  href="/samples/claimbrief-sample-review.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/50 px-5 text-base font-semibold text-white hover:bg-white/10"
                >
                  View sample output
                </a>
              </div>
            </div>
            <div className="mt-10 grid max-w-4xl gap-3 text-sm leading-6 text-slate-100 md:grid-cols-3">
              <div className="border-l border-emerald-300/60 pl-4">
                Free first sample from one old closed or redacted packet.
              </div>
              <div className="border-l border-emerald-300/60 pl-4">
                $99 starter batch for 3 ClaimBriefs if the sample helps.
              </div>
              <div className="border-l border-emerald-300/60 pl-4">
                Manual concierge workflow until real demand proves automation.
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                <TriangleAlert className="h-4 w-4" />
                Why now
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                The trigger is timely, but the pitch stays careful.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The Oklahoma Attorney General announced a June 24, 2026 lawsuit
                alleging State Farm wrongfully denied or underpaid legitimate
                hail and wind damage claims. ClaimBrief does not take a position
                on any carrier or claim. The practical point is simpler:
                Oklahoma wind/hail files are document-heavy, current, and worth
                reviewing quickly.
              </p>
              <a
                href="https://oklahoma.gov/oag/news/newsroom/2026/june/drummond-files-new-lawsuit-against-state-farm.html"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Official Oklahoma AG source
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {reviewItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div>
              <FileSearch className="mb-3 h-7 w-7 text-blue-700" />
              <h2 className="text-2xl font-semibold">Best packet to send</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                One claim packet is enough. Use an old closed file or redact
                anything the office does not want reviewed.
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {packetItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ShieldCheck className="mb-3 h-7 w-7 text-blue-700" />
              <h2 className="text-2xl font-semibold">Boundaries</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                ClaimBrief is a document-review artifact for licensed
                professionals. It is not a claim-handling service.
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {boundaries.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-8 text-white sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">
                Try one Oklahoma file first.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                If the output does not save review time, do not pay. If it
                helps, the next step is the $99 starter batch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={sampleHref}
                className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                <Mail className="mr-2 h-4 w-4" />
                Request sample
              </a>
              <a
                href="/claimbrief/intake"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/50 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Packet instructions
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
