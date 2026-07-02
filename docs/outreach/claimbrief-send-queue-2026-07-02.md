# ClaimBrief Send Queue - 2026-07-02

Purpose: turn the ClaimBrief wedge into replies, sample files, and first paid pilots.

This queue uses only public company/contact information collected from company pages, public search results, and public directories/pages. Do not invent missing emails. If the row says `contact_form`, use the form or call the office after sending the form.

Generate send-ready files with:

```bash
npm run outreach:claimbrief
```

The default sample URL is `https://app.anaya.legal/samples/claimbrief-sample-review.html`. Set `CLAIMBRIEF_SAMPLE_URL` before generating if a different deployed URL is needed.

Generated outputs:

- `docs/outreach/generated/claimbrief-direct-email-mailmerge-2026-07-02.csv`
- `docs/outreach/generated/claimbrief-direct-email-drafts-2026-07-02.md`
- `docs/outreach/generated/claimbrief-contact-form-messages-2026-07-02.csv`
- `docs/outreach/generated/claimbrief-contact-form-drafts-2026-07-02.md`

Use after replies start:

- `docs/outreach/claimbrief-reply-and-close-playbook.md`
- `docs/outreach/claimbrief-pipeline-tracker.csv`

## Offer To Send

Use the "free sample" offer:

> Send one old closed or redacted claim packet. I will return a ClaimBrief sample within 24 hours. If it is useless, tell me and I will not follow up.

Sample packet path:

- `/samples/claimbrief-sample-review.html`

Do not pitch "AI." Pitch document review speed.

## Email-Ready First Batch

Send these first because they have public email addresses or email-like contact values.

| Order | Company | Contact | Why This Lead |
| ---: | --- | --- | --- |
| 1 | Palco Claims | `claims@palcoclaims.com` | Multi-state public adjusting, commercial roofs, hail, fire, water. |
| 2 | DCS PIA | `claims@dcspia.com` | Texas/South Florida firm with hail, flood, hurricane, fire, water. |
| 3 | Ocean Point Claims | `office@oceanpoint.claims` | Florida firm with denial/low-offer/delay playbooks. |
| 4 | InterCoastal Public Adjusters | `claims@InterCoastalPA.com` | Multi-state firm; denied home, business, and HOA claims. |
| 5 | Skyline Adjusters | `claims@skylineadjusters.com` | Public adjuster offices in Texas plus claims assistance. |
| 6 | Skipton Claims Management | `Office@skiptoninc.com` | Colorado/Texas/Florida, hail damage and commercial losses. |
| 7 | Your Public Adjuster | `info@YourPublicAdjuster.us` | Florida Hurricane Ian and wind/storm-surge claim work. |

## Contact Form / Phone First Batch

Use the same copy, but shorten the form message to 500 characters if needed. If the form asks for policyholder claim details, do not submit fake claim information; use the general message field only or call instead.

| Order | Company | Contact Path | Phone |
| ---: | --- | --- | --- |
| 8 | Noble Public Adjusting Group | https://noblepagroup.com/locations/la/ | 504-420-3466 |
| 9 | Abba Claims Consultants | https://www.abbaclaims.com/public-adjuster-texas/ | (888) 908-2042 |
| 10 | Experienced Public Adjusters | https://experiencedpublicadjusters.com/contact-us/ | (888) 881-8416 |
| 11 | Florida Public Adjusting | https://flapublicadjusting.com/ |  |
| 12 | Florida Loss Public Adjusters | https://floridaloss.com/ |  |
| 13 | Tutwiler & Associates | https://publicadjuster.com/contact/ | (813) 412-8357 |
| 14 | Insurance Claim Consultants | https://www.insuranceclaimconsultants.com/ | (800) 572-7914 |
| 15 | Global Patriot Adjusters | https://www.globalpatriotadjusters.com/new-orleans-la-public-insurance-adjusters | 813-402-8895 |

## Subject Lines

Use one of these, matched to the lead:

- `quick claim brief?`
- `brief from denial?`
- `hail file brief?`
- `hurricane file brief?`
- `roof claim brief?`
- `evidence checklist?`

## Base Email

```text
Hi {{first_name_or_team}},

{{first_line}}

I am testing ClaimBrief, a small tool that turns claim documents into a cited review brief for licensed claim professionals.

It reads the policy, denial letter, carrier estimate, contractor estimate, and correspondence, then outputs:

- denial reasons in the carrier's own wording
- policy provisions and exclusions mentioned
- missing evidence checklist
- draft response outline for human review

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed.

If you send one old closed or redacted claim packet, I will return a sample ClaimBrief in 24 hours. If it is useless, tell me and I will not follow up.

Worth trying on one file?

Sandy
```

## Contact Form Version

```text
I am testing ClaimBrief, a document-review tool for licensed claim professionals. It turns a policy, denial letter, estimates, and correspondence into a cited claim brief: denial reasons, policy provisions, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Could I create one free sample from an old closed or redacted claim packet?
```

## Phone Opener

```text
Hi, I am calling about a tiny document-review tool for public adjusters. The simple version: send one old redacted claim packet, and I return a cited brief with denial reasons, policy language, missing evidence, and a response outline. Who in the office reviews carrier letters or policy language before a response goes out?
```

## 48-Hour Follow-Up

```text
Subject: not a CRM

Hi {{first_name_or_team}},

Quick clarification: I am not selling another claims CRM.

This is just a "brief this messy file" tool for policies, denial letters, estimates, and adjuster correspondence.

The output is a PDF/Markdown review packet your team can edit or ignore.

I can do one free sample from a closed/redacted file. Want me to show you what it looks like?

Sandy
```

## Daily Execution Target

Day 1:

- Send 7 direct emails.
- Submit 8 contact forms or make 8 office calls.
- Track every outcome in `claimbrief-prospects-2026-07-02.csv`.

Day 2:

- Follow up with non-responders from the email-ready batch.
- Add 40 more prospects from Texas and Florida.
- Record a 60-90 second demo from `/claimbrief`.

Day 3:

- Manually produce every free sample with Anaya/ClaimBrief.
- Ask: "If I could do 20 of these a month for your office, would $299/month be worth it?"

## Stop Conditions

Switch wedge only if 150 relevant prospects produce:

- 0 replies,
- 0 sample claim packets,
- and no one names a missing paid feature.

If one person sends a real packet, do not build more features. Produce the sample, ask for payment, and learn from the output.
