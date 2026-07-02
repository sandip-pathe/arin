# ClaimBrief Oklahoma Wind/Hail Sprint

Date: 2026-07-02

## Why This Sprint Exists

The broad public-adjuster list is useful, but the sharper sales reason this
week is Oklahoma wind/hail claim review.

Recent trigger:

- On 2026-06-24, the Oklahoma Attorney General announced a new lawsuit
  alleging State Farm wrongfully denied or underpaid legitimate hail and wind
  damage claims from Oklahoma homeowners. The outreach point is not to accuse
  any carrier; it is that Oklahoma wind/hail claim files are timely and
  document-heavy.
  Source: https://oklahoma.gov/oag/news/newsroom/2026/june/drummond-files-new-lawsuit-against-state-farm.html
- Triple-I's latest homeowners data says 5.3% of insured homes had a claim in
  2023, and property damage accounted for 97.3% of homeowners claims.
  Source: https://www.iii.org/fact-statistic/facts-statistics-homeowners-and-renters-insurance
- GAO reported in 2026 that high wind-risk areas had materially higher
  homeowners premiums than medium wind-risk areas, and that disaster risk can
  reduce insurance availability.
  Source: https://www.gao.gov/products/gao-26-107867

The conclusion is not "attack State Farm." Do not say that. The conclusion is:

> Oklahoma wind/hail denial and underpayment files are timely, emotional, and
> document-heavy. ClaimBrief can sell as a fast cited packet review for licensed
> professionals who already work those files.

## Sprint Rule

No messages are sent by automation. Every email, form, or call requires manual
review and action-time confirmation.

While `CLAIMBRIEF_POSTAL_ADDRESS` is unset, direct email is intentionally
disabled. Work this sprint by contact form or phone first.

Do not:

- Mention a specific carrier unless the prospect's own public page does.
- Claim their clients have a disputed State Farm file.
- Accuse any insurer of wrongdoing.
- Ask for active sensitive files first.
- Submit forms that require policyholder, claim number, loss address, carrier,
  or fake claim details.

Ask for:

- one old closed or redacted Oklahoma wind/hail claim packet
- permission to return one sample ClaimBrief within 24 hours

## Trigger Offer

```text
I am testing ClaimBrief for wind/hail, denial, and underpayment files.

It turns a policy, carrier letter, estimates, and correspondence into a cited
review brief: carrier position, policy language mentioned, missing evidence,
and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document
review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail
packet?
```

Targeted route:

```text
https://app.anaya.legal/claimbrief/oklahoma-hail
```

Before outreach, run:

```bash
npm run outreach:claimbrief:live-check
```

The generated sprint uses the targeted route by default. If the live check ever
shows that route is unavailable, set
`CLAIMBRIEF_OKLAHOMA_OFFER_URL=https://app.anaya.legal/claimbrief` and
regenerate before outreach.

## Prioritized Targets

These were added to `docs/outreach/claimbrief-prospects-2026-07-02.csv` as
priority 101-109:

| Priority | Company | Phone | Channel | Why |
| ---: | --- | --- | --- | --- |
| 101 | Gavnat Oklahoma | 405-628-0126 | Form/call | Oklahoma page names tornado, hail, denied, delayed, and underpaid claims. |
| 102 | Prime Adjustments Oklahoma | 877-729-6365 | Form/call | Oklahoma page lists fire, hail, wind, water, and commercial roof hail claims. |
| 103 | Skyline Adjusters Oklahoma | +1 (800) 590-7293 | Call/email after readiness | Oklahoma page publishes claims email and phone. |
| 104 | Palco Claims Chickasha OK | (512) 553-6432 | Call/email after readiness | Oklahoma page discusses wind, hail, tornado, and denied claim support. |
| 105 | Brown-O'Haver Public Adjusters of Oklahoma | 405.735.5510 | Form/call | Official contact page lists a Moore, OK office and email. |
| 106 | Corbitt Public Adjusting Oklahoma | 888-303-6607 | Form/call | Oklahoma page positions around hail and tornado damage claims. |
| 107 | Jansen Adjusters International Oklahoma | 800.779.8714 | Form/call | Oklahoma page says they help residents and businesses navigate complex claims. |
| 108 | ClaimsMate Oklahoma | (877) 202-0204 | Form/call | Oklahoma page mentions denied tornado claims and business-interruption disputes. |
| 109 | Noble Public Adjusting Group Oklahoma | 866-935-5717 | Form/call | Oklahoma page says Noble represents property owners, not insurance companies. |

Generated sprint board:

- `docs/outreach/generated/claimbrief-first-attempt-packet-2026-07-02.md`
- `docs/outreach/generated/claimbrief-today-execution-plan-2026-07-02.html`
- `docs/outreach/generated/claimbrief-today-action-sheet-2026-07-02.html`
- `docs/outreach/generated/claimbrief-today-contact-paths-2026-07-02.md`
- `docs/outreach/generated/claimbrief-oklahoma-trigger-sprint-2026-07-02.html`

Targeted page:

- `/claimbrief/oklahoma-hail`

Build command:

```bash
npm run outreach:claimbrief:today
npm run outreach:claimbrief:today-paths
npm run outreach:claimbrief:today-plan
npm run outreach:claimbrief:first-attempt
npm run outreach:claimbrief:trigger-sprint
```

## Success Criteria

This sprint is worth continuing only if 20 trigger attempts produce one of:

- 1 reply asking for a sample
- 1 old closed/redacted packet
- 1 call where the reviewer says the output would be useful if it had a named
  missing section

If none happen, keep the general public-adjuster batch but do not overfit the
product to Oklahoma.
