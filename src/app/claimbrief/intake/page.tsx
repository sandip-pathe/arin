"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileArchive,
  Mail,
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

const packetEmailHref = buildMailto(
  "ClaimBrief redacted packet instructions",
  `Hi Sandy,

I want to send one old closed or redacted property-insurance claim packet for a free ClaimBrief sample.

I understand the best packet includes:
- policy excerpts or full policy
- carrier denial or coverage letter
- carrier estimate
- contractor or public-adjuster estimate if available
- key correspondence

Please confirm the safest way to send the packet.
`
);

const includeItems = [
  "Policy excerpts or full policy",
  "Carrier denial or coverage letter",
  "Carrier estimate",
  "Contractor or public-adjuster estimate",
  "Important claim correspondence",
  "Questions your reviewer wants checked",
];

const redactItems = [
  "Policyholder name, phone, email, and mailing address",
  "Claim number, policy number, and loss address",
  "Photos or notes that identify people who did not consent",
  "Banking, payment, tax, or medical information",
  "Anything you would not want used for a one-file sample",
];

const outputItems = [
  "Cited claim overview",
  "Carrier position in its own wording",
  "Policy provisions and exclusions mentioned",
  "Missing evidence checklist",
  "Estimate or scope mismatch notes",
  "Draft response outline for human review",
];

export default function ClaimBriefIntakePage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
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
        <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Redacted or closed files first
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Send one safe packet. Get one cited ClaimBrief back.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Use this page after someone says yes to a free sample. It
                explains what to send, what to remove, and what ClaimBrief will
                return within 24 hours.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={packetEmailHref}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Ask where to send packet
                </a>
                <a
                  href="/samples/claimbrief-sample-review.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  View sample output
                </a>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                This page does not upload, store, or transmit files. It only
                opens an email draft to request the safest packet-transfer path.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <FileArchive className="mt-1 h-6 w-6 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-semibold">Best packet shape</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    One claim packet is enough. Do not bundle several claims
                    together for the first sample.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {includeItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
                <div>
                  <h2 className="text-xl font-semibold">Redact before sending</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use an old closed file first. Remove anything that is not
                    needed to judge whether the brief format is useful.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {redactItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-700" />
                <div>
                  <h2 className="text-xl font-semibold">What comes back</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The output is an internal review packet for a licensed
                    professional to edit, approve, or ignore.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {outputItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
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
              <h2 className="text-2xl font-semibold">Boundary</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                ClaimBrief does not contact carriers, submit claims, negotiate
                claims, tell policyholders what to accept, provide legal advice,
                or make coverage determinations.
              </p>
            </div>
            <a
              href={packetEmailHref}
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              <Mail className="mr-2 h-4 w-4" />
              Ask where to send
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
