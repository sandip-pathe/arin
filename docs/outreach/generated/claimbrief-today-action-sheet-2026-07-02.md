# ClaimBrief Today Action Sheet - 2026-07-02

Purpose: create one paid conversation from the narrowest current wedge: Oklahoma wind/hail claim packet review for public adjusters.

No outreach is automated. This sheet only gives the operator the next five targets, exact copy, call opener, and tracker commands.

## Pre-Action Gates

Run these before touching any prospect:

```bash
npm run outreach:claimbrief:live-check
npm run outreach:claimbrief:check:form-call
```

Proceed only if live routes are ready and form/call readiness is `READY` or `READY_WITH_WARNINGS`.

## Stop Conditions

Stop outreach immediately if someone replies, asks for a sample, offers a packet, or asks pricing. Move to `docs/outreach/claimbrief-sample-fulfillment-kit.md`, produce the free sample, then use the $99 starter close.

Do not submit any form that requires claim-specific data. Call instead or mark the target skipped.

Live offer page:

https://app.anaya.legal/claimbrief/oklahoma-hail

## Target 1: Gavnat Oklahoma

- Channel: contact_form
- Contact: https://www.gavnat.com/location/oklahoma/
- Phone: 405-628-0126
- Why this lead: Official locations page lists Oklahoma Public Adjusters with phone 405-628-0126; Oklahoma page discusses tornado hail flood wildfire and denied/delayed/underpaid claims.
- Operator rule: Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.

Subject:

```text
Oklahoma hail brief?
```

Message:

```text
I saw Gavnat's Oklahoma page focuses on tornado, hail, and underpaid property claims.

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?
```

Phone opener:

```text
Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today Oklahoma action sheet"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today Oklahoma action sheet"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today Oklahoma action target because contact path was not usable"
```

## Target 2: Prime Adjustments Oklahoma

- Channel: contact_form
- Contact: https://primeadjustments.com/oklahoma-public-adjuster/
- Phone: 877-729-6365
- Why this lead: Official Oklahoma page lists phone, licensed states, and property claim categories.
- Operator rule: Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.

Subject:

```text
Oklahoma wind brief?
```

Message:

```text
I saw Prime Adjustments lists Oklahoma fire, hail, wind, water, and commercial roof claim reviews.

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?
```

Phone opener:

```text
Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today Oklahoma action sheet"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today Oklahoma action sheet"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today Oklahoma action target because contact path was not usable"
```

## Target 3: Brown-O'Haver Public Adjusters of Oklahoma

- Channel: contact_form
- Contact: https://www.brown-ohaver.com/page/contact-us
- Phone: 405.735.5510
- Why this lead: Official contact page lists Moore OK office phone 4057355510 and bohok@brown-ohaver.com; homepage says the team helped Oklahomans after tornado disasters.
- Operator rule: Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.

Subject:

```text
Oklahoma claim brief?
```

Message:

```text
I saw Brown-O'Haver has an Oklahoma office and writes about statewide disaster and large-loss claim work.

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?
```

Phone opener:

```text
Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today Oklahoma action sheet"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today Oklahoma action sheet"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today Oklahoma action target because contact path was not usable"
```

## Target 4: Corbitt Public Adjusting Oklahoma

- Channel: contact_form
- Contact: https://corbittpublicadjusting.com/states/oklahoma
- Phone: 888-303-6607
- Why this lead: Official site lists 888-303-6607 and Oklahoma page describes hail and tornado public-adjuster work.
- Operator rule: Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.

Subject:

```text
Oklahoma storm brief?
```

Message:

```text
I saw Corbitt's Oklahoma page focuses on licensed public adjusting for hail and tornado damage.

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?
```

Phone opener:

```text
Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today Oklahoma action sheet"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today Oklahoma action sheet"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today Oklahoma action target because contact path was not usable"
```

## Target 5: Jansen Adjusters International Oklahoma

- Channel: contact_form
- Contact: https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/
- Phone: 800.779.8714
- Why this lead: Official Tulsa office page lists 800.779.8714 and 405.445.0455; page discusses policy review and complex property claims.
- Operator rule: Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.

Subject:

```text
Oklahoma City brief?
```

Message:

```text
I saw Jansen's Oklahoma page discusses Oklahoma City/Tulsa public adjusting after natural and man-made disasters.

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?
```

Phone opener:

```text
Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today Oklahoma action sheet"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today Oklahoma action sheet"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today Oklahoma action target because contact path was not usable"
```
