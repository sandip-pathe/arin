"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { v7 } from "uuid";
import {
  ArrowRight,
  BadgeDollarSign,
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
    detail: "3 claim briefs",
    envUrl: process.env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL,
    fallbackHref: starterFallbackHref,
  },
  {
    name: "Monthly",
    price: "$299",
    detail: "up to 20 briefs",
    envUrl: process.env.NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL,
    fallbackHref: monthlyFallbackHref,
  },
  {
    name: "White label",
    price: "$1,500",
    detail: "setup plus monthly support",
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
                Built for licensed claim professionals
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Cited insurance claim briefs from messy claim packets.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Upload a policy, denial letter, estimate, or claim
                correspondence. ClaimBrief turns it into a professional review
                packet with source-linked facts, evidence gaps, and response
                outline.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={startClaimBrief}
                  className="h-12 rounded-md bg-slate-950 px-5 text-base text-white hover:bg-slate-800"
                >
                  Create sample brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a
                  href="#cold-outreach"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  View outreach offer
                </a>
                <a
                  href="#request-sample"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-700 bg-emerald-700 px-5 text-base font-medium text-white hover:bg-emerald-800"
                >
                  Request free sample
                </a>
                <a
                  href="/samples/claimbrief-sample-review.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  View sample packet
                </a>
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
            </div>
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
              <h2 className="text-xl font-semibold">Sell First Pricing</h2>
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
                        {tier.envUrl ? "Pay" : "Ask"}
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
                The first useful sale is not a subscription screen. It is one
                real packet, one useful output, then a small paid batch.
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
                  Start $99 pilot
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
            <h2 className="text-2xl font-semibold">Cold Outreach Offer</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Send one old closed or redacted claim packet. I will return a
              free ClaimBrief sample within 24 hours. If it is useless, tell me
              and I will not follow up.
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
              I am testing a small tool for public adjusters that turns claim
              documents into a cited review brief: denial reasons, policy
              provisions, missing evidence, and draft response outline. No
              carrier contact, no legal advice, no homeowner-facing promises.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
