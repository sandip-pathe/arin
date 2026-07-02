# ClaimBrief Send Queue - 2026-07-02

Purpose: turn the ClaimBrief wedge into replies, sample files, and first paid pilots.

This queue uses only public company/contact information collected from company pages, public search results, and public directories/pages. Do not invent missing emails. If the row says `contact_form`, use the form or call the office after sending the form.

Current queue size: 100 prospects, with 35 direct-email leads and 65 contact-form/call leads. The generated send board and pipeline tracker are the source of truth after regeneration.

Generate send-ready files with:

```bash
npm run outreach:claimbrief
npm run outreach:claimbrief:check
npm run outreach:claimbrief:tracker
npm run outreach:claimbrief:dashboard
npm run outreach:claimbrief:identity
npm run outreach:claimbrief:today
npm run outreach:claimbrief:today-paths
npm run outreach:claimbrief:today-plan
npm run outreach:claimbrief:first-attempt
npm run outreach:claimbrief:form-call-sprint
```

The default sample URL is `https://app.anaya.legal/samples/claimbrief-sample-review.html`. Set `CLAIMBRIEF_SAMPLE_URL` before generating if a different deployed URL is needed.

Generated outputs:

- `docs/outreach/generated/claimbrief-direct-email-mailmerge-2026-07-02.csv`
- `docs/outreach/generated/claimbrief-direct-email-drafts-2026-07-02.md`
- `docs/outreach/generated/claimbrief-contact-form-messages-2026-07-02.csv`
- `docs/outreach/generated/claimbrief-contact-form-drafts-2026-07-02.md`
- `docs/outreach/generated/claimbrief-identity-readiness-2026-07-02.md`
- `docs/outreach/generated/claimbrief-send-board-2026-07-02.html`
- `docs/outreach/generated/claimbrief-first-attempt-packet-2026-07-02.md`
- `docs/outreach/generated/claimbrief-today-execution-plan-2026-07-02.html`
- `docs/outreach/generated/claimbrief-today-action-sheet-2026-07-02.html`
- `docs/outreach/generated/claimbrief-today-contact-paths-2026-07-02.md`
- `docs/outreach/generated/claimbrief-form-call-sprint-2026-07-02.html`
- `docs/outreach/generated/claimbrief-day-1-send-packet-2026-07-02.md`
- `docs/outreach/generated/claimbrief-direct-email-eml-2026-07-02/`
- `docs/outreach/generated/claimbrief-send-readiness-report-2026-07-02.md`
- `docs/outreach/generated/claimbrief-pipeline-summary-2026-07-02.md`
- `docs/outreach/generated/claimbrief-command-center-2026-07-02.html`

Readiness is channel-specific. Direct email requires a valid physical mailing
address. Contact forms and manual calls can be worked first if email remains
blocked.

Use the form/call sprint board for the no-address path. It shows only the
unattempted contact-form/call queue and copyable text; it does not submit
anything.

Use the today action sheet first when starting from zero. It narrows the queue
to five Oklahoma wind/hail targets with exact form copy, call openers, and
tracker commands.

Use the today contact-path report before opening those pages. It checks the
public target pages for static forms and flags claim-specific fields that should
route you to a call instead of a form submit.

Use the today execution plan as the actual operator board. It combines the
target list and contact-path evidence into a form-first or call-first action,
short message, phone opener, voicemail, and tracker commands.

Use the first attempt packet to check whether the sender identity and reply
contact values are set before the first real submit/call attempt.

No-env first move:

```bash
npm run outreach:claimbrief:check
npm run outreach:claimbrief:identity
npm run outreach:claimbrief:today
npm run outreach:claimbrief:today-paths
npm run outreach:claimbrief:today-plan
npm run outreach:claimbrief:first-attempt
npm run outreach:claimbrief:form-call-sprint
```

Then open `docs/outreach/generated/claimbrief-first-attempt-packet-2026-07-02.md`
and `docs/outreach/generated/claimbrief-today-execution-plan-2026-07-02.html`.
Use the broader form/call sprint only if none of those creates a reply or packet
request.

Use after replies start:

- `docs/outreach/claimbrief-reply-and-close-playbook.md`
- `docs/outreach/claimbrief-first-sale-runbook.md`
- `docs/outreach/claimbrief-outbound-compliance-checklist.md`
- `docs/outreach/claimbrief-pipeline-tracker.csv`

## Offer To Send

Use the "free sample" offer:

> Send one old closed or redacted claim packet. I will return a ClaimBrief sample within 24 hours. If it is useless, tell me and I will not follow up.

Sample packet path:

- `/samples/claimbrief-sample-review.html`
- `/claimbrief/intake`
- `/claimbrief/pilot`

Do not pitch "AI." Pitch document review speed.

## Email-Ready First Batch

Send these first because they have public email addresses or email-like contact values.
For reviewable local drafts, open the `.eml` files in `docs/outreach/generated/claimbrief-direct-email-eml-2026-07-02/` or use the Day 1 packet.
Before real sends, replace the mailing-address placeholder in the drafts or regenerate with `CLAIMBRIEF_POSTAL_ADDRESS`.

| Order | Company | Contact | Why This Lead |
| ---: | --- | --- | --- |
| 1 | Palco Claims | `claims@palcoclaims.com` | Multi-state public adjusting, commercial roofs, hail, fire, water. |
| 2 | DCS PIA | `claims@dcspia.com` | Texas/South Florida firm with hail, flood, hurricane, fire, water. |
| 3 | Ocean Point Claims | `office@oceanpoint.claims` | Florida firm with denial/low-offer/delay playbooks. |
| 4 | InterCoastal Public Adjusters | `claims@InterCoastalPA.com` | Multi-state firm; denied home, business, and HOA claims. |
| 5 | Skyline Adjusters | `claims@skylineadjusters.com` | Public adjuster offices in Texas plus claims assistance. |
| 6 | Skipton Claims Management | `Office@skiptoninc.com` | Colorado/Texas/Florida, hail damage and commercial losses. |
| 7 | Your Public Adjuster | `info@YourPublicAdjuster.us` | Florida Hurricane Ian and wind/storm-surge claim work. |
| 8 | LRG Claims | `info@lrgclaims.com` | Multi-state denied, delayed, underpaid, municipal, school, and multifamily claims. |
| 9 | AllCity Adjusting | `info@allcityadjusting.com` | Large-loss public adjusting with an in-house claims CRM. |
| 10 | Triumph Consulting | `claims@triumphfl.com` | Florida denied claim appeals, deadlines, and free file review. |
| 11 | Peninsula Public Adjusters | `info@peninsulapublicadjusters.com` | Florida underpaid or denied claim evaluation and policy review. |
| 12 | United Claims Specialists | `claims@ucspa.com` | Louisiana denied property claims plus commercial and large-loss work. |
| 13 | Sill Public Adjusters | `info@sill.com` | Commercial and large residential property damage claims. |
| 14 | Alpha Public Adjusting | `claims@alphapublicadjusting.com` | Georgia/Florida public adjusting with public contact email. |
| 15 | Claim Monsters | `info@claimmonsters.com` | Texas denied and underpaid claims across hail, ice, wind, and hurricane damage. |
| 16 | National Claims Negotiators | `claims@ncnmail.com` | Texas storm claims for commercial, churches, property managers, and residential policyholders. |
| 17 | First Call Public Adjusters | `FirstCallPublicAdjusters@gmail.com` | Texas commercial roofs, residential claims, appraisals, and underpaid claims. |
| 18 | Continental Public Adjusters | `claims@contpa.com` | Florida denied, delayed, and underpaid commercial, residential, and condo claims. |
| 19 | Trust Public Adjusting Group | `Claims@TrustPublicAdjusting.com` | Florida residential and commercial claim review plus policy reviews. |
| 20 | Kruger Property Solutions | `claims@callkruger.com` | Restoration operator with insurance-denial guidance and storm workflow. |
| 21 | Claims Public Adjusting | `Claims@Claimspa.com` | Texas/Oklahoma/California public adjusting with public claims email. |
| 22 | Horse & Crown | `claims@horsecrown.com` | Florida appraisal, umpire, loss consulting, and estimating work. |
| 23 | 123Adjusting | `CLAIMS@123ADJUSTING.COM` | Florida property-damage public-adjusting outreach with public claims email. |
| 24 | Mission Property Loss Consultants | `info@missionae.com` | Commercial public adjusting, policy reviews, and storm/fire/water claims. |
| 25 | Feller Loss Consultants | `info@FellerClaims.com` | Nevada and nearby-state commercial and homeowner property-damage claims. |
| 26 | Accurate Claims Consulting | `info@myaccurateclaim.com` | California/Arizona/Connecticut/Georgia public adjusting with water/fire/mold claim examples. |
| 27 | Loti | `mike@loti.com` | Homeowner major-loss insurance recovery with software-enabled claim support. |
| 28 | 21st Century Public Adjusters | `21stclaims@gmail.com` | PA/NJ denied and underpaid claims with denial-letter upload workflow. |
| 29 | ProMaxx Public Adjusters | `promaxxadjusting@gmail.com` | PA/NJ/DE/MD residential damage claim review with carrier/damage intake fields. |
| 30 | Miller Public Adjusters | `contact@millerpublicadjusters.com` | Wisconsin/Iowa property claim review and denied fire-claim guidance. |
| 31 | Copper State Adjusting | `claims@csadjusting.com` | Arizona wind, hail, fire, water, storm, mold, and commercial BI claims. |
| 32 | SafeHnd Public Adjusters | `support@safehnd.com` | Virtual review for underpaid or denied claims and documentation strategy. |
| 33 | Rise Public Adjusters | `RisePAGeneral@gmail.com` | Florida/Texas/Georgia/Tennessee denied, underpaid, and delayed claims. |
| 34 | Tiger Adjusters | `info@tigeradjusters.com` | National public-adjuster network for policy interpretation, scoping, and estimates. |
| 35 | PrimeState Public Adjusters | `info@primestateadjusters.com` | Multi-office public adjusting for commercial and residential claims. |

## Contact Form / Phone First Batch

Use the same copy, but shorten the form message to 500 characters if needed. If the form asks for policyholder claim details, do not submit fake claim information; use the general message field only or call instead. The full list has 65 form/call targets; use the send board for every generated message. The table below is just the first manual batch so the page stays readable.

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
| 16 | AAA Public Adjusters | https://aaapublicadjusters.com/public-adjuster-lake-dequincy-louisiana/ |  |
| 17 | Prime Adjustments | https://primeadjustments.com/colorado-public-adjuster/ | 720-664-9536 |
| 18 | Gavnat | https://www.gavnat.com/location/texas/ |  |
| 19 | Gavnat | https://www.gavnat.com/location/colorado/ |  |

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

Sample format: https://app.anaya.legal/samples/claimbrief-sample-review.html

Worth trying on one file?

Sandy
```

## Contact Form Version

```text
I am testing ClaimBrief, a document-review tool for licensed claim professionals. It turns a policy, denial letter, estimates, and correspondence into a cited claim brief: denial reasons, policy provisions, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Sample: https://app.anaya.legal/samples/claimbrief-sample-review.html

Could I create one free sample from an old closed or redacted claim packet?
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

Sample format: https://app.anaya.legal/samples/claimbrief-sample-review.html

Sandy
```

## Daily Execution Target

Day 1:

- Send all 35 direct emails from the send board.
- Submit the first 20 contact forms or make 20 office calls.
- Track every outcome in `claimbrief-pipeline-tracker.csv`.

Day 2:

- Follow up with non-responders from the email-ready batch.
- Submit the next 25 contact forms/calls.
- Add 25 restoration-contractor prospects only if the first 100 produce no replies.
- Record a 60-90 second demo from `/claimbrief`.

Day 3:

- Submit the remaining 20 contact forms/calls.
- Manually produce every free sample with Anaya/ClaimBrief.
- Ask: "If I could do 20 of these a month for your office, would $299/month be worth it?"

## Stop Conditions

Switch wedge only if 150 relevant prospects produce:

- 0 replies,
- 0 sample claim packets,
- and no one names a missing paid feature.

If one person sends a real packet, do not build more features. Produce the sample, ask for payment or invoice approval, and learn from the output.
