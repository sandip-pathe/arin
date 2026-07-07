import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedAt = "2026-07-07";

const leads = [
  {
    priority: 1,
    person: "Christina Huang",
    title: "Co-founder & CTO",
    company: "Ruma Care",
    domain: "rumacare.com",
    region: "US / Pacific",
    vertical: "Healthcare admin / prior authorization",
    trigger: "YC W26; YC profile shows two open jobs and a live workflow around prior authorization and copay enrollment.",
    pain: "Prior auth packets across EHR data, insurer-specific criteria, paper/fax forms, portals, copay assistance, and reimbursement risk for high-cost biologics.",
    whyPerson: "Technical co-founder with healthcare integration background; exactly the kind of person who can buy a focused contract sprint if product backlog is hot.",
    howHelp: "Build a FastAPI + LangGraph prior-auth package generator with document-field validation, payer-rule provenance, and human review states.",
    sources: "https://www.ycombinator.com/companies/ruma-care ; https://rumacare.com/",
    confidence: "High",
    vendorOverlap: "AI-native workflow company, but the pain is operational and they are actively hiring.",
    clayNext: "Enrich Christina Huang and company domain; verify current hiring owner."
  },
  {
    priority: 2,
    person: "Rhea Malhotra",
    title: "Co-founder & CTO",
    company: "Kita",
    domain: "kita.ai",
    region: "US / Pacific, emerging markets focus",
    vertical: "Lending / credit assessment",
    trigger: "YC W26; company says borrower financial history is locked in bank statements, e-wallet records, utility bills, and other documents.",
    pain: "Messy borrower documents, fraud checks, localized underwriting signals, repayment evidence, and document-to-risk-model feedback loops.",
    whyPerson: "Technical co-founder leading a doc-heavy lending product where reliable extraction and review architecture is core.",
    howHelp: "Prototype a borrower-file ingestion service with source-linked extracted fields, fraud flags, LangGraph review loops, and FastAPI endpoints for risk teams.",
    sources: "https://www.ycombinator.com/companies/kita ; https://www.kita.ai/",
    confidence: "High",
    vendorOverlap: "AI lending platform, but explicit document pain and tiny team make contract capacity plausible.",
    clayNext: "Enrich Rhea Malhotra; verify best domain convention."
  },
  {
    priority: 3,
    person: "Michael Schroeder",
    title: "Founder",
    company: "Overdrive Health",
    domain: "overdrive.health",
    region: "US / Eastern",
    vertical: "Healthcare revenue cycle / medical billing",
    trigger: "YC W26; company states it processes over $100M in claims annually and automates eligibility, coding, claims submission, and denials.",
    pain: "Insurance discovery, eligibility checks, medical billing documentation, claim coding, payer follow-up, and denial management.",
    whyPerson: "Founder owns both automation and service delivery; likely needs engineering throughput inside a live ops-heavy billing workflow.",
    howHelp: "Ship a document/checklist pipeline that turns billing artifacts into validated claim states with exception queues and payer-specific guardrails.",
    sources: "https://www.overdrive.health/about ; https://www.workatastartup.com/companies/overdrive-health",
    confidence: "High",
    vendorOverlap: "AI-enabled services company, not just SaaS; internal ops automation makes this a strong services angle.",
    clayNext: "Enrich Michael Schroeder and check if there is a separate technical lead."
  },
  {
    priority: 4,
    person: "Devin Picciolini",
    title: "CTO & Co-founder",
    company: "Slate",
    domain: "tryslatehq.com",
    region: "Canada / Pacific",
    vertical: "Embedded SMB lending",
    trigger: "January 2026 pre-seed; BetaKit says Slate is doubling a six-person team and investing in underwriting, risk, regulatory, and compliance foundations.",
    pain: "SMB loan intake, platform data normalization, underwriting evidence, compliance foundations, risk review, and servicing handoffs.",
    whyPerson: "CTO at a six-person embedded lending startup with a fresh funding trigger and clear need to move faster than hiring alone.",
    howHelp: "Build an underwriting intake spike that converts platform-submitted SMB data and documents into reviewable credit files with audit trails.",
    sources: "https://betakit.com/slate-raises-1-3-million-to-deliver-embedded-lending-infrastructure-to-canadian-platforms/",
    confidence: "High",
    vendorOverlap: "Low. They sell lending infrastructure, not document AI.",
    clayNext: "Enrich Devin Picciolini; domain is linked from BetaKit."
  },
  {
    priority: 5,
    person: "Jayen Ram",
    title: "Co-founder",
    company: "Claim Health",
    domain: "claimhealth.com",
    region: "US / Eastern",
    vertical: "Post-acute care billing / claims",
    trigger: "YC profile and job post say Claim Health has 15x'd revenue since Demo Day and is hiring engineers for document AI and automation work.",
    pain: "Post-acute billing documents, incomplete clinical documentation, claim errors, denials, payer portal workflows, and reimbursement exceptions.",
    whyPerson: "Technical founder with document AI background; current hiring signal suggests extra contract capacity could be useful.",
    howHelp: "Build a denial-prevention document checker with FastAPI extraction endpoints and LangGraph review paths for missing evidence.",
    sources: "https://www.ycombinator.com/companies/claim-health ; https://www.ycombinator.com/companies/claim-health/jobs/WyGMa1O-full-stack-engineer",
    confidence: "High",
    vendorOverlap: "AI product overlap, but explicit hiring for the same work makes it a strong capacity lead.",
    clayNext: "Enrich Jayen Ram; also enrich Kevin Calcado for founder-led outreach."
  },
  {
    priority: 6,
    person: "Sanket Munjal",
    title: "CTO & Co-founder",
    company: "SureBright",
    domain: "surebright.com",
    region: "US / Canada",
    vertical: "Embedded warranty / insurance",
    trigger: "YC S24 profile shows active jobs and a warranty platform handling policy issuance, claims, compliance, and insurer workflows.",
    pain: "Warranty-policy generation, claims intake, merchant onboarding data, insurer compliance records, product eligibility, and support evidence.",
    whyPerson: "CTO with prior insurtech engineering background; likely owns integration and claims automation pressure.",
    howHelp: "Create a claims/document automation sprint that validates product evidence, warranty terms, and exception routing before human review.",
    sources: "https://www.ycombinator.com/companies/surebright ; https://www.surebright.com/aboutus",
    confidence: "High",
    vendorOverlap: "Moderate. AI-powered insurance platform, but not a document API vendor.",
    clayNext: "Enrich Sanket Munjal; verify if founder-office engineer role is still open."
  },
  {
    priority: 7,
    person: "Brotish Das",
    title: "Co-founder & CEO",
    company: "Intellend",
    domain: "intellendtech.com",
    region: "India / Mumbai",
    vertical: "Embedded MSME lending",
    trigger: "2026 seed round led by Incubate Fund Asia; source says Intellend serves merchant ecosystems with 100,000+ merchants.",
    pain: "MSME onboarding, merchant data, loan applications, KYC/KYB files, risk assessment, underwriting docs, and partner handoffs.",
    whyPerson: "Founder of a fresh India embedded lending startup; local timezone and early stage make contract collaboration easier.",
    howHelp: "Build a risk-first borrower-file workflow that extracts required fields, flags missing KYC/KYB evidence, and exposes review APIs.",
    sources: "https://entrackr.com/snippets/intellend-raises-12-mn-in-seed-round-led-by-incubate-fund-asia-11014365 ; https://intellendtech.com/about.html",
    confidence: "High",
    vendorOverlap: "Low. Embedded lending platform, not a document processing vendor.",
    clayNext: "Enrich Brotish Das; also test Som Chatterjee if operations/insurance angle is stronger."
  },
  {
    priority: 8,
    person: "Prashanth Swaminathan",
    title: "Co-founder & CEO",
    company: "Zynk",
    domain: "domain_to_verify",
    region: "India / global",
    vertical: "Cross-border payments infrastructure",
    trigger: "Raised $5M seed in late 2025 to scale instant cross-border payments and compliance infrastructure.",
    pain: "Cross-border onboarding, sanctions/compliance checks, partner due diligence, transaction evidence, corridor rules, and settlement exception workflows.",
    whyPerson: "Former Amazon Pay CTO and founder CEO; likely owns compliance infrastructure tradeoffs early.",
    howHelp: "Ship a compliance-evidence workflow that collects KYC/KYB artifacts, extracts corridor-specific fields, and routes exceptions through LangGraph states.",
    sources: "https://siliconangle.com/2025/11/04/zynk-raises-5m-support-instant-cross-border-payments/ ; https://thepaypers.com/payments/news/zynk-raises-usd-5-million-in-seed-funding",
    confidence: "Medium",
    vendorOverlap: "Low to moderate. Payments infrastructure; document pain is inferred from compliance and cross-border workflows.",
    clayNext: "Use Clay to verify domain and current technical/founder contact."
  },
  {
    priority: 9,
    person: "Rohit Majhi",
    title: "Co-founder & CTO",
    company: "Maalexi",
    domain: "maalexi.com",
    region: "UAE / US",
    vertical: "Agri trade finance",
    trigger: "Recent trade-finance alliance and 2025 credit facility for agri-trade expansion.",
    pain: "Supplier/buyer verification, trade contracts, shipment evidence, invoice finance, regulatory trade docs, and cross-border agriculture risk checks.",
    whyPerson: "CTO of a trade-finance operator where document trust and financing workflows are central.",
    howHelp: "Build a trade-document review backend that validates invoices, contracts, shipment docs, and buyer evidence before financing decisions.",
    sources: "https://www.hub71.com/latest-news/press-release/maalexi-and-rxil-global-sign-strategic-alliance-to-expand-trade-finance-access-for-indian-agricultural-exporters ; https://www.wamda.com/2024/01/maalexi-raises-3-million-pre-series-led-global-ventures",
    confidence: "High",
    vendorOverlap: "Moderate. Uses AI/risk tech internally, but not a generic document API vendor.",
    clayNext: "Enrich Rohit Majhi and verify current preferred domain."
  },
  {
    priority: 10,
    person: "Pauline Roteta",
    title: "Co-founder & CEO",
    company: "Pasito",
    domain: "pasito.ai",
    region: "US / Eastern",
    vertical: "Benefits administration / insurance",
    trigger: "2026 Series A signal; public profile says Pasito ingests plan documents and employee census data for benefits workflows.",
    pain: "Benefits plan PDFs, census files, claims reminders, RFP management, document audits, translations, and broker/carrier workflows.",
    whyPerson: "Founder/CEO is publicly discussing benefits AI and likely cares about fast workflow expansion after Series A.",
    howHelp: "Build a plan-doc and census-file extraction sprint with validation, exception tracking, and generated broker-ready outputs.",
    sources: "https://www.linkedin.com/company/pasito-ai ; https://imacorp.com/insights/on-the-pulse-podcast-making-benefits-personal-with-ai",
    confidence: "High",
    vendorOverlap: "AI benefits workspace, but strong document-workflow fit and fresh growth signal.",
    clayNext: "Enrich Pauline Roteta; check for CTO/engineering lead as secondary."
  },
  {
    priority: 11,
    person: "Guy Ezekiel",
    title: "Co-founder & CEO",
    company: "Zorro",
    domain: "myzorro.co",
    region: "US / Israel",
    vertical: "ICHRA / healthcare benefits",
    trigger: "$20M Series A in June 2025 for benefits administration and personalized healthcare coverage.",
    pain: "ICHRA administration, eligibility records, plan comparison data, reimbursement evidence, broker/employer docs, and compliance audit trails.",
    whyPerson: "Founder/CEO at a benefits platform with fresh scale pressure; technical lead may need Clay enrichment.",
    howHelp: "Prototype a reimbursement and plan-doc workflow that extracts required fields, checks policy rules, and keeps review evidence auditable.",
    sources: "https://www.prnewswire.com/news-releases/zorro-secures-20-million-in-series-a-to-transform-the-healthcare-benefits-industry-for-brokers-employers-and-employees-302479032.html ; https://www.myzorro.co/resources/why-we-started-zorro",
    confidence: "Medium",
    vendorOverlap: "Moderate. AI-powered benefits platform, but not a document API vendor.",
    clayNext: "Enrich Guy Ezekiel and find CTO/product engineering lead."
  },
  {
    priority: 12,
    person: "Benjamin Easton",
    title: "Co-founder",
    company: "Develop Health",
    domain: "develophealth.ai",
    region: "US / Pacific",
    vertical: "Prior authorization / medication access",
    trigger: "$14.3M Series A in 2025; launch/integration signals around benefit verification and prior authorization package generation.",
    pain: "Insurance verification, prior auth package generation, payer follow-up, clinical evidence, EHR data, and medication access paperwork.",
    whyPerson: "Co-founder at a freshly funded prior-auth platform; technical owner should be verified, but the workflow is a direct match.",
    howHelp: "Build a controlled prior-auth document pipeline that maps clinical evidence to payer criteria and logs every model-backed assertion.",
    sources: "https://www.businesswire.com/news/home/20250820874094/en/Develop-Health-Raises-%2414.3M-to-Automate-Prior-Authorization-and-Medication-Access-Using-GenAI ; https://www.develophealth.ai/",
    confidence: "Medium",
    vendorOverlap: "AI healthcare admin platform; strong if positioned as contract capacity rather than selling them their own product.",
    clayNext: "Enrich Benjamin Easton; locate CTO/head of engineering if separate."
  },
  {
    priority: 13,
    person: "Jesse Collins",
    title: "Co-founder & CTO",
    company: "Friday Harbor",
    domain: "fridayharbor.ai",
    region: "US / Pacific",
    vertical: "Mortgage origination",
    trigger: "Seed-backed mortgage AI platform; coverage says it helps smaller lenders assemble files and streamline underwriting.",
    pain: "Borrower application packages, income docs, bank statements, credit conditions, undisclosed debt alerts, and underwriter-ready loan files.",
    whyPerson: "CTO with fintech engineering background; mortgage docs are a very concrete LangGraph/FastAPI use case.",
    howHelp: "Build a mortgage-file intake and condition-clearance service with source-backed extracted fields and exception workflows.",
    sources: "https://www.geekwire.com/2025/this-seattle-startup-uses-ai-to-help-smaller-mortgage-lenders-compete-with-industry-giants/ ; https://pulse2.com/friday-harbor-6-million-seed-closed-to-help-loan-officers-assemble-files-in-real-time/",
    confidence: "High",
    vendorOverlap: "AI mortgage platform, but explicit document/underwriting pipeline need.",
    clayNext: "Enrich Jesse Collins and verify active hiring/news."
  },
  {
    priority: 14,
    person: "Benjamin Wong",
    title: "Founder / builder",
    company: "Reia",
    domain: "iamreia.ai",
    region: "US / remote",
    vertical: "Real estate underwriting",
    trigger: "Active LinkedIn founding engineer posting says Reia starts with real estate underwriting and messy deal materials across PDFs, spreadsheets, email, chat, and memory.",
    pain: "OMs, rent rolls, T-12s, market data, diligence PDFs, Excel models, investment memos, committee review, and source-backed assumptions.",
    whyPerson: "Public founder/building signal plus open engineering role; could respond to contract help that reduces hiring pressure.",
    howHelp: "Build a source-backed deal-material parser with FastAPI ingestion, LangGraph assumption review, and memo-ready outputs.",
    sources: "https://iamreia.ai/ ; https://www.linkedin.com/jobs/view/founding-engineer-at-reia-4437159813",
    confidence: "Medium",
    vendorOverlap: "AI-native underwriting tool; good capacity lead from active hiring signal.",
    clayNext: "Use Clay/LinkedIn to verify Benjamin Wong title and best contact path."
  },
  {
    priority: 15,
    person: "Grace Hanson",
    title: "Co-founder & CEO",
    company: "Elysian",
    domain: "elysian.is",
    region: "US",
    vertical: "Commercial insurance claims / TPA",
    trigger: "$6M seed in 2025; public case study says commercial adjusters handle 150-200 claims and each claim can contain hundreds to thousands of attachments.",
    pain: "Commercial claim files, attachments, legal evidence, policy terms, adjuster notes, reserves, coverage issues, and source-backed claim decisions.",
    whyPerson: "CEO has deep claims background and the company is an AI-native TPA, so the pitch should be about engineering capacity around real claim ops.",
    howHelp: "Build a claim-file extraction and review trail that turns attachments into validated issue lists while keeping adjusters in control.",
    sources: "https://www.finopotamus.com/post/elysian-raises-6m-seed-round-to-redefine-insurance-claims-services-with-ai-native-platform ; https://reducto.ai/blog/reducto-elysian-case-study",
    confidence: "High",
    vendorOverlap: "AI-native claims operator; still a strong ops/document bottleneck lead.",
    clayNext: "Enrich Grace Hanson; consider Dylan Hanson for technical angle."
  },
  {
    priority: 16,
    person: "Cameron Mooney",
    title: "Co-founder & CEO",
    company: "Tugboat",
    domain: "domain_to_verify",
    region: "US / Central",
    vertical: "Property insurance claims support",
    trigger: "June 2026 oversubscribed seed round to expand homeowner insurance claims support.",
    pain: "Damage documentation, carrier correspondence, denial disputes, estimate comparisons, regulatory filings, and negotiation evidence.",
    whyPerson: "Founder is a former adjuster and just raised seed; likely needs workflow automation without a large engineering bench.",
    howHelp: "Build a claims-evidence organizer that extracts key facts from correspondence/photos/docs and drafts review-ready dispute packets.",
    sources: "https://www.claimsjournal.com/news/national/2026/06/15/337924.htm ; https://www.einpresswire.com/article/919307902/tugboat-closes-3m-seed-round-to-expand-access-to-expert-insurance-claim-support-in-the-age-of-growing-climate-disaster",
    confidence: "Medium",
    vendorOverlap: "AI-assisted claims support; domain needs verification.",
    clayNext: "Use Clay to verify Tugboat domain and Cameron Mooney contact."
  },
  {
    priority: 17,
    person: "Linus Malmen",
    title: "Co-founder & CTO",
    company: "Solva",
    domain: "solvatechnology.com",
    region: "US / Eastern",
    vertical: "Insurance claims automation",
    trigger: "YC S25; active founding engineer job and public profile around claims automation and incorrect payout prevention.",
    pain: "Claim files, policy terms, fraud signals, source-backed reasoning, QA audits, estimate review, and regulated evidence trails.",
    whyPerson: "CTO at a tiny YC insurance claims company with an open founding engineer role; good capacity pitch.",
    howHelp: "Build a contract sprint around claim-file validation, source citations, and LangGraph review/eval harnesses for regulated claim decisions.",
    sources: "https://www.ycombinator.com/companies/solva ; https://www.ycombinator.com/companies/solva/jobs/V9X1F0T-founding-engineer",
    confidence: "High",
    vendorOverlap: "High AI-product overlap. Outreach should frame as temporary engineering capacity, not selling claims AI.",
    clayNext: "Enrich Linus Malmen; verify spelling/accent in Clay."
  },
  {
    priority: 18,
    person: "Ulme Wennberg",
    title: "CTO & Co-founder",
    company: "Vantel",
    domain: "vantel.com",
    region: "US / Europe",
    vertical: "Commercial insurance brokerage",
    trigger: "YC W25; public posts say brokers spend 80% of time on paperwork and Vantel transforms unstandardized insurance documents into structured risk data.",
    pain: "Commercial broker submissions, policy comparisons, scanned policies, contracts, endorsements, coverage gaps, and risk data extraction.",
    whyPerson: "Technical founder publicly tied to unstandardized insurance-document transformation.",
    howHelp: "Create a policy/submission extraction module with field-level confidence, source snippets, and broker review queues.",
    sources: "https://www.ycombinator.com/companies/vantel ; https://www.linkedin.com/posts/y-combinator_vantel-yc-w25-is-an-ai-platform-that-makes-activity-7295834178657427457-jPge",
    confidence: "High",
    vendorOverlap: "High AI-product overlap. Still useful as a contract engineering capacity lead.",
    clayNext: "Enrich Ulme Wennberg and Love Redin."
  },
  {
    priority: 19,
    person: "Cornelius Schramm",
    title: "Founder",
    company: "Avallon AI",
    domain: "avallon.ai",
    region: "US / Eastern",
    vertical: "Insurance claims operations",
    trigger: "YC X25; raised $4.6M and automates claims calls, documents, and data entry for carriers and TPAs.",
    pain: "Routine claim calls, document review, photos, adjuster notes, data entry, intake-to-resolution workflow, and TPA/carrier integrations.",
    whyPerson: "Founder at a seven-person claims-ops company with explicit document and workflow automation surface area.",
    howHelp: "Build a customer-specific claims integration or document-review pipeline that plugs into claims management systems via FastAPI.",
    sources: "https://www.ycombinator.com/companies/avallon-ai ; https://www.alleywatch.com/2025/11/avallon-insurance-claims-automation-ai-agents-tpa-cornelius-schramm/",
    confidence: "High",
    vendorOverlap: "High AI-product overlap. Position only as project-based build capacity.",
    clayNext: "Enrich Cornelius Schramm and Bryan Guin."
  },
  {
    priority: 20,
    person: "Vikram Kotibhaskar",
    title: "Co-founder",
    company: "CrediLinq",
    domain: "credilinq.ai",
    region: "Singapore / global",
    vertical: "B2B embedded finance",
    trigger: "$8.5M Series A in 2025 to expand B2B embedded finance into new markets.",
    pain: "SME onboarding, platform transaction data, KYB files, credit applications, alternative-data underwriting, compliance records, and partner workflows.",
    whyPerson: "Co-founder quoted on the embedded credit stack; likely close to platform/product and partner workflow bottlenecks.",
    howHelp: "Build an embedded-credit onboarding workflow that turns platform/KYB documents into validated underwriting packets and API-ready review states.",
    sources: "https://www.prnewswire.com/news-releases/global-fintech-credilinq-raises-8-5m-series-a-to-accelerate-the-growth-of-b2b-embedded-finance-302457608.html ; https://credilinq.ai/about-us",
    confidence: "Medium",
    vendorOverlap: "Moderate to high AI-fintech overlap. Pitch as integration/document workflow capacity.",
    clayNext: "Enrich Vikram Kotibhaskar and find CTO/head of engineering if separate."
  }
];

const headers = [
  "Priority",
  "Person",
  "Contact Title",
  "Company",
  "Domain",
  "Region / Timezone",
  "Vertical",
  "Trigger / Timing",
  "Document or Ops Pain",
  "Why This Person",
  "How Sandeep Can Help",
  "Source URLs",
  "Confidence",
  "Vendor / AI Overlap Warning",
  "Clay Next Step",
  "Email"
];

const rows = leads.map((lead) => [
  lead.priority,
  lead.person,
  lead.title,
  lead.company,
  lead.domain,
  lead.region,
  lead.vertical,
  lead.trigger,
  lead.pain,
  lead.whyPerson,
  lead.howHelp,
  lead.sources,
  lead.confidence,
  lead.vendorOverlap,
  lead.clayNext,
  ""
]);

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const sheet = workbook.worksheets.add("Scout Leads");

summary.showGridLines = false;
sheet.showGridLines = false;

summary.getRange("A1:H1").merge();
summary.getRange("A1").values = [[`20 Person-Level Contract Leads (${generatedAt})`]];
summary.getRange("A1").format = {
  fill: "#0F172A",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center"
};

summary.getRange("A3:B9").values = [
  ["Total leads", leads.length],
  ["High confidence", leads.filter((l) => l.confidence === "High").length],
  ["Medium confidence", leads.filter((l) => l.confidence === "Medium").length],
  ["Emails included", 0],
  ["Domains needing verification", leads.filter((l) => l.domain === "domain_to_verify").length],
  ["Top outreach slice", "Priority 1-8"],
  ["Use Clay for", "Email + missing domain enrichment only"]
];
summary.getRange("A3:A9").format = { font: { bold: true }, fill: "#E2E8F0" };
summary.getRange("B3:B9").format = { fill: "#F8FAFC" };
summary.getRange("A3:B9").format.borders = { preset: "all", style: "thin", color: "#CBD5E1" };

summary.getRange("D3:E9").values = [
  ["Vertical", "Lead Count"],
  ["Healthcare / benefits", leads.filter((l) => /Healthcare|Benefits|prior authorization|medical/i.test(l.vertical)).length],
  ["Lending / payments / finance", leads.filter((l) => /lending|payments|finance|Mortgage|trade/i.test(l.vertical)).length],
  ["Insurance / claims", leads.filter((l) => /Insurance|claims|warranty/i.test(l.vertical)).length],
  ["Real estate", leads.filter((l) => /Real estate/i.test(l.vertical)).length],
  ["High vendor-overlap leads", leads.filter((l) => /^High/i.test(l.vendorOverlap)).length],
  ["Source rule", "Public/professional only"]
];
summary.getRange("D3:E3").format = { font: { bold: true, color: "#FFFFFF" }, fill: "#334155" };
summary.getRange("D4:E9").format = { fill: "#F8FAFC" };
summary.getRange("D3:E9").format.borders = { preset: "all", style: "thin", color: "#CBD5E1" };

summary.getRange("A11:H15").merge(true);
summary.getRange("A11:A15").values = [
  ["Scouting notes"],
  ["The first 8 are the cleanest outreach slice: strong pain, real timing, and a person who can plausibly buy contract capacity."],
  ["Rows with high AI/vendor overlap are still included because active hiring or exact document-pipeline pain makes them useful contract-capacity targets."],
  ["No emails are included. Use Clay only for email enrichment, missing domains, and LinkedIn sanity checks."],
  ["Avoid pitching generic AI. Pitch a specific 2-4 week project spike around their live workflow."]
];
summary.getRange("A11:H15").format = { fill: "#FFF7ED", wrapText: true };
summary.getRange("A11:H11").format = { font: { bold: true }, fill: "#FED7AA" };

const data = [headers, ...rows];
sheet.getRangeByIndexes(0, 0, data.length, headers.length).values = data;
sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#0F172A",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  verticalAlignment: "center"
};
sheet.getRangeByIndexes(1, 0, rows.length, headers.length).format = {
  wrapText: true,
  verticalAlignment: "top"
};
sheet.freezePanes.freezeRows(1);
sheet.getRange(`A1:P${data.length}`).format.borders = { preset: "inside", style: "thin", color: "#E2E8F0" };
sheet.getRange(`A1:P${data.length}`).format.borders = { preset: "outside", style: "thin", color: "#CBD5E1" };
sheet.getRange("A:A").format.columnWidth = 9;
sheet.getRange("B:B").format.columnWidth = 22;
sheet.getRange("C:C").format.columnWidth = 24;
sheet.getRange("D:D").format.columnWidth = 20;
sheet.getRange("E:E").format.columnWidth = 22;
sheet.getRange("F:F").format.columnWidth = 18;
sheet.getRange("G:G").format.columnWidth = 26;
sheet.getRange("H:H").format.columnWidth = 48;
sheet.getRange("I:I").format.columnWidth = 52;
sheet.getRange("J:J").format.columnWidth = 46;
sheet.getRange("K:K").format.columnWidth = 50;
sheet.getRange("L:L").format.columnWidth = 56;
sheet.getRange("M:M").format.columnWidth = 13;
sheet.getRange("N:N").format.columnWidth = 36;
sheet.getRange("O:O").format.columnWidth = 34;
sheet.getRange("P:P").format.columnWidth = 14;
sheet.getRange("A2:A21").format.horizontalAlignment = "center";
sheet.getRange("M2:M21").format.horizontalAlignment = "center";
sheet.getRange("P2:P21").format.fill = "#F8FAFC";

sheet.tables.add(`A1:P${data.length}`, true, "ScoutLeads");
sheet.getRange("M2:M21").conditionalFormats.add("containsText", {
  text: "High",
  format: { fill: "#DCFCE7", font: { color: "#166534", bold: true } }
});
sheet.getRange("M2:M21").conditionalFormats.add("containsText", {
  text: "Medium",
  format: { fill: "#FEF3C7", font: { color: "#92400E", bold: true } }
});
sheet.getRange("N2:N21").conditionalFormats.add("beginsWith", {
  text: "High",
  format: { fill: "#FEE2E2", font: { color: "#991B1B" } }
});
sheet.getRange("E2:E21").conditionalFormats.add("containsText", {
  text: "domain_to_verify",
  format: { fill: "#FDE68A", font: { bold: true, color: "#92400E" } }
});

const csvLines = data.map((row) =>
  row.map((cell) => {
    const value = String(cell ?? "");
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(",")
);
await fs.writeFile(path.join(__dirname, "new-person-scouting-leads-20.csv"), csvLines.join("\n"), "utf8");

const inspect = await workbook.inspect({
  kind: "sheet,table",
  maxChars: 4000,
  tableMaxRows: 4,
  tableMaxCols: 6
});
console.log(inspect.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan"
});
console.log(errorScan.ndjson);

const preview = await workbook.render({
  sheetName: "Scout Leads",
  range: "A1:P12",
  scale: 1,
  format: "png"
});
await fs.writeFile(path.join(__dirname, "scout-leads-preview.png"), new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(__dirname, "new-person-scouting-leads-20.xlsx"));
