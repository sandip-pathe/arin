import { Attachment, DocumentChunk, Ontology } from "@/types/page";

export const ONTOLOGY_COLORS: Record<keyof Ontology, string> = {
  definitions:
    "bg-blue-100 border-blue-400 dark:bg-blue-900/40 dark:border-blue-600",
  obligations:
    "bg-green-100 border-green-400 dark:bg-green-900/40 dark:border-green-600",
  rights:
    "bg-yellow-100 border-yellow-400 dark:bg-yellow-900/40 dark:border-yellow-600",
  conditions:
    "bg-purple-100 border-purple-400 dark:bg-purple-900/40 dark:border-purple-600",
  clauses:
    "bg-pink-100 border-pink-400 dark:bg-pink-900/40 dark:border-pink-600",
  dates:
    "bg-indigo-100 border-indigo-400 dark:bg-indigo-900/40 dark:border-indigo-600",
  parties:
    "bg-teal-100 border-teal-400 dark:bg-teal-900/40 dark:border-teal-600",
};

// summaries.ts
export const summaries = [
  {
    summary:
      "This clause outlines the provider's responsibility to deliver monthly reports. The reports must include detailed service usage metrics and uptime statistics. Any failure to comply can lead to penalties or service credit issuance. The provider must maintain accurate logs for at least 12 months.",
    chunkIds: "chunk-001",
    legalOntology: {
      definitions: [
        "Monthly Report: A document summarizing service performance.",
      ],
      obligations: ["Provider must deliver monthly performance reports."],
      rights: ["Client has the right to audit the report contents."],
      conditions: [
        "Reports must be delivered within 5 business days of month end.",
      ],
      clauses: ["Service Performance Reporting", "Non-compliance Remedies"],
      dates: ["Every month, end of period reporting"],
      parties: ["Provider", "Client"],
    },
  },
  {
    summary:
      "The agreement commences on January 1, 2025 and will be valid for a two-year term. Either party may terminate the agreement with a 60-day prior written notice. Renewal is automatic unless a termination notice is received. Obligations and liabilities during the term remain active post-termination until settled.",
    chunkIds: "chunk-002",
    legalOntology: {
      definitions: [
        "Effective Date: The date when the agreement comes into force.",
      ],
      obligations: [
        "Each party must adhere to the contract terms during the active period.",
      ],
      rights: ["Right to terminate with 60 days’ notice."],
      conditions: ["Auto-renewal unless notice of termination is given."],
      clauses: ["Term & Termination", "Renewal Policy"],
      dates: ["January 1, 2025", "60 days prior to renewal date"],
      parties: ["Service Provider", "Recipient"],
    },
  },
  {
    summary:
      "Confidentiality must be maintained for a period of five years post-termination. The receiving party shall not disclose any confidential information except to employees with a need-to-know basis. A breach of this clause can lead to immediate termination and legal action. Certain disclosures are allowed by law or with written consent.",
    chunkIds: "chunk-003",
    legalOntology: {
      definitions: [
        "Confidential Information: Non-public data shared during the term.",
      ],
      obligations: [
        "Receiving party must keep shared information confidential.",
      ],
      rights: ["Disclosing party may seek legal remedies upon breach."],
      conditions: ["Disclosure allowed only to essential employees or by law."],
      clauses: ["Confidentiality", "Post-Termination Restrictions"],
      dates: ["5 years post termination"],
      parties: ["Disclosing Party", "Receiving Party"],
    },
  },
  {
    summary:
      "All payments must be made within 30 days of invoice receipt. Late payments incur a penalty of 1.5% per month. Payment disputes must be communicated within 10 business days. The provider reserves the right to suspend services for non-payment beyond 45 days.",
    chunkIds: "chunk-004",
    legalOntology: {
      definitions: [
        "Invoice: A financial statement issued for services rendered.",
      ],
      obligations: ["Client must pay invoices within 30 days."],
      rights: ["Provider can suspend service for non-payment."],
      conditions: ["Penalty applied for late payments."],
      clauses: ["Payment Terms", "Late Fee Policy"],
      dates: ["Within 30 days of invoice", "45-day grace period"],
      parties: ["Client", "Service Provider"],
    },
  },
];

export const chunks: DocumentChunk[] = [
  {
    id: "chunk-001",
    documentId: "doc-001",
    documentName: "Service Agreement",
    content: `
      The service provider agrees to submit a monthly report detailing all relevant performance metrics. This report shall include but not be limited to: total system uptime percentage, average response time, frequency and duration of outages, user session analytics, and error logs encountered during the reporting period. These reports are intended to verify compliance with the Service Level Agreement (SLA) and will serve as the basis for SLA credits or penalties.

      Reports must be submitted within five (5) business days following the end of each calendar month. They should be delivered in a standardized format as agreed upon during onboarding. Any deviations from this format must be communicated in advance and justified with valid operational reasons.

      The client shall maintain the right to audit these reports at any time within twelve (12) months of their delivery. The provider is required to store archived reports and associated logs securely during this period. In case of discrepancies, the provider must respond to audit queries within seven (7) business days.

      A failure to deliver reports within the defined timeline on more than two occasions in a quarter may constitute a material breach. In such cases, the client may choose to suspend services temporarily or terminate the agreement with cause, subject to the terms defined in the breach clause.
    `,
  },
  {
    id: "chunk-002",
    documentId: "doc-001",
    documentName: "Service Agreement",
    content: `
      This Agreement becomes effective on January 1, 2025, and remains in force for two years unless terminated earlier as permitted herein. The initial term may be extended automatically for subsequent one-year periods, provided neither party submits a notice of termination at least sixty (60) days prior to the expiration of the then-current term.

      During the term, each party shall fulfill all contractual obligations in good faith and continue to provide any deliverables agreed upon in the schedule. Termination does not absolve either party from previously accrued liabilities, such as payment obligations or confidentiality provisions.

      In the event of early termination, the terminating party must provide a written explanation outlining the cause and allow a minimum of fifteen (15) days to resolve the issue, unless the breach is deemed irreparable. Either party reserves the right to seek equitable relief if continued performance could result in substantial harm or liability.

      If no termination notice is served, the agreement shall renew automatically. At each renewal point, the parties may renegotiate pricing, SLA benchmarks, or other commercial terms upon mutual consent.
    `,
  },
  {
    id: "chunk-003",
    documentId: "doc-001",
    documentName: "Service Agreement",
    content: `
      Both parties acknowledge that sensitive information may be exchanged during the term of this Agreement. This includes but is not limited to financial data, source code, customer lists, and internal documentation. All such data shall be deemed Confidential Information under this clause.

      The receiving party shall take commercially reasonable steps to protect the confidentiality of the information, including limiting access to employees or agents with a strict need-to-know and ensuring that such personnel are under confidentiality obligations of equal or greater stringency.

      This obligation shall survive the termination of the Agreement for a period of five (5) years. During this period, the receiving party shall not disclose, publish, or disseminate any Confidential Information without the disclosing party’s prior written consent. If legally compelled to disclose such information, the receiving party must provide prior notice, if permissible by law.

      Breaches of this clause may result in immediate termination of the agreement and pursuit of legal remedies including but not limited to injunctive relief, damages, and cost recovery.
    `,
  },
  {
    id: "chunk-004",
    documentId: "doc-001",
    documentName: "Service Agreement",
    content: `
      The client agrees to remit payment within thirty (30) calendar days of the invoice issuance date. Each invoice will itemize services provided, the applicable rate, and a summary of activities performed during the billing period. The service provider reserves the right to adjust pricing with a 60-day written notice prior to the new rate’s effective date.

      If the client believes any portion of an invoice is inaccurate, they must notify the provider in writing within ten (10) business days. The undisputed portion of the invoice must still be paid by the due date. The provider shall resolve the dispute within fifteen (15) business days of receiving written notice.

      Any outstanding balance unpaid after the 30-day window will accrue interest at a rate of 1.5% per month until full payment is received. The provider also reserves the right to suspend services if payment is not received within forty-five (45) days of the invoice date, notwithstanding ongoing dispute resolution.

      The client is responsible for all reasonable costs associated with the collection of unpaid invoices, including attorney’s fees, court costs, and other related expenses.
    `,
  },
];

export const msgs = [
  {
    id: "1",
    role: "user",
    content: "What are the main obligations in this contract?",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "The main obligations include providing services as outlined in Section 2, maintaining confidentiality as per Section 5, and ensuring compliance with applicable laws.",
    timestamp: new Date(),
  },
  {
    id: "3",
    role: "user",
    content: "Can you explain the confidentiality clause in more detail?",
    timestamp: new Date(),
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Certainly. Section 5 states that both parties must not disclose any confidential information received during the term of the agreement, except as required by law.",
    timestamp: new Date(),
  },
  {
    id: "5",
    role: "user",
    content: "Is there any penalty for breach of confidentiality?",
    timestamp: new Date(),
  },
  {
    id: "6",
    role: "assistant",
    content:
      "Yes. A breach of confidentiality may result in immediate termination of the contract and liability for any resulting damages or legal fees.",
    timestamp: new Date(),
  },
  {
    id: "7",
    role: "user",
    content: "What does Section 7 say about dispute resolution?",
    timestamp: new Date(),
  },
];

export const attachment: Attachment[] = [
  {
    id: "doc-1",
    name: "Service_Agreement.pdf",
    type: "pdf",
    file: new File([""], "Service_Agreement.pdf", {
      type: "application/pdf",
    }),
    status: "extracted",
    text: "This is a sample service agreement document that outlines the terms and conditions between the service provider and the client. It includes sections on obligations, confidentiality, dispute resolution, and payment terms.",
  },
  {
    id: "doc-2",
    name: "Client_ID_Verification.png",
    type: "image",
    file: new File([""], "Service_Agreement.pdf", {
      type: "application/pdf",
    }),
    status: "extracted",
    text: "This is a sample service agreement document that outlines the terms and conditions between the service provider and the client. It includes sections on obligations, confidentiality, dispute resolution, and payment terms.",
  },
  {
    id: "doc-3",
    name: "Terms_and_Conditions.txt",
    type: "text",
    file: new File([""], "Service_Agreement.pdf", {
      type: "application/pdf",
    }),
    status: "extracted",
    text: "This is a sample service agreement document that outlines the terms and conditions between the service provider and the client. It includes sections on obligations, confidentiality, dispute resolution, and payment terms.",
  },
  {
    id: "doc-4",
    name: "Terms_and_Conditions.docs",
    type: "docs",
    file: new File([""], "Service_Agreement.pdf", {
      type: "application/pdf",
    }),
    status: "extracted",
    text: "This is a sample service agreement document that outlines the terms and conditions between the service provider and the client. It includes sections on obligations, confidentiality, dispute resolution, and payment terms.",
  },
  {
    id: "doc-5",
    name: "Terms_and_Conditions.xlsx",
    type: "xlsx",
    file: new File([""], "Service_Agreement.pdf", {
      type: "application/pdf",
    }),
    status: "extracted",
    text: "This is a sample service agreement document that outlines the terms and conditions between the service provider and the client. It includes sections on obligations, confidentiality, dispute resolution, and payment terms.",
  },
];

export const message = [
  {
    role: "user",
    content:
      "Summarize this contract and extract any obligations, rights, and important clauses.",
  },
];

export const plans = [
  {
    id: "trial",
    title: "Free",
    price: "$0 / month",
    bg: "bg-gray-100",
    border: "border",
    description: "Explore how AI can help you with everyday tasks",
    features: [
      "Access to GPT-4o mini and reasoning",
      "Standard voice mode",
      "Real-time data from the web",
      "Limited access to GPT-4o and o4-mini",
      "Limited file uploads & image generation",
      "Use custom GPTs",
    ],
    cta: "Your current plan",
    disabled: true,
  },
  {
    id: "plus",
    title: "Plus",
    price: "$20 / month",
    bg: "bg-blue-100",
    border: "border-emerald-600",
    description: "Level up productivity and creativity with expanded access",
    features: [
      "Everything in Free",
      "Extended limits on messaging & uploads",
      "Access to o4-mini, o4-mini-high, o3",
      "Research preview of GPT-4.5",
      "Custom tasks, projects & GPTs",
      "Limited Sora video generation",
    ],
    cta: "Get Plus",
  },
  {
    id: "pro",
    title: "Pro",
    price: "$200 / month",
    bg: "bg-gray-100",
    border: "border-gray-600",
    description: "Get the best of OpenAI with the highest level of access",
    features: [
      "Everything in Plus",
      "Unlimited access to all models & GPT-4o",
      "Advanced voice & deep research",
      "Access to GPT-4.5, Operator, and o3 Pro",
      "Extended Sora generation",
      "Preview of Codex agent",
    ],
    cta: "Get Pro",
  },
];
