# ClaimBrief Outbound Compliance Checklist

This is an operating checklist, not legal advice. Use it before any real email,
contact-form, phone, or payment/invoice send.

## Official References

- FTC CAN-SPAM business guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- FTC advertising basics: https://www.ftc.gov/business-guidance/advertising-marketing
- FCC unwanted robocalls/texts guide: https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts

## Before Sending Email

- Set `CLAIMBRIEF_POSTAL_ADDRESS` before generating final drafts, or manually replace `[ADD VALID PHYSICAL POSTAL ADDRESS BEFORE SENDING]` in every draft.
- Run `npm run outreach:claimbrief:check` and review `docs/outreach/generated/claimbrief-send-readiness-report-2026-07-02.md`.
- Use accurate sender/header information from the mailbox that should receive replies.
- Keep subject lines literal. Do not imply an existing relationship, claim review, referral, or urgent insurance matter.
- Keep the opt-out line in every first email and follow-up: `If this is not relevant, reply "no" and I will not follow up.`
- If someone says no, not interested, remove me, unsubscribe, or stop, set `status=opted_out` in `claimbrief-pipeline-tracker.csv` and do not follow up.
- Do not send more than two follow-ups without a reply.
- Do not use bought lists or guessed emails for this wedge. Use public business contact addresses already collected in the prospect file.

## Copy Claims

- Say `document-review tool`, `cited review brief`, and `for licensed claim professionals`.
- Do not say ClaimBrief recovers money, improves claim outcomes, finds carrier bad faith, gives legal advice, negotiates claims, or determines coverage.
- Do not use fake testimonials, invented results, or unverifiable savings claims.
- If using AI in copy, keep it factual and modest. The safer pitch is speed of document review, not magic automation.

## Contact Forms

- Use general business/contact fields only.
- If a form asks for claim details, policyholder details, claim number, loss address, or carrier information, do not invent data. Call instead or skip.
- Do not upload files to a prospect's site unless they explicitly asked for them.

## Calls And Texts

- Manual human calls to public business numbers are acceptable for this playbook.
- Do not use automated dialing, prerecorded audio, AI-generated voice, or bulk SMS.
- Do not send marketing texts unless the recipient gave clear consent.
- If they ask not to be called, update the tracker and stop.

## Payment And File Intake

- Before sending payment or invoice instructions, state the pilot is manual/concierge.
- Before accepting any packet, ask for old closed or redacted files first.
- Do not promise confidentiality terms beyond what you can actually honor.
- Do not use client files in demos, marketing, training data, or samples without explicit written permission.

## Final Pre-Send Gate

Do not send if any item is false:

- The email has a real physical mailing address.
- The message has an opt-out path.
- The subject line is not deceptive.
- The source/contact is in the prospect file.
- The tracker row is ready to update immediately after sending.
- The sample offer can actually be fulfilled within 24 hours.
