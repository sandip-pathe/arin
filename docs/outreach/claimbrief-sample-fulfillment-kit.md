# ClaimBrief Sample Fulfillment Kit

Use this only after a real prospect sends one old closed or redacted claim
packet. The goal is to return one useful sample within 24 hours and ask for the
starter batch if it saves review time.

## Hard Rules

- Do not commit client files, extracted text, summaries, or screenshots.
- Store received packets only under `docs/outreach/workbench/` or
  `docs/outreach/received-packets/`; both paths are gitignored.
- Use one claim packet at a time. Do not merge several claims into one sample.
- If the packet contains obvious unredacted sensitive personal, banking,
  medical, tax, or claim-number data, ask the prospect to resend a safer copy.
- Do not contact carriers, policyholders, contractors, attorneys, or third
  parties.
- Do not use the file in demos, marketing, training data, or future samples
  without explicit written permission.

## Intake Triage

Create a local folder:

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$folder = "docs/outreach/workbench/$stamp-company-slug"
New-Item -ItemType Directory -Force $folder
```

Save the incoming packet there, then make this quick call:

| Check | Continue If | Stop If |
| --- | --- | --- |
| Packet type | Property claim, denial, underpayment, scope, estimate, or policy-review file | Injury, health, auto, litigation-heavy, or unrelated file |
| Redaction | Old closed file or reasonably redacted active file | Bank details, medical/tax records, SSNs, full claim number, or unnecessary personal data |
| Documents | At least one policy/coverage letter/denial/estimate/correspondence item | Only photos or vague notes with no document basis |
| Buyer fit | Public adjuster, restoration/claim professional, or claim consultant | Homeowner asking for legal/claim advice directly |

If stopped, send:

```text
Thanks. I should not review this version because it contains more sensitive information than needed for a sample.

Could you resend one old closed or redacted packet with only the policy/coverage letter, denial or carrier letter, estimates, and key correspondence?

Please remove anything you do not want reviewed.
```

## Build The Sample

1. Open `http://localhost:9002/claimbrief`.
2. Click `Try local brief` or `Create Brief`.
3. Upload the safe packet files or paste extracted text.
4. Generate the summary.
5. Read the quick skim first. If it misses the claim type or carrier position,
   inspect the source text before trusting the output.
6. In chat, ask only grounding/editing questions:

```text
List the documents reviewed and the source refs for each.
```

```text
Where does the carrier explain the denial, underpayment, or scope position? Quote only short source-backed phrases.
```

```text
What evidence is missing or unclear based only on this packet?
```

7. Export summary as PDF and Markdown.
8. Rename files:

```text
ClaimBrief-Sample-{company-slug}-{YYYY-MM-DD}.pdf
ClaimBrief-Sample-{company-slug}-{YYYY-MM-DD}.md
```

## Human Review Pass

Before delivery, read the PDF/Markdown and remove or soften anything that:

- Sounds like legal advice.
- Says the claim should be paid or denied.
- Gives a settlement recommendation.
- Accuses a carrier of bad faith.
- Invents missing facts.
- Treats missing documents as proof of wrongdoing.
- Includes unnecessary personal or claim identifiers.

The sample should say `missing from packet`, `unclear from provided files`, or
`for reviewer follow-up` when the record is incomplete.

## Delivery Note

```text
I attached the sample ClaimBrief as PDF and Markdown.

The useful test is simple: did this save review time or surface anything your team would want to check?

Boundaries: this is a document-review packet for professional review. It is not legal advice, public-adjusting service, carrier submission, claim negotiation, or a coverage determination.

If it was useful, I can do the starter batch:
- $99 for 3 ClaimBriefs
- send files by email/link
- I return PDF + Markdown review packets
- no annual contract

Pilot details:
https://app.anaya.legal/claimbrief/pilot

Should I send payment or invoice instructions for the starter batch?
```

## Tracker Updates

After receiving the packet:

```bash
npm run outreach:claimbrief:tracker -- --company "COMPANY" --packet-received yes --status packet_received --next-action produce_sample --last-touch-date YYYY-MM-DD --append-note "received redacted packet"
```

After sending the sample:

```bash
npm run outreach:claimbrief:tracker -- --company "COMPANY" --sample-delivered yes --status sample_delivered --next-action close_starter --last-touch-date YYYY-MM-DD --append-note "sent PDF and Markdown sample"
```

If they say it was useful:

```bash
npm run outreach:claimbrief:tracker -- --company "COMPANY" --payment-status invoice_requested --next-action send_invoice --last-touch-date YYYY-MM-DD --append-note "asked for starter payment or invoice instructions"
```

## Stop Building

If one prospect sends a packet, stop outreach tooling work until the sample is
delivered. If one prospect pays, stop feature work and fulfill the paid batch.
