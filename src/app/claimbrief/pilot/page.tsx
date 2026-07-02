"use client";

import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  Mail,
  Receipt,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Footer from "@/components/footer";
import Logo from "@/components/logo";

const contactEmail =
  process.env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "hello@anaya.legal";

const buildMailto = (subject: string, body: string) =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

const starterFallbackHref = buildMailto(
  "ClaimBrief starter pilot",
  `Hi Sandy,

I want to start the ClaimBrief $99 starter pilot for 3 claim briefs.

Please send payment or invoice instructions and the packet workflow.
`
);

const monthlyFallbackHref = buildMailto(
  "ClaimBrief monthly pilot",
  `Hi Sandy,

I want to start or discuss the ClaimBrief $299/month pilot for up to 20 claim briefs.

Please send payment or invoice instructions and the packet workflow.
`
);

const sampleFallbackHref = buildMailto(
  "ClaimBrief free sample",
  `Hi Sandy,

I want to send one old closed or redacted claim packet for a free ClaimBrief sample before starting the paid pilot.

Please confirm the safest way to send the packet.
`
);

const pilotTiers = [
  {
    name: "Starter",
    price: "$99",
    detail: "3 ClaimBriefs",
    bestFor: "First paid batch after a useful free sample.",
    href: process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL || starterFallbackHref,
    cta: process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL ? "Pay for starter" : "Request starter invoice",
  },
  {
    name: "Monthly",
    price: "$299",
    detail: "up to 20 ClaimBriefs/month",
    bestFor: "One office with repeated denial, underpayment, or scope-review files.",
    href: process.env.NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL || monthlyFallbackHref,
    cta: process.env.NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL ? "Start monthly" : "Request monthly invoice",
  },
];

const included = [
  "Manual/concierge file intake during the pilot",
  "PDF and Markdown ClaimBrief output",
  "Claim overview with source references",
  "Carrier denial or underpayment reasons",
  "Policy provisions and exclusions mentioned",
  "Missing evidence checklist",
  "Draft response outline for human review",
];

const excluded = [
  "No legal advice",
  "No public-adjusting services",
  "No carrier contact or claim submission",
  "No coverage determination",
  "No settlement recommendation",
  "No homeowner-facing promises",
];

const workflow = [
  "Pay for the starter batch or monthly pilot.",
  "Send redacted or active claim packets by the agreed workflow.",
  "Receive each ClaimBrief as PDF and Markdown.",
  "Use, edit, or ignore the packet internally.",
  "Renew only if it saves review time.",
];

export default function ClaimBriefPilotPage() {
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
                <BadgeDollarSign className="h-4 w-4" />
                Concierge pilot, no annual contract
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Pay only after the sample proves useful.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                ClaimBrief is sold first as a small manual pilot: send files,
                get cited review packets back, renew only if the output saves
                review time for your office. If checkout links are not set up
                yet, the pilot can still close by manual invoice.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={pilotTiers[0].href}
                  target={process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL ? "_blank" : undefined}
                  rel={process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL ? "noreferrer" : undefined}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  {pilotTiers[0].cta}
                </a>
                <a
                  href={sampleFallbackHref}
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Try free sample first
                </a>
                <a
                  href="/claimbrief/intake"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  Packet instructions
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              {pilotTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{tier.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{tier.detail}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {tier.bestFor}
                      </p>
                    </div>
                    <div className="text-3xl font-semibold">{tier.price}</div>
                  </div>
                  <a
                    href={tier.href}
                    target={tier.href.startsWith("http") ? "_blank" : undefined}
                    rel={tier.href.startsWith("http") ? "noreferrer" : undefined}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
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
                    The paid pilot buys review packets, not a full claims
                    management platform.
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
                  <h2 className="text-xl font-semibold">Excluded</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    These boundaries keep the pilot narrow, useful, and safe.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {excluded.map((item) => (
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
                Pilot workflow
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Simple enough to start this week.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The first paid batch should prove whether the office wants more
                ClaimBriefs. No onboarding project, no implementation sprint.
              </p>
            </div>
            <div className="grid gap-3">
              {workflow.map((item, index) => (
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
              <h2 className="text-2xl font-semibold">Refund rule</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                If the first paid batch is not useful, do not renew. The point
                of the pilot is to prove review-time savings with real files,
                not to lock anyone into a contract.
              </p>
            </div>
            <a
              href={pilotTiers[0].href}
              target={process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL ? "_blank" : undefined}
              rel={process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL ? "noreferrer" : undefined}
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              <Receipt className="mr-2 h-4 w-4" />
              {pilotTiers[0].cta}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
