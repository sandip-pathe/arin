# ClaimBrief First Attempt Packet - 2026-07-02

Status: **BLOCKED_IDENTITY**

Purpose: make the first external action precise. This packet still does not submit forms, send messages, or make calls.

## Identity Gate

| Item | Env key | Status | Why |
| --- | --- | --- | --- |
| operator first name | `CLAIMBRIEF_OPERATOR_FIRST_NAME` | missing | Needed for most contact forms and for a credible phone opener. |
| operator last name | `CLAIMBRIEF_OPERATOR_LAST_NAME` | missing | Needed for forms that split name into first and last. |
| operator/company label | `CLAIMBRIEF_OPERATOR_COMPANY` | missing | Useful when a form asks company or when a receptionist asks who is calling. |
| reply email | `CLAIMBRIEF_REPLY_EMAIL or NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL` | missing | Needed so prospects can send packets or ask for pricing. |
| reply phone | `CLAIMBRIEF_REPLY_PHONE` | missing | Needed for the Gavnat form and useful for callbacks. |

Values are intentionally not printed here. The report only shows whether each value is set.

Set missing values locally before any form submit or call:

```bash
CLAIMBRIEF_OPERATOR_FIRST_NAME="Sandy"
CLAIMBRIEF_OPERATOR_LAST_NAME="..."
CLAIMBRIEF_OPERATOR_COMPANY="ClaimBrief"
CLAIMBRIEF_REPLY_EMAIL="..."
CLAIMBRIEF_REPLY_PHONE="..."
```

## First External Attempt

Target: **Gavnat Oklahoma**

Action: submit the public form only if visible fields stay general. If the live form asks for claim number, carrier, policyholder, loss address, or other claim-specific details, do not submit; call instead.

URL:

```text
https://www.gavnat.com/location/oklahoma/
```

Detected required fields:

- input_7 / input_1_7 / text
- input_8 / input_1_8 / text
- input_4 / input_1_4 / email
- input_3 / input_1_3 / tel
- input_12.4 / input_1_12_4 / select

Detected sample fields:

- input_14 / input_1_14 / text
- input_7 / input_1_7 / text
- input_8 / input_1_8 / text
- input_4 / input_1_4 / email
- input_3 / input_1_3 / tel
- input_12.4 / input_1_12_4 / select
- input_13 / input_1_13 / select
- input_6 / input_1_6 / textarea

Suggested field mapping:

| Form meaning | Value source |
| --- | --- |
| First name | `CLAIMBRIEF_OPERATOR_FIRST_NAME` |
| Last name | `CLAIMBRIEF_OPERATOR_LAST_NAME` |
| Email | `CLAIMBRIEF_REPLY_EMAIL` or `NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL` |
| Phone | `CLAIMBRIEF_REPLY_PHONE` |
| Company, if shown | `CLAIMBRIEF_OPERATOR_COMPANY` |
| Message/inquiry | short message below |
| Dropdowns | choose only truthful/general options; do not pick fake claim details |

Short message:

```text
I saw Gavnat's Oklahoma page focuses on tornado, hail, and underpaid property claims.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

After submit tracker command:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted first external attempt"
```

## Call-First Backup

If Gavnat form is not usable, call **405-628-0126**.

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

After call tracker command:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called first external attempt"
```

## Action-Time Confirmation Required

Before I submit any form or place/assist with any call, I need explicit confirmation for that exact action, target, and sender identity.

Execution plan exists: **yes**
Contact path report exists: **yes**
