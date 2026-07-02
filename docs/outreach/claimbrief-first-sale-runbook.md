# ClaimBrief First Sale Runbook

Goal: turn one reply into one redacted claim packet, one useful sample, and one
paid starter batch. This is concierge sales, not a finished SaaS motion.

## The Offer

One old closed or redacted property claim packet becomes a cited ClaimBrief
within 24 hours:

- denial reasons in the carrier's wording
- policy provisions and exclusions mentioned
- missing evidence checklist
- draft response outline for human review
- PDF/Markdown export

Boundary: no carrier contact, no legal advice, no claim negotiation, no coverage
determination, no homeowner-facing promise.

## Price Ladder

| Stage | Price | When To Offer |
| --- | ---: | --- |
| Free sample | $0 | First interested reply with a real packet. |
| Starter batch | $99 | Immediately after a useful sample. |
| Monthly pilot | $299/month | After they ask for repeated briefs or send multiple files. |
| White label setup | $1,500+ | Only after a paid pilot proves repeated use. |

## Day 0 Setup

- Create payment links for `ClaimBrief Starter - $99` and `ClaimBrief Monthly Pilot - $299/month`.
- Set `CLAIMBRIEF_POSTAL_ADDRESS` and regenerate outreach drafts.
- Run `npm run outreach:claimbrief:check` and fix every blocker before sending.
- Open `docs/outreach/generated/claimbrief-day-1-send-packet-2026-07-02.md`.
- Keep `docs/outreach/claimbrief-pipeline-tracker.csv` open while sending.
- Keep `docs/outreach/claimbrief-outbound-compliance-checklist.md` open for the pre-send gate.

## Day 1 Execution

- Send 35 direct emails or intentionally skip with tracker notes.
- Submit or call the first 20 contact-form/call leads.
- Update every touched row immediately: `status`, `last_touch_date`, `next_action`, and `notes`.
- Run `npm run outreach:claimbrief:tracker` after each sending block to refresh the pipeline summary.
- Do not add features, rewrite the product, or research a new wedge during Day 1.

Tracker update example:

```bash
npm run outreach:claimbrief:tracker -- --company "Palco Claims" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "sent first email"
```

## Call Script

```text
Hi, this is Sandy. I sent a short note about ClaimBrief, a document-review tool
for public adjusters. The simple version is: send one old redacted claim packet,
and I return a cited brief with denial reasons, policy language, missing evidence,
and a response outline.

Who in the office reviews carrier letters or policy language before a response
goes out?
```

If transferred:

```text
I am not asking for a meeting first. If you have one old closed or redacted file,
I can turn it into a sample ClaimBrief within 24 hours. If it is useless, I will
not follow up. Where should I send the sample format?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief. It turns a redacted property claim
packet into a cited review brief for a licensed professional to review. I sent
the sample format by email. If one old file would be useful, reply there and I
will make a free sample.
```

## Reply Triage

| Signal | Meaning | Action |
| --- | --- | --- |
| Sends packet | Strongest signal | Produce sample before doing anything else. |
| Asks price | Buying signal | Offer free sample and the $99 starter. |
| Asks sample | Proof request | Send sample link, then ask for one redacted file. |
| Asks security | Trust risk | Ask for old closed/redacted file; do not overpromise. |
| Says no CRM | Category confusion | Reframe as a one-file review packet. |
| Says no/stop | Not a lead | Mark opted out; no follow-up. |

## File Intake Message

```text
Great. Please send one old closed or redacted claim packet.

Best packet:
- policy excerpts or full policy
- carrier denial/coverage letter
- carrier estimate
- contractor/public-adjuster estimate if available
- key correspondence

Please remove anything you do not want reviewed. I will use it only to create
the sample ClaimBrief and will not contact any carrier, policyholder, or third
party.

Target turnaround: 24 hours.
```

## Sample Production Checklist

- Load the file into the local app or current ClaimBrief workflow.
- Extract cited source references before writing conclusions.
- Flag missing documents instead of guessing.
- Keep wording professional and editable, not final/adversarial.
- Export PDF and Markdown if possible.
- Add a short cover note with limitations and next step.

## Sample Delivery And Close

```text
I attached the sample ClaimBrief.

The useful test is simple: did this save review time or surface anything your
team would want to check?

If yes, I can do the starter batch:
- $99 for 3 ClaimBriefs
- send files by email/link
- I return PDF + Markdown review packets
- no annual contract

Should I send the starter payment link?
```

If they say yes:

```text
Great. Starter is $99 for 3 ClaimBriefs.

Payment link: {{stripe_starter_payment_link}}

After payment, send up to 3 redacted or active claim packets and I will return
each ClaimBrief as PDF + Markdown.
```

## Do Not Build Until

Keep selling manually until one of these happens:

- 2 prospects send real packets.
- 1 prospect pays $99.
- 1 prospect says yes to $299/month but names one blocker.

If none of those happen after 150 relevant prospects, change the wedge before
changing the product.
