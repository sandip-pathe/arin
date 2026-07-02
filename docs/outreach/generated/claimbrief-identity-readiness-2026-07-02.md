# ClaimBrief Identity Readiness - 2026-07-02

Status: **BLOCKED_IDENTITY**

This report checks whether local sender identity values exist. It does not print secret or personal values.

## Checks

| Item | Env key | Status | Why |
| --- | --- | --- | --- |
| operator first name | `CLAIMBRIEF_OPERATOR_FIRST_NAME` | missing | Needed for most contact forms and for a credible phone opener. |
| operator last name | `CLAIMBRIEF_OPERATOR_LAST_NAME` | missing | Needed for forms that split name into first and last. |
| operator/company label | `CLAIMBRIEF_OPERATOR_COMPANY` | missing | Useful when a form asks company or when a receptionist asks who is calling. |
| reply email | `CLAIMBRIEF_REPLY_EMAIL or NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL` | missing | Needed so prospects can send packets or ask for pricing. |
| reply phone | `CLAIMBRIEF_REPLY_PHONE` | missing | Needed for the Gavnat form and useful for callbacks. |

## Missing

- `CLAIMBRIEF_OPERATOR_FIRST_NAME`
- `CLAIMBRIEF_OPERATOR_LAST_NAME`
- `CLAIMBRIEF_OPERATOR_COMPANY`
- `CLAIMBRIEF_REPLY_EMAIL or NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL`
- `CLAIMBRIEF_REPLY_PHONE`

## Local Setup Template

Add these to `.env.local` or export them in the shell before running first-attempt tooling:

```bash
CLAIMBRIEF_OPERATOR_FIRST_NAME="Sandy"
CLAIMBRIEF_OPERATOR_LAST_NAME="..."
CLAIMBRIEF_OPERATOR_COMPANY="ClaimBrief"
CLAIMBRIEF_REPLY_EMAIL="..."
CLAIMBRIEF_REPLY_PHONE="..."
```

Optional public app contact fallback:

```bash
NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL="..."
```

Direct email still separately requires:

```bash
CLAIMBRIEF_POSTAL_ADDRESS="..."
```

## Next Command

```bash
npm run outreach:claimbrief:identity
npm run outreach:claimbrief:first-attempt
```
