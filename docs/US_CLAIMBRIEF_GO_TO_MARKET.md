# US Go-To-Market: ClaimBrief

Date: 2026-07-02

## Decision

Do not sell Anaya as a generic legal AI app.

Sell a niche version into the US property-insurance claims market:

> ClaimBrief turns property insurance policies, denial letters, estimates, and claim correspondence into a cited claim review brief for public adjusters and restoration contractors.

The first buyer is not a consumer, not a lawyer, and not a broad SMB owner.

The first buyer is:

- A licensed public adjuster.
- A small public-adjusting firm.
- A roofing or restoration contractor that handles insurance-backed jobs and already pays for supplement writing, claim documentation, or estimate review.

This is a money-first wedge. It does not require building a venture-scale startup story before trying to sell.

## Why This Wedge

### 1. The pain is current and expensive

Homeowners insurance claims are getting harder to collect. The Wall Street Journal reported that the five largest US home insurers made no payment on more than 44% of claims resolved last year, up from 36% a decade earlier.

Source: https://www.wsj.com/finance/the-home-insurance-coin-flip-nearly-half-of-claims-result-in-zero-payout-4b49acaf

Triple-I/ISO data shows that in 2023, 5.3% of insured homes had a claim, and property damage accounted for 97.3% of homeowners claims.

Source: https://www.iii.org/fact-statistic/facts-statistics-homeowners-and-renters-insurance

This creates a large stream of policy documents, denial letters, estimates, supplement requests, photos, and correspondence.

### 2. The buyer already gets paid from claim outcomes

Public adjusters represent policyholders in property insurance claims. NAPIA says they help prepare, present, and settle claims, and they work for the insured, not the carrier, roofer, or contractor.

Source: https://www.napia.com/what-is-a-public-adjuster

Texas Department of Insurance says public adjusters can charge up to 10% of the total amount the company pays on a claim.

Source: https://www.tdi.texas.gov/tips/public-adjusters.html

That matters because a tool that saves time or surfaces one missed coverage point has obvious ROI. It does not need to be a nice-to-have writing assistant.

### 3. There is already a paid software/service market

Roofing supplement services have familiar pricing anchors:

- 8% to 15% of recovered amount.
- $150 to $500 per supplement.
- $500 to $2,500 per month retainers.

Source: https://useproline.com/average-cost-of-roofing-supplement-services/

IA Solutions prices claim-related work at $150 for an estimate-only package, $300 for insurance contact, and 10% of RCV increase for a common supplement plan.

Source: https://www.iasolutions.claims/pricing

This gives us permission to price above $19/month. The buyer is used to paying per claim or per recovery, not only SaaS seats.

### 4. Competitors prove the category, but leave room for a smaller wedge

Claim Titan sells claims software with AI policy extraction, estimate comparison, document drafting, and demand-letter workflows.

Source: https://claimtitan.com/

Frontera sells AI property-claims software for public adjusters, including policy intelligence, claims intake, claim strategy, estimate comparison, and supplement generation.

Source: https://www.fronteraclaims.com/public-adjusters

DumbRoof positions around carrier-ready roofing supplement packages.

Source: https://www.dumbroof.ai/compare

The lesson is not "do not enter." The lesson is "do not build a full claims CRM." Start with a tiny, fast, cheap artifact: the cited claim brief.

## Why Anaya Fits

Anaya already has:

- PDF, DOCX, image, TXT, and Markdown ingestion.
- OCR for scanned documents.
- Text extraction and chunking.
- Server-side OpenAI routes.
- Grounded summary and chat.
- Local-first browser storage.
- PDF, Markdown, and TXT export.

The claim-brief version mostly needs:

- Claim-specific prompts.
- Multi-document labels.
- Claim output sections.
- A branded export.
- Safer disclaimers.
- A sample/demo claim packet.

This is a small product pivot, not a rewrite.

## Product Name

Working name:

> ClaimBrief

Tagline:

> Cited insurance claim briefs from policies, denial letters, and estimates.

Avoid saying:

- "Legal advice."
- "We fight insurers."
- "We negotiate claims."
- "We guarantee recovery."

Say:

- "Internal claim review."
- "Policy and correspondence intelligence."
- "Cited briefing for licensed claim professionals."
- "Drafts and checklists for human review."

## First Offer

Do not start with a self-serve SaaS subscription.

Start with a productized service plus lightweight tool access:

### Offer 1: Free sample brief

Ask public adjusters or restoration contractors to send one old, closed, redacted denial or underpaid claim packet.

Return:

- One-page claim overview.
- Carrier denial reason table.
- Policy provisions and exclusions mentioned.
- Missing evidence checklist.
- Potential questions for the adjuster/contractor to investigate.
- Draft response outline.
- Exported PDF and Markdown.

This proves value faster than a demo call.

### Offer 2: Paid pilot

Price:

- $99 for 3 claim briefs.
- $299/month for up to 20 briefs.
- $499/month for up to 50 briefs plus branded export template.

Keep it manually fulfilled at first. Use Anaya internally to generate the briefs. Only build SaaS automation after someone pays twice.

### Offer 3: White-label mini portal

Price:

- $1,500 setup.
- $299/month support and hosting.

Buyer gets:

- Their logo.
- Their colors.
- Branded PDF output.
- "Powered by ClaimBrief" optional.

Only offer this after the paid pilot works.

## First ICP

### Best first target

Small public-adjusting firms in:

- Texas.
- Florida.
- Louisiana.
- Colorado.
- Georgia.

Reason:

- Weather/property claim volume.
- Public adjuster directories exist.
- Denied and underpaid claims are part of their daily business.
- Small firms care about speed but cannot build internal AI systems.

### Secondary target

Roofing and restoration contractors doing insurance-backed jobs.

Reason:

- They already outsource supplement writing.
- Pricing anchors exist.
- They need better documentation quality.

Risk:

- Contractor/public-adjuster boundaries are regulated. In Texas, for example, public adjusters cannot act as contractors and contractors cannot advertise that they handle insurance claims.

Source: https://www.tdi.texas.gov/tips/public-adjusters.html

So the safer first buyer is the licensed public adjuster, not the roofer.

## Compliance Boundaries

This product must stay inside "document analysis for professional review."

Important boundaries:

- Do not sell direct claim negotiation.
- Do not submit claims.
- Do not contact carriers.
- Do not tell homeowners what settlement to accept.
- Do not market as legal advice.
- Do not market as a replacement for a licensed public adjuster or attorney.

Florida law says a public adjuster may not give legal advice or act in claims involving bodily injury, death, or noneconomic damages.

Source: https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.854.html

Texas says public adjusters cannot practice law, provide legal advice, work on health care claims, act as contractors, or take referral fees from claim participants.

Source: https://www.tdi.texas.gov/tips/public-adjusters.html

Positioning should be:

> ClaimBrief helps licensed claim professionals review documents faster. It produces drafts and checklists for human review. It does not provide legal advice, public adjusting services, or claim negotiation.

## Candidate Wedge Scorecard

Scale: 1 low, 5 high.

| Wedge | Pain | Ability to Pay | Reachable Leads | Build Delta | Regulatory Risk | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Public adjuster claim briefs | 5 | 5 | 4 | 2 | 3 | 19 |
| Roofing supplement prep | 5 | 4 | 4 | 4 | 4 | 17 |
| Franchise FDD first-pass report | 4 | 4 | 3 | 2 | 3 | 16 |
| HOA resale packet review | 3 | 3 | 4 | 2 | 3 | 15 |
| Generic SMB contract review | 3 | 3 | 3 | 2 | 4 | 13 |
| Health insurance appeal drafts | 5 | 2 | 4 | 3 | 5 | 9 |
| Immigration RFE review | 5 | 3 | 3 | 3 | 5 | 9 |

Winner: public adjuster claim briefs.

Reason: urgent, expensive, document-heavy, reachable, and close to what Anaya already does.

## Alternative Wedges To Keep In Pocket

### Franchise FDD first-pass report

The FTC Franchise Rule requires prospective franchisees to receive a disclosure document with 23 specific items.

Source: https://www.ftc.gov/legal-library/browse/rules/franchise-rule

FDD legal reviews can be expensive. One franchise law firm advertises a flat $3,000 FDD validation review delivered in 5 to 7 business days.

Source: https://lopeslawllc.com/fdd-review-what-to-expect/

This is a good second wedge if claim briefs fail. The product would be:

> Upload your FDD. Get a plain-English risk memo and attorney-question list before you pay for full legal review.

### HOA resale packet red flags

HOA resale packages can include resale certificates, governing documents, financial statements, rules, pending violations, special assessments, litigation, reserves, and planned capital expenditures.

Source: https://www.fsresidential.com/pennsylvania/news-events/articles/hoa-resale-package/

This is reachable through real estate agents, but willingness to pay is weaker and state-by-state disclosure rules complicate the copy.

## Landing Page Copy

### Hero

ClaimBrief

Turn insurance claim documents into a cited review brief in minutes.

Upload a policy, denial letter, carrier estimate, or claim correspondence. Get a structured brief with denial reasons, relevant policy language, missing evidence, and a response outline for professional review.

### CTA

Send one closed claim. I will return a free ClaimBrief sample within 24 hours.

### Trust copy

Built for licensed claim professionals. ClaimBrief does not negotiate claims, contact carriers, or provide legal advice. It organizes documents and drafts review materials for human approval.

### Feature bullets

- Policy coverage and exclusion map.
- Carrier denial reason extraction.
- Missing documentation checklist.
- Estimate and correspondence summary.
- Draft response outline.
- PDF and Markdown exports.
- Local-first workspace.

## Cold Outreach Plan

Reusable outreach assets:

- Lead template: `docs/outreach/claimbrief-leads-template.csv`
- First prospect list: `docs/outreach/claimbrief-prospects-2026-07-02.csv`
- Send queue: `docs/outreach/claimbrief-send-queue-2026-07-02.md`
- Reply and close playbook: `docs/outreach/claimbrief-reply-and-close-playbook.md`
- Pipeline tracker: `docs/outreach/claimbrief-pipeline-tracker.csv`
- Direct email mailmerge: `docs/outreach/generated/claimbrief-direct-email-mailmerge-2026-07-02.csv`
- Contact form messages: `docs/outreach/generated/claimbrief-contact-form-messages-2026-07-02.csv`
- Send board: `docs/outreach/generated/claimbrief-send-board-2026-07-02.html`
- Public sample packet: `public/samples/claimbrief-sample-review.html`
- Email sequence: `docs/outreach/claimbrief-email-sequence.md`
- AI personalization prompt: `docs/outreach/claimbrief-ai-personalization-prompt.md`

### Lead sources

Start with:

- NAPIA public adjuster directory.
- State public adjuster associations.
- Texas, Florida, Louisiana, Georgia, and Colorado public adjuster search results.
- Google Maps searches for "public adjuster roof claim", "public adjuster denied claim", "property claim adjuster".
- LinkedIn search: "public adjuster", "property claims consultant", "insurance recovery consultant".

NAPIA directory:

https://www.napia.com/find-a-public-adjuster

### Outreach volume

Week 1:

- Build 150 leads.
- Send 75 emails.
- Send 50 LinkedIn messages.
- Call 20 offices after email.
- Offer 10 free sample briefs.
- Try to close 3 paid pilots.

### Outreach angle

Do not pitch AI.

Pitch:

> I turn messy claim docs into a cited brief your adjuster can review before spending an hour reading the file.

## Cold Email Templates

### Email 1: free sample

Subject: quick claim brief from a denial letter?

Hi {{first_name}},

I am testing a small tool for public adjusters that turns claim documents into a cited review brief.

It reads the policy, denial letter, carrier estimate, and correspondence, then outputs:

- denial reasons by carrier wording
- policy provisions/exclusions mentioned
- missing evidence checklist
- draft response outline for your review

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed.

If you send one old closed or redacted claim packet, I will return a sample ClaimBrief in 24 hours. If it is useless, tell me and I will not follow up.

Worth trying on one file?

{{signature}}

### Email 2: after no reply

Subject: not a CRM

Hi {{first_name}},

Quick clarification: I am not selling another claims CRM.

This is just a "brief this messy file" tool for policies, denial letters, estimates, and adjuster correspondence.

The output is a PDF/Markdown review packet your team can edit or ignore.

I can do one free sample from a closed/redacted file. Want me to show you what it looks like?

{{signature}}

### Email 3: ROI angle

Subject: where did the carrier say no?

Hi {{first_name}},

The narrow use case is:

When a carrier denies or underpays, ClaimBrief extracts exactly what they relied on, maps it against the policy language in the packet, and creates a missing-evidence checklist.

If it saves 30 minutes on one file, it probably pays for itself. If it surfaces one missed provision, even better.

I am looking for 5 public adjusters to test it on real closed files this week.

Can I send you a sample?

{{signature}}

## LinkedIn Message

Hi {{first_name}}, I am testing a tiny document-review tool for public adjusters. It turns a policy + denial letter + estimate into a cited claim brief and missing-evidence checklist. Not a CRM, not legal advice. I can make one free sample from an old redacted claim if useful.

## Phone Opener

Hi, I sent a short email about ClaimBrief. It is a document-review tool for public adjusters. The simple version is: send a redacted denial or underpaid claim packet, and I return a cited brief with denial reasons, policy language, and missing evidence. Is there someone in the office who reviews carrier letters or policy language before responding?

## AI Lead Workflow

Use this prompt after collecting public leads:

```text
You are helping me personalize cold outreach to licensed public adjusters.

For each lead, infer one likely pain point from their website copy only. Do not invent facts. If the site mentions roof, storm, commercial, appraisal, denied claims, underpaid claims, fire, water, hurricane, or policy review, use that as the personalization hook.

Return CSV columns:
- company
- contact_name
- email
- state
- website
- observed_specialty
- personalization_line
- recommended_subject
- risk_flag

Keep personalization under 18 words. Do not mention scraped data. Do not claim I reviewed a specific claim.
```

## Product Changes Required

Implemented in the current MVP:

- `/claimbrief` sales/demo route.
- ClaimBrief workflow setting.
- Claim-specific summary, quick skim, and chat prompts.
- Claim-specific upload modal copy.
- Sample claim packet for demos.
- Branded ClaimBrief PDF, Markdown, and TXT exports with source references.
- ClaimBrief outreach files under `docs/outreach/`.

### Must-have for first sale

1. Add a "ClaimBrief mode" or route. Done for MVP.
2. Change copy from legal workspace to claim document workspace. Done for MVP.
3. Add document type labels. Done for MVP:
   - Insurance policy
   - Denial letter
   - Carrier estimate
   - Contractor estimate
   - Correspondence
   - Photos/OCR notes
4. Add claim-specific output schema. Done in prompts:
   - Claim overview
   - Denial/underpayment reasons
   - Policy provisions cited
   - Exclusions and limitations cited
   - Missing evidence checklist
   - Deadlines/dates found
   - Response outline
   - Questions for human reviewer
5. Add branded ClaimBrief PDF export. Done for MVP.
6. Add disclaimers in UI and export. Done for MVP.
7. Add one sample claim demo. Done.

### Do not build yet

- Accounts.
- Team workspaces.
- Carrier submission.
- E-signature.
- Claim CRM.
- Xactimate estimate generation.
- Building-code database.
- Weather integration.
- Payment-gated SaaS.

Those are for after a buyer pays.

## 72-Hour Execution Plan

### Day 1

- Create ClaimBrief landing copy inside the app or a simple one-page site.
- Create one sample claim packet using public/sample insurance documents or synthetic docs.
- Add claim-specific prompt/output mode.
- Record a 90-second demo video.

### Day 2

- Build 150-lead list from NAPIA and Google Maps.
- Send 75 emails.
- Send 50 LinkedIn messages.
- Offer free sample from a redacted/closed claim.

### Day 3

- Manually create every sample brief with the app.
- Ask each tester one closing question:

> If I could do 20 of these a month for your office, would $299/month be worth it?

- If yes, send payment link or manual invoice instructions.
- If no, ask what output would make it worth paying for.

## Best First Payment Setup

Use a simple payment link if it is ready. If not, use manual invoice/payment instructions after a prospect says yes. Do not build billing yet.

Suggested products:

- ClaimBrief Starter: $99 for 3 briefs.
- ClaimBrief Monthly: $299/month for up to 20 briefs.
- ClaimBrief White Label: $1,500 setup plus $299/month.

Deploy wiring:

- Set `NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL` to the inbox that receives packets and buying questions.
- Optionally set `NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL` to the $99 payment link.
- Optionally set `NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL` to the $299/month payment link.
- Set `NEXT_PUBLIC_CLAIMBRIEF_WHITELABEL_URL` only after one paid pilot proves the workflow.

If the payment links are not set, the ClaimBrief page falls back to prefilled manual-invoice email CTAs. That keeps the sales page usable before checkout is ready.

## The Bet

Within 7 days, cold outreach to 150 public adjusters/restoration operators should produce at least:

- 5 replies.
- 2 real claim packets.
- 1 person willing to pay or name the missing feature that would make them pay.

If this fails, switch to the Franchise FDD report wedge before changing the underlying product.
