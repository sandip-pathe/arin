# ClaimBrief Today Execution Plan - 2026-07-02

Purpose: make the first five Oklahoma wind/hail attempts executable without more research.

No outreach is automated. This plan does not submit forms, send email, or make calls.

## Action Order

1. Run `npm run outreach:claimbrief:live-check`.
2. Run `npm run outreach:claimbrief:check:form-call`.
3. Run `npm run outreach:claimbrief:today-paths`.
4. Work the targets below in order.
5. Stop after any reply, sample request, packet offer, or pricing question.

## Decision Rule

- `FORM_FIRST_IF_GENERAL_FIELDS_VISIBLE`: form attempt is allowed only with general contact fields.
- `CALL_FIRST`: call before form.
- `CALL_FIRST_FORM_HAS_RISK_FIELDS`: call before form because the form asks for claim/detail-like data.

Do not invent policyholder, claim number, loss address, carrier, or claim details.

Live offer page: https://app.anaya.legal/claimbrief/oklahoma-hail

## 1. Gavnat Oklahoma

- Primary action: FORM_FIRST_IF_GENERAL_FIELDS_VISIBLE
- Why: Try the public form only if visible fields are general contact fields. If a required dropdown or hidden flow asks for claim details, call instead.
- Phone: 405-628-0126
- Contact page: https://www.gavnat.com/location/oklahoma/
- Detected email: info@gavnat.com
- Contact-path status: FORM_REVIEW_NEEDED

Short form message:

```text
I saw Gavnat's Oklahoma page focuses on tornado, hail, and underpaid property claims.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is https://app.anaya.legal/claimbrief/oklahoma-hail.
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today execution plan"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today execution plan"
```

After voicemail:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "left voicemail from today execution plan"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today execution target because contact path was not usable"
```

## 2. Prime Adjustments Oklahoma

- Primary action: CALL_FIRST
- Why: Call first. No usable static form was found.
- Phone: 877-729-6365
- Contact page: https://primeadjustments.com/oklahoma-public-adjuster/
- Detected email: none
- Contact-path status: CALL_FIRST_NO_FORM_FOUND

Short form message:

```text
I saw Prime Adjustments lists Oklahoma fire, hail, wind, water, and commercial roof claim reviews.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is https://app.anaya.legal/claimbrief/oklahoma-hail.
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today execution plan"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today execution plan"
```

After voicemail:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "left voicemail from today execution plan"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Prime Adjustments Oklahoma" --contact "https://primeadjustments.com/oklahoma-public-adjuster/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today execution target because contact path was not usable"
```

## 3. Brown-O'Haver Public Adjusters of Oklahoma

- Primary action: CALL_FIRST_FORM_HAS_RISK_FIELDS
- Why: Call first. Form contains claim/detail-like fields: Address* / address / text.
- Phone: 405.735.5510
- Contact page: https://www.brown-ohaver.com/page/contact-us
- Detected email: bohok@brown-ohaver.com
- Contact-path status: FORM_REVIEW_NEEDED

Short form message:

```text
I saw Brown-O'Haver has an Oklahoma office and writes about statewide disaster and large-loss claim work.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is https://app.anaya.legal/claimbrief/oklahoma-hail.
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today execution plan"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today execution plan"
```

After voicemail:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "left voicemail from today execution plan"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Brown-O'Haver Public Adjusters of Oklahoma" --contact "https://www.brown-ohaver.com/page/contact-us" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today execution target because contact path was not usable"
```

## 4. Corbitt Public Adjusting Oklahoma

- Primary action: CALL_FIRST
- Why: Call first. No usable static form was found.
- Phone: 888-303-6607
- Contact page: https://corbittpublicadjusting.com/states/oklahoma
- Detected email: none
- Contact-path status: CALL_FIRST_NO_FORM_FOUND

Short form message:

```text
I saw Corbitt's Oklahoma page focuses on licensed public adjusting for hail and tornado damage.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is https://app.anaya.legal/claimbrief/oklahoma-hail.
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today execution plan"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today execution plan"
```

After voicemail:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "left voicemail from today execution plan"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Corbitt Public Adjusting Oklahoma" --contact "https://corbittpublicadjusting.com/states/oklahoma" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today execution target because contact path was not usable"
```

## 5. Jansen Adjusters International Oklahoma

- Primary action: CALL_FIRST_FORM_HAS_RISK_FIELDS
- Why: Call first. Form contains claim/detail-like fields: Address 1 / Address1 / ContactForm_ContactForm_Address1 / text; Address 2 / Address2 / ContactForm_ContactForm_Address2 / text.
- Phone: 800.779.8714
- Contact page: https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/
- Detected email: info@jansenai.com
- Contact-path status: FORM_REVIEW_NEEDED

Short form message:

```text
I saw Jansen's Oklahoma page discusses Oklahoma City/Tulsa public adjusting after natural and man-made disasters.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: https://app.anaya.legal/claimbrief/oklahoma-hail

Could I make one free sample?
```

Phone opener:

```text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
```

Voicemail:

```text
Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is https://app.anaya.legal/claimbrief/oklahoma-hail.
```

After form submit:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "submitted from today execution plan"
```

After call:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "called from today execution plan"
```

After voicemail:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status called --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "left voicemail from today execution plan"
```

If unusable:

```bash
npm run outreach:claimbrief:tracker -- --company "Jansen Adjusters International Oklahoma" --contact "https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/" --status skipped --next-action none --last-touch-date 2026-07-02 --append-note "skipped today execution target because contact path was not usable"
```
