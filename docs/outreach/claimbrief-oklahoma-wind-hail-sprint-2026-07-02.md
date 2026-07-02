# ClaimBrief Oklahoma Wind/Hail Sprint

Date: 2026-07-02

## Why This Sprint Exists

The broad public-adjuster list is useful, but the sharper sales reason this
week is Oklahoma wind/hail claim review.

Recent trigger:

- On 2026-06-26, a widely syndicated report said the Oklahoma Attorney General
  filed a lawsuit accusing State Farm of using a program to deny or minimize
  wind and hail disaster claims. State Farm denies the allegations.
  Source: https://nypost.com/2026/06/26/us-news/oklahoma-accuses-state-farm-of-denying-claims-for-disaster-damage/
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

Could I create one free sample from an old closed or redacted Oklahoma wind/hail
packet?
```

## Prioritized Targets

These were added to `docs/outreach/claimbrief-prospects-2026-07-02.csv` as
priority 101-108:

| Priority | Company | Channel | Why |
| ---: | --- | --- | --- |
| 101 | Gavnat Oklahoma | Form | Oklahoma page names tornado, hail, denied, delayed, and underpaid claims. |
| 102 | Prime Adjustments Oklahoma | Form/call | Oklahoma page lists fire, hail, wind, water, and commercial roof hail claims. |
| 103 | Skyline Adjusters Oklahoma | Email/call | Oklahoma page publishes claims email and phone. |
| 104 | Palco Claims Chickasha OK | Email/call | Oklahoma page discusses wind, hail, tornado, and denied claim support. |
| 105 | Brown-O'Haver Public Adjusters of Oklahoma | Form/call | NAPIA profile lists an Oklahoma public-adjusting office in Moore. |
| 106 | Corbitt Public Adjusting Oklahoma | Form | Oklahoma page positions around hail and tornado damage claims. |
| 107 | Jansen Adjusters International Oklahoma | Form | Oklahoma page says they help residents and businesses navigate complex claims. |
| 108 | ClaimsMate Oklahoma | Form | Oklahoma page mentions denied tornado claims and business-interruption disputes. |

Generated sprint board:

- `docs/outreach/generated/claimbrief-oklahoma-trigger-sprint-2026-07-02.html`

Build command:

```bash
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
