"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { v7 } from "uuid";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileSearch,
  Mail,
  Receipt,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import Logo from "@/components/logo";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings-store";
import useSessionStore from "@/store/session-store";
import { resetDocuments } from "@/lib/document-refs";

const evidence = [
  "Denial letters",
  "Insurance policies",
  "Carrier estimates",
  "Contractor estimates",
  "Claim correspondence",
];

const outputs = [
  "Carrier denial or underpayment reasons",
  "Policy provisions, exclusions, and deadlines found",
  "Estimate or scope mismatches",
  "Missing evidence checklist",
  "Draft response outline for human review",
];

const pilotSteps = [
  {
    title: "Send one redacted packet",
    detail: "Use an old closed file first: policy, denial letter, estimates, and key correspondence.",
  },
  {
    title: "Get the cited brief",
    detail: "Receive a PDF/Markdown review packet with source-linked facts and evidence gaps.",
  },
  {
    title: "Only pay if it helps",
    detail: "Move to $99 for 3 briefs or $299/month for up to 20 briefs after the sample proves useful.",
  },
];

const contactEmail =
  process.env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "hello@anaya.legal";

const buildMailto = (subject: string, body: string) =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

const sampleRequestHref = buildMailto(
  "ClaimBrief sample request",
  `Hi Sandy,

I want to try one free ClaimBrief sample.

I can send an old closed or redacted property-insurance claim packet with:
- policy excerpts or full policy
- carrier denial or coverage letter
- carrier estimate
- contractor or public-adjuster estimate if available
- key correspondence

Please confirm the safest way to send the packet.
`
);

const starterFallbackHref = buildMailto(
  "ClaimBrief starter pilot",
  `Hi Sandy,

I want to start the ClaimBrief $99 starter pilot for 3 claim briefs.

Please send the payment link and packet instructions.
`
);

const monthlyFallbackHref = buildMailto(
  "ClaimBrief monthly pilot",
  `Hi Sandy,

I want to discuss the ClaimBrief $299/month pilot for up to 20 claim briefs.

Please send the payment link and packet workflow.
`
);

const whiteLabelFallbackHref = buildMailto(
  "ClaimBrief white-label setup",
  `Hi Sandy,

I want to discuss the ClaimBrief white-label setup.

Please send the setup details, payment link, and rollout steps.
`
);

const pricing = [
  {
    name: "Starter",
    price: "$99",
    detail: "3 concierge claim briefs after the free sample",
    envUrl: process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL,
    fallbackHref: starterFallbackHref,
  },
  {
    name: "Monthly",
    price: "$299",
    detail: "up to 20 briefs/month for one office workflow",
    envUrl: process.env.NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL,
    fallbackHref: monthlyFallbackHref,
  },
  {
    name: "White label",
    price: "$1,500",
    detail: "branded setup after a paid pilot works",
    envUrl: process.env.NEXT_PUBLIC_CLAIMBRIEF_WHITELABEL_URL,
    fallbackHref: whiteLabelFallbackHref,
  },
];

export default function ClaimBriefPage() {
  const router = useRouter();
  const { updateSettings } = useSettingsStore();
  const { resetSessionState } = useSessionStore();

  const startClaimBrief = () => {
    updateSettings({
      summary: {
        workflow: "claim-brief",
        jurisdiction: "us-property-claims",
        tone: "professional",
        style: "detailed",
        length: "medium",
      },
    });
    resetSessionState();
    resetDocuments();
    router.push(`/s/${v7()}?new=true&workflow=claim-brief`);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo />
          <Button
            onClick={startClaimBrief}
            className="h-10 rounded-md bg-slate-950 px-4 text-white hover:bg-slate-800"
          >
            Create Brief
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                24-hour concierge pilot for licensed claim professionals
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Cited property-claim review briefs in 24 hours.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Send one old closed or redacted property-insurance claim packet.
                ClaimBrief turns the policy, denial letter, estimates, and
                correspondence into a professional review packet with
                source-linked facts, evidence gaps, and a response outline.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={sampleRequestHref}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request free sample
                </a>
                <a
                  href="/claimbrief/pilot"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Pilot details
                </a>
                <a
                  href="/samples/claimbrief-sample-review.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  View sample packet
                </a>
                <a
                  href="/claimbrief/intake"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  Packet instructions
                </a>
                <Button
                  onClick={startClaimBrief}
                  className="h-12 rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  Try local brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                ClaimBrief does not negotiate claims, contact carriers, submit
                paperwork, or provide legal advice. It organizes documents and
                drafts review material for human approval.
              </p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xl">
                <Image
                  src="/claimbrief-preview.png"
                  alt="ClaimBrief document analysis workspace"
                  width={1280}
                  height={720}
                  priority
                  className="h-auto w-full"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {pilotSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <h2 className="text-sm font-semibold text-slate-950">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-950 px-4 py-6 text-white sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                <Clock3 className="h-4 w-4" />
                Free first sample
              </div>
              <p className="text-sm leading-6 text-slate-200">
                If the brief does not save review time, do not pay. If it helps,
                the starter batch is $99 for 3 briefs.
              </p>
            </div>
            <a
              href="#request-sample"
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              See packet requirements
            </a>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#f7f9fc] px-4 py-10 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            <div>
              <FileSearch className="mb-3 h-7 w-7 text-blue-700" />
              <h2 className="text-xl font-semibold">Documents In</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {evidence.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <FileCheck2 className="mb-3 h-7 w-7 text-blue-700" />
              <h2 className="text-xl font-semibold">Brief Out</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                {outputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <BadgeDollarSign className="mb-3 h-7 w-7 text-blue-700" />
              <h2 className="text-xl font-semibold">Pilot Pricing</h2>
              <div className="mt-4 grid gap-2">
                {pricing.map((tier) => (
                  <div
                    key={tier.name}
                    className="grid gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <div className="font-medium">{tier.name}</div>
                      <div className="text-sm text-slate-500">{tier.detail}</div>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-lg font-semibold">{tier.price}</div>
                      <a
                        href={tier.envUrl || tier.fallbackHref}
                        target={tier.envUrl ? "_blank" : undefined}
                        rel={tier.envUrl ? "noreferrer" : undefined}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
                      >
                        {tier.envUrl ? "Pay" : "Request"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="request-sample"
          className="border-b border-slate-200 bg-white px-4 py-10 sm:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                <UploadCloud className="h-4 w-4" />
                Free first sample
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Send one closed or redacted packet. Get a brief back in 24
                hours.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The first step is deliberately manual: one real packet, one
                useful output, then a small paid batch if the review packet
                earns it.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={sampleRequestHref}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request sample by email
                </a>
                <a
                  href={pricing[0].envUrl || pricing[0].fallbackHref}
                  target={pricing[0].envUrl ? "_blank" : undefined}
                  rel={pricing[0].envUrl ? "noreferrer" : undefined}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  {pricing[0].envUrl ? "Start $99 pilot" : "Request $99 pilot"}
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Contact email: {contactEmail}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Policy excerpts or full policy",
                "Carrier denial or coverage letter",
                "Carrier estimate",
                "Contractor or public-adjuster estimate",
                "Important claim correspondence",
                "Questions the reviewer wants checked",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cold-outreach" className="bg-white px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold">What The Pilot Produces</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              ClaimBrief is a review artifact for professionals, not another
              claims CRM. The output is designed to be edited, shared
              internally, or ignored by a human reviewer.
            </p>
            <a
              href="/samples/claimbrief-sample-review.html"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Open sample ClaimBrief
            </a>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-700">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Cited claim overview",
                  "Carrier position in its own wording",
                  "Policy provisions and exclusions mentioned",
                  "Missing evidence checklist",
                  "Estimate or scope mismatches",
                  "Draft response outline for human review",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
