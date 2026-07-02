# ClaimBrief Today Contact Path Report - 2026-07-02

Read-only check for the five targets in the today action sheet. This script only performs HTTP GET requests and static HTML inspection. It does not fill or submit forms.

## Summary

| # | Company | Status | HTTP | Forms | Risk Fields | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Gavnat Oklahoma | FORM_REVIEW_NEEDED | 200 | 1 | none detected | Open form, but call instead if required fields ask for claim-specific details. |
| 2 | Prime Adjustments Oklahoma | CALL_FIRST_NO_FORM_FOUND | 200 | 0 | none detected | Call first using the phone opener. |
| 3 | Brown-O'Haver Public Adjusters of Oklahoma | FORM_REVIEW_NEEDED | 200 | 1 | Address* / address / text | Open form, but call instead if required fields ask for claim-specific details. |
| 4 | Corbitt Public Adjusting Oklahoma | CALL_FIRST_NO_FORM_FOUND | 200 | 0 | none detected | Call first using the phone opener. |
| 5 | Jansen Adjusters International Oklahoma | FORM_REVIEW_NEEDED | 200 | 2 | Address 1 / Address1 / ContactForm_ContactForm_Address1 / text; Address 2 / Address2 / ContactForm_ContactForm_Address2 / text | Open form, but call instead if required fields ask for claim-specific details. |

## Operator Rule

If a form requires policyholder, claim number, carrier, loss address, loss date, or insurance details, do not submit it. Call instead or mark the target skipped.

## Details

## Gavnat Oklahoma

- Source URL: https://www.gavnat.com/location/oklahoma/
- Final URL: https://www.gavnat.com/location/oklahoma/
- HTTP status: 200
- Page title: Oklahoma Public Adjusters | Tornado & Hail Claims | Gavnat
- Phone: 405-628-0126
- Status: FORM_REVIEW_NEEDED
- Recommendation: Open form, but call instead if required fields ask for claim-specific details.
- Emails detected: info@gavnat.com
- Contact links detected: Contact Us (https://www.gavnat.com/contact-us/); Contact Us (https://gavnat.com/contact-us/)
- Fetch error: none

```text
Form 1
- Action: https://www.gavnat.com/location/oklahoma/#gf_1
- Method: POST
- Field count: 8
- Required fields: input_7 / input_1_7 / text, input_8 / input_1_8 / text, input_4 / input_1_4 / email, input_3 / input_1_3 / tel, input_12.4 / input_1_12_4 / select
- Risk fields: none detected
- Sample fields: input_14 / input_1_14 / text, input_7 / input_1_7 / text, input_8 / input_1_8 / text, input_4 / input_1_4 / email, input_3 / input_1_3 / tel, input_12.4 / input_1_12_4 / select, input_13 / input_1_13 / select, input_6 / input_1_6 / textarea
```

## Prime Adjustments Oklahoma

- Source URL: https://primeadjustments.com/oklahoma-public-adjuster/
- Final URL: https://primeadjustments.com/oklahoma-public-adjuster/
- HTTP status: 200
- Page title: Oklahoma Public Adjuster | Oklahoma Insurance Claim Help
- Phone: 877-729-6365
- Status: CALL_FIRST_NO_FORM_FOUND
- Recommendation: Call first using the phone opener.
- Emails detected: none
- Contact links detected: Contact (https://primeadjustments.com/contact/)
- Fetch error: none

```text
No forms detected in static HTML.
```

## Brown-O'Haver Public Adjusters of Oklahoma

- Source URL: https://www.brown-ohaver.com/page/contact-us
- Final URL: https://www.brown-ohaver.com/page/contact-us
- HTTP status: 200
- Page title: Make A FREE Insurance Claim Consultation with Brown Ohaver | Call Us
- Phone: 405.735.5510
- Status: FORM_REVIEW_NEEDED
- Recommendation: Open form, but call instead if required fields ask for claim-specific details.
- Emails detected: bohok@brown-ohaver.com
- Contact links detected: Contact (https://www.brown-ohaver.com/page/contact-us)
- Fetch error: none

```text
Form 1
- Action: (current page)
- Method: GET/UNKNOWN
- Field count: 7
- Required fields: First Name* / first_name / text, Last Name* / last_name / text, Address* / address / text, State* / state / text, Contact Phone* / phone / text, Email* / email / email, Inquiry* / inquiry / textarea
- Risk fields: Address* / address / text
- Sample fields: First Name* / first_name / text, Last Name* / last_name / text, Address* / address / text, State* / state / text, Contact Phone* / phone / text, Email* / email / email, Inquiry* / inquiry / textarea
```

## Corbitt Public Adjusting Oklahoma

- Source URL: https://corbittpublicadjusting.com/states/oklahoma
- Final URL: https://corbittpublicadjusting.com/states/oklahoma
- HTTP status: 200
- Page title: not detected
- Phone: 888-303-6607
- Status: CALL_FIRST_NO_FORM_FOUND
- Recommendation: Call first using the phone opener.
- Emails detected: none
- Contact links detected: none
- Fetch error: none

```text
No forms detected in static HTML.
```

## Jansen Adjusters International Oklahoma

- Source URL: https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/
- Final URL: https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/
- HTTP status: 200
- Page title: Public Adjuster Tulsa Claim Adjusters Oklahoma | Jansen/Adjusters International
- Phone: 800.779.8714
- Status: FORM_REVIEW_NEEDED
- Recommendation: Open form, but call instead if required fields ask for claim-specific details.
- Emails detected: info@jansenai.com
- Contact links detected: Contact (https://www.jansenai.com/contact/); Office Locations (https://www.jansenai.com/contact/office-locations/); Contact Us (https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/#contact-form); Dallas, Texas (https://www.jansenai.com/contact/office-locations/dallas-texas/); Houston, Texas (https://www.jansenai.com/contact/office-locations/houston-texas/); New Orleans, Louisiana (https://www.jansenai.com/contact/office-locations/new-orleans-louisiana/); San Juan, Puerto Rico (https://www.jansenai.com/contact/office-locations/san-juan-puerto-rico/); Tulsa, Oklahoma (https://www.jansenai.com/contact/office-locations/oklahoma-city-oklahoma/)
- Fetch error: none

```text
Form 1
- Action: https://www.jansenai.com/_formsubmit/ContactForm/
- Method: POST
- Field count: 12
- Required fields: First Name * / FirstName / ContactForm_ContactForm_FirstName / text, Last Name * / LastName / ContactForm_ContactForm_LastName / text, Email * / Email / ContactForm_ContactForm_Email / email, Phone * / Phone / ContactForm_ContactForm_Phone / tel, City * / City / ContactForm_ContactForm_City / text, State / ContactForm_ContactForm_State / select, Zip * / Zip / ContactForm_ContactForm_Zip / text
- Risk fields: Address 1 / Address1 / ContactForm_ContactForm_Address1 / text, Address 2 / Address2 / ContactForm_ContactForm_Address2 / text
- Sample fields: First Name * / FirstName / ContactForm_ContactForm_FirstName / text, Last Name * / LastName / ContactForm_ContactForm_LastName / text, Email * / Email / ContactForm_ContactForm_Email / email, Phone * / Phone / ContactForm_ContactForm_Phone / tel, Address 1 / Address1 / ContactForm_ContactForm_Address1 / text, Address 2 / Address2 / ContactForm_ContactForm_Address2 / text, City * / City / ContactForm_ContactForm_City / text, State / ContactForm_ContactForm_State / select, Zip * / Zip / ContactForm_ContactForm_Zip / text, Additional Comments or Questions / Comments / ContactForm_ContactForm_Comments / textarea, ScheduleAppointment / ContactForm_ContactForm_ScheduleAppointment / checkbox, WebField / ContactForm_ContactForm_WebField / text

Form 2
- Action: https://www.jansenai.com/_subscription/FooterSubscribeForm/
- Method: POST
- Field count: 8
- Required fields: Enter Your Email to Subscribe / Email / FooterSubscribeForm_FooterSubscribeForm_Email / email
- Risk fields: none detected
- Sample fields: Types[App\Newsroom\NewsroomArticle] / FooterSubscribeForm_FooterSubscribeForm_Types_App_Newsroom_New, Types[App\Podcast\PodcastEpisode] / FooterSubscribeForm_FooterSubscribeForm_Types_App_Podcast_Podcas, Types[App\Video\Video] / FooterSubscribeForm_FooterSubscribeForm_Types_App_Video_Video / checkbox, Types[App\CaseStudy\CaseStudy] / FooterSubscribeForm_FooterSubscribeForm_Types_App_CaseStudy_CaseStu, Types[App\Publication\Publication-2] / FooterSubscribeForm_FooterSubscribeForm_Types_App_Publication, Types[App\Publication\Publication-1] / FooterSubscribeForm_FooterSubscribeForm_Types_App_Publication, Enter Your Email to Subscribe / Email / FooterSubscribeForm_FooterSubscribeForm_Email / email, WebField / FooterSubscribeForm_FooterSubscribeForm_WebField / text
```
