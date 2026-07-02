"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileArchive,
  Mail,
  Receipt,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Footer from "@/components/footer";
import Logo from "@/components/logo";

const contactEmail =
  process.env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "hello@anaya.legal";

const starterUrl = process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL;

const buildMailto = (subject: string, body: string) =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

const invoiceHref = buildMailto(
  "ClaimBrief starter invoice request",
  `Hi Sandy,

I want to start the ClaimBrief $99 starter batch for 3 claim briefs.

Please send payment or invoice instructions and the packet workflow.

I understand ClaimBrief creates document-review packets for professional review and does not provide legal advice, public-adjusting services, carrier submission, claim negotiation, or coverage determinations.
`
);

const packetHref = buildMailto(
  "ClaimBrief starter packet workflow",
  `Hi Sandy,

I am ready to send claim packets for the ClaimBrief starter batch.

Please confirm the safest packet-transfer workflow.
`
);

const included = [
  "3 concierge ClaimBrief review packets",
  "PDF and Markdown output",
  "Carrier position and source references",
  "Policy provisions and exclusions mentioned",
  "Missing evidence checklist",
  "Draft response outline for human review",
];

const notIncluded = [
  "No legal advice",
  "No public-adjusting services",
  "No carrier contact or claim submission",
  "No coverage determination",
  "No settlement recommendation",
  "No homeowner-facing communication",
];

const steps = [
  "Pay by checkout link or request a manual invoice.",
  "Send up to 3 claim packets using the agreed workflow.",
  "Receive each ClaimBrief as PDF and Markdown.",
  "Use, edit, or ignore each packet internally.",
];

export default function ClaimBriefStarterPage() {
  const payHref = starterUrl || invoiceHref;
  const payLabel = starterUrl ? "Pay $99 starter" : "Request $99 invoice";

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo />
          <a
            href="/claimbrief/pilot"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Pilot details
          </a>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <Receipt className="h-4 w-4" />
                Starter batch
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Start with 3 ClaimBriefs for $99.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Use this after the free sample is useful, or when an office
                wants to skip straight to a small paid batch. The starter is a
                manual concierge service, not a software subscription.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={payHref}
                  target={starterUrl ? "_blank" : undefined}
                  rel={starterUrl ? "noreferrer" : undefined}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  {payLabel}
                </a>
                <a
                  href={packetHref}
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Ask packet workflow
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
                Contact email: {contactEmail}
              </p>
            </div>

            <div className="border-l border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start gap-3">
                <FileArchive className="mt-1 h-6 w-6 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-semibold">Starter scope</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Each ClaimBrief covers one property-claim packet. Do not
                    combine multiple unrelated claims into one brief.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-sm font-medium text-slate-500">Price</div>
                  <div className="mt-1 text-3xl font-semibold">$99</div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-sm font-medium text-slate-500">Output</div>
                  <div className="mt-1 text-base font-semibold">
                    3 PDF + Markdown review packets
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-sm font-medium text-slate-500">Renewal</div>
                  <div className="mt-1 text-base font-semibold">
                    No contract; move to monthly only if useful
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-700" />
                <div>
                  <h2 className="text-xl font-semibold">Included</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The paid starter buys useful artifacts, not seats or setup.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-1 h-6 w-6 shrink-0 text-rose-700" />
                <div>
                  <h2 className="text-xl font-semibold">Not Included</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep the first paid batch narrow so it can be fulfilled
                    fast and safely.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                <ShieldCheck className="h-4 w-4" />
                Payment-to-packet workflow
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                The starter is intentionally simple.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Close the smallest useful batch, fulfill it manually, then
                decide whether the office has enough volume for the monthly
                pilot.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((item, index) => (
                <div
                  key={item}
                  className="grid grid-cols-[auto_1fr] gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-8 text-white sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">After payment</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                Use the intake instructions before sending files. Start with
                redacted or closed packets whenever possible.
              </p>
            </div>
            <a
              href="/claimbrief/intake"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              Packet instructions
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
