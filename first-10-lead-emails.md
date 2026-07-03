# First 10 Lead Emails

Tone rules used: short, specific, slightly informal, one clear permission ask. No newsletter energy, no fake enthusiasm, no "hope you're well."

## 1. ClaimSorted

**Bottleneck:** ClaimSorted is scaling claims ops, so the likely bottleneck is turning messy claim packets into reliable claim state: FNOL notes, emails, invoices, repair estimates, photos, policy language, fraud signals, and compliance checks.

**Trigger:** ClaimSorted [raised a $13.3M seed round led by Atomico](https://fintech.global/2025/10/13/insurtech-claimsorted-secures-13-3m-seed-round/) to expand its AI-native claims platform.

**Stack hypothesis:** A LangGraph + Python + FastAPI workflow could turn incoming claim evidence into structured, auditable review steps and save engineers from building one-off parsers for every insurer and claim type.

**Email:**

German — saw ClaimSorted raised the Atomico seed to scale AI-native claims ops.

Claims get messy fast once every insurer sends different emails, invoices, estimates, photos, and policy docs.

I build LangGraph/Python/FastAPI extraction workflows for regulated ops teams, with human review where the model should not guess.

Worth sending a 2-min Loom on how I would structure claims intake?

## 2. Healia

**Bottleneck:** Healia's reimbursement workflow likely depends on extracting and validating EOBs, receipts, bills, spouse-plan enrollment proof, deductible details, and HRA compliance records.

**Trigger:** Healia says it has [50+ customers and 40k+ employees using the product](https://www.ycombinator.com/companies/healia), and is [hiring senior engineering talent](https://www.ycombinator.com/companies/healia/jobs/Cg3r8Le-senior-software-engineer-full-stack) to scale core platform work.

**Stack hypothesis:** A LangGraph + Python + FastAPI document pipeline could turn reimbursement docs into structured decisions with audit trails, reducing ops review while product and engineering scale.

**Email:**

Priyang — saw Healia is at 50+ customers and 40k+ employees, while hiring senior engineering.

That usually means reimbursement docs start becoming the quiet bottleneck: EOBs, receipts, bills, spouse-plan proof, and compliance records.

I build LangGraph/Python/FastAPI workflows that turn messy benefit docs into structured, auditable reimbursement decisions.

Worth sending a 2-min Loom with the architecture?

## 3. Eden Care

**Bottleneck:** Eden Care's expansion likely increases pressure around claims adjudication, provider bills, member eligibility files, policy rules, and insurer/provider reconciliation.

**Trigger:** Proparco is providing [EUR 250k-equivalent financing](https://www.proparco.fr/en/news/proparco-supports-edencare-accelerate-digital-transformation-health-insurance-east-africa) to support Eden Care's expansion in Rwanda and Kenya and its digital health insurance platform.

**Stack hypothesis:** A LangGraph + Python + FastAPI claims workflow could extract provider documents, validate policy rules, route exceptions, and reduce manual review time as coverage expands.

**Email:**

Moses — saw Proparco is backing Eden Care's expansion across Rwanda and Kenya.

When health insurance scales, the boring hard part is usually claims paperwork: provider bills, member eligibility, policy limits, and exception handling.

I build LangGraph/Python/FastAPI extraction workflows that keep the automation auditable instead of letting the model freestyle.

Worth sending a 2-min Loom on a claims-intake architecture?

## 4. Tank Payments

**Bottleneck:** Tank's freight payments workflow likely has to normalize carrier paperwork, invoices, proof-of-delivery, factoring records, AP/AR documents, and payment exceptions across logistics partners.

**Trigger:** Tank's [YC jobs page](https://www.ycombinator.com/companies/tank-payments/jobs) says it raised a $3.3M seed round led by YC, Greylock, and others, and is hiring engineers while scaling freight payables automation.

**Stack hypothesis:** A LangGraph + Python + FastAPI pipeline could extract freight payment documents, match them to payables/receivables events, and reduce custom ops tooling for payment exceptions.

**Email:**

Jad — saw Tank is hiring engineers after the YC/Greylock seed and scaling freight payables.

Freight payments look simple until the paperwork shows up: carrier docs, invoices, PODs, factoring records, and payment exceptions.

I build LangGraph/Python/FastAPI workflows that turn that kind of document mess into structured review queues and API-ready data.

Worth sending a 2-min Loom on how I would wire this up?

## 5. Capi Money

**Bottleneck:** Capi's importer payments flow likely depends on extracting invoice details, supplier bank instructions, KYB data, FX/payment compliance info, and trade documentation across regions.

**Trigger:** Capi Money [raised EUR 17.2M Series A funding](https://www.eu-startups.com/2025/02/capi-money-secures-e17-2-million-to-revolutionise-global-trade-for-smes-in-emerging-markets/) to scale international payments for SMEs in emerging markets.

**Stack hypothesis:** A LangGraph + Python + FastAPI trade-doc workflow could validate invoice/payment data, flag compliance exceptions, and save engineers from maintaining brittle importer-specific parsers.

**Email:**

Tom — saw Capi raised the Series A to help importers settle supplier invoices faster.

Trade docs are where the pain hides: invoices, supplier bank details, KYB, FX notes, and compliance checks all arriving in different shapes.

I build LangGraph/Python/FastAPI extraction workflows that turn those docs into validated payment data plus an audit trail.

Worth sending a 2-min Loom with the architecture?

## 6. Waza

**Bottleneck:** Waza's B2B payments and liquidity products likely need to handle invoices, treasury records, customer onboarding docs, KYB, beneficiary details, and compliance checks for emerging-market businesses.

**Trigger:** Waza [raised $8M in equity and debt funding](https://furtherafrica.com/2024/08/22/nigerian-startup-waza-raises-us8m-funding-b2b-payments/) to expand B2B payments, trade finance, and new markets.

**Stack hypothesis:** A LangGraph + Python + FastAPI workflow could convert invoices and KYB/payment docs into structured approval steps, cutting internal engineering work on treasury and compliance tooling.

**Email:**

Maxwell — saw Waza raised $8M to expand B2B payments and trade finance.

That kind of growth usually creates a document tax: invoices, KYB, beneficiary details, payment proofs, and compliance review all need clean internal state.

I build LangGraph/Python/FastAPI workflows for turning messy financial docs into structured, reviewable data.

Worth sending a 2-min Loom on where I think this could save engineering time?

## 7. SALT

**Bottleneck:** SALT's cross-border payments workflow likely has to process KYC/KYB packs, invoices, FIRC/payment receipts, beneficiary details, purpose codes, and RBI/FIU compliance documentation.

**Trigger:** SALT publicly positions itself around [cross-border payments plus the documentation and compliance burden](https://www.ycombinator.com/companies/salt) that comes with business banking.

**Stack hypothesis:** A LangGraph + Python + FastAPI compliance workflow could extract and validate payment docs before ops review, reducing manual back-and-forth on cross-border transactions.

**Email:**

Ankit — saw SALT is focused on the paperwork-heavy side of cross-border payments, not just moving money.

That is usually the real bottleneck: KYC, invoices, FIRC/payment receipts, beneficiary details, purpose codes, and compliance checks.

I build LangGraph/Python/FastAPI workflows that extract those docs into auditable review steps before ops has to chase missing fields.

Worth sending a 2-min Loom with the flow?

## 8. Plumter

**Bottleneck:** Plumter's cross-border trade platform likely needs to normalize multilingual invoices, trade-payment instructions, importer/exporter onboarding docs, FX details, and country-specific compliance fields.

**Trigger:** Plumter's [YC profile](https://www.ycombinator.com/companies/plumter) highlights cross-border trade, multicurrency infrastructure, and multilingual invoicing for importers and exporters.

**Stack hypothesis:** A LangGraph + Python + FastAPI pipeline could extract multilingual invoice and trade data, validate missing fields, and expose clean APIs for payments and compliance review.

**Email:**

Raquel — saw Plumter is going after cross-border trade with multicurrency payments and multilingual invoicing.

The tricky bit is probably not the dashboard, but the docs: invoices, payment instructions, importer/exporter info, FX details, and country-specific fields.

I build LangGraph/Python/FastAPI workflows that turn trade docs into structured data with review checkpoints.

Worth sending a 2-min Loom on how I would design the extraction layer?

## 9. Landeed

**Bottleneck:** Landeed's title-search infrastructure likely depends on extracting and reconciling sale deeds, encumbrance certificates, property records, owner history, court/land records, and state-specific registry formats.

**Trigger:** Landeed [raised a fresh $8.3M seed round in 2026](https://www.thesaasnews.com/news/landeed-raises-8-3m-seed-round/) and is [hiring engineering/product teams](https://www.landeed.com/careers) to expand title coverage across Indian states.

**Stack hypothesis:** A LangGraph + Python + FastAPI property-doc pipeline could normalize state-specific records into auditable title summaries, saving engineers from hand-building extraction logic per registry.

**Email:**

Sanjay — saw Landeed raised the new seed round and is expanding title coverage across Indian states.

Property records are exactly the kind of messy system where extraction gets expensive: sale deeds, encumbrance certificates, owner history, registry formats, and legal edge cases.

I build LangGraph/Python/FastAPI workflows that turn document-heavy compliance checks into structured, auditable summaries.

Worth sending a 2-min Loom on a title-doc extraction architecture?

## 10. Ekho

**Bottleneck:** Ekho's 50-state vehicle transaction engine likely has to manage financing docs, insurance verification, titling, registration forms, signatures, taxes, fraud checks, DMV/state rules, and dealer compliance paperwork.

**Trigger:** Ekho [raised $17.3M](https://www.ekho.com/blog/ekho-raises-17-3m-from-activant-jpmorgan-payments-winnebago-and-yc) to build its end-to-end vehicle commerce platform, including a 50-state transaction engine for financing, titling, registration, taxes, and compliance.

**Stack hypothesis:** A LangGraph + Python + FastAPI document workflow could extract and validate vehicle transaction paperwork by state, route exceptions, and reduce custom engineering work around compliance ops.

**Email:**

Rowan — saw Ekho raised $17.3M around the 50-state vehicle transaction engine.

DMV/state-by-state paperwork is a lot: financing, insurance, titling, registration, signatures, taxes, fraud checks, and dealer compliance.

I build LangGraph/Python/FastAPI workflows that turn that kind of paperwork into structured review steps with human handoff where needed.

Worth sending a 2-min Loom on how I would handle state-specific document extraction?
