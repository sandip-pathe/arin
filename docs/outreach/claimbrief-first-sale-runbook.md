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

- Create payment links for `ClaimBrief Starter - $99` and `ClaimBrief Monthly Pilot - $299/month`, or prepare a manual invoice/payment reply. Do not wait on checkout setup before offering the free sample.
- Set `CLAIMBRIEF_POSTAL_ADDRESS` and regenerate outreach drafts.
- Run `npm run outreach:claimbrief:check` and fix every blocker before sending.
- Run `npm run outreach:claimbrief:check:form-call` when working only the
  contact-form/call channel while direct email is blocked.
- Open `docs/outreach/generated/claimbrief-day-1-send-packet-2026-07-02.md`.
- Keep `docs/outreach/claimbrief-pipeline-tracker.csv` open while sending.
- Keep `docs/outreach/claimbrief-outbound-compliance-checklist.md` open for the pre-send gate.
- Use `/claimbrief/intake` after a positive reply so the prospect knows what to redact and send.
- Use `/claimbrief/pilot` when someone asks price or after a useful free sample.
- Use `/claimbrief/starter` when someone is ready for the $99 starter batch or needs invoice/payment instructions.
- If direct email is blocked by the missing postal address, start with contact forms and calls. Do not wait to sell.

## Day 1 Execution

- Send 35 direct emails or intentionally skip with tracker notes.
- Submit or call the first 20 contact-form/call leads.
- Update every touched row immediately: `status`, `last_touch_date`, `next_action`, and `notes`.
- Run `npm run outreach:claimbrief:tracker` after each sending block to refresh the pipeline summary.
- Do not add features, rewrite the product, or research a new wedge during Day 1.

No-address path:

- Work only `contact_form` rows until `CLAIMBRIEF_POSTAL_ADDRESS` is set.
- Run `npm run outreach:claimbrief:check:form-call` and use
  `docs/outreach/generated/claimbrief-form-call-readiness-report-2026-07-02.md`
  as the channel gate.
- Use the generated form/call copy and public phone numbers.
- Do not send `.eml` drafts while the postal placeholder is present.

Timely trigger path:

- Use `docs/outreach/claimbrief-oklahoma-wind-hail-sprint-2026-07-02.md`
  when the broad queue feels too generic.
- Run `npm run outreach:claimbrief:live-check` before using any public URL in
  outreach.
- Use `https://app.anaya.legal/claimbrief/oklahoma-hail` for Oklahoma wind/hail
  form and call follow-up after live-check passes. If it ever fails, set
  `CLAIMBRIEF_OKLAHOMA_OFFER_URL=https://app.anaya.legal/claimbrief` and
  regenerate the sprint board.
- Run `npm run outreach:claimbrief:trigger-sprint`.
- Work Oklahoma wind/hail targets before adding more generic public-adjuster
  leads.

## First 45-Minute Form/Call Sprint

Use this when no ClaimBrief sales env vars are visible locally.

1. Run `npm run outreach:claimbrief:check`.
2. Run `npm run outreach:claimbrief:check:form-call`.
3. Confirm the form/call report is `READY` or `READY_WITH_WARNINGS`.
4. Run `npm run outreach:claimbrief:form-call-sprint`.
5. Open `docs/outreach/generated/claimbrief-form-call-sprint-2026-07-02.html`.
6. Work targets from top to bottom.
7. For each target, open the public contact page and use only general contact fields.
8. If the form asks for policyholder, claim number, loss address, carrier, or fake claim details, do not submit it; call instead or copy the skip tracker command.
9. After every submitted form, call, or skip, copy the matching tracker command from the sprint board and run it locally.
10. Run `npm run outreach:claimbrief:tracker` after the sprint to refresh the pipeline summary.

Stop the sprint immediately if someone replies, asks for a sample, or offers to
send a packet. Move to reply handling and produce the sample before touching
more leads.

Fulfillment kit:

- `docs/outreach/claimbrief-sample-fulfillment-kit.md`

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
| Asks price | Buying signal | Send `/claimbrief/pilot` and `/claimbrief/starter`, offer free sample, and explain the $99 starter. |
| Asks sample | Proof request | Send sample link, then ask for one redacted file. |
| Asks security | Trust risk | Ask for old closed/redacted file; do not overpromise. |
| Says no CRM | Category confusion | Reframe as a one-file review packet. |
| Says no/stop | Not a lead | Mark opted out; no follow-up. |

## File Intake Message

```text
Great. Please send one old closed or redacted claim packet.

Packet instructions:
https://app.anaya.legal/claimbrief/intake

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

- Open `docs/outreach/claimbrief-sample-fulfillment-kit.md`.
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

Pilot details:
https://app.anaya.legal/claimbrief/pilot

Starter checkout or invoice request:
https://app.anaya.legal/claimbrief/starter

Should I send the starter payment or invoice instructions?
```

If they say yes:

```text
Great. Starter is $99 for 3 ClaimBriefs.

Pilot details:
https://app.anaya.legal/claimbrief/pilot

Starter checkout or invoice request:
https://app.anaya.legal/claimbrief/starter

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
