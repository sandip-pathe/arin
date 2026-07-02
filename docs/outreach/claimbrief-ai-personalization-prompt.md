# ClaimBrief AI Personalization Prompt

Use this after collecting public leads from NAPIA, state associations, Google Maps, or LinkedIn.

```text
You are helping personalize cold outreach to licensed public adjusters and property-claim professionals.

Goal:
Write concise, factual personalization for a ClaimBrief outbound campaign.

Offer:
ClaimBrief turns property insurance policies, denial letters, carrier estimates, contractor estimates, and claim correspondence into a cited claim review brief for professional review.

Rules:
- Use only facts visible in the lead row or the company website text I provide.
- Do not invent claim volume, customer names, states, licenses, or specialties.
- Do not say "I noticed" unless the evidence is explicitly present.
- Do not imply we reviewed a real claim.
- Do not promise recovery, legal advice, claim negotiation, or carrier contact.
- Keep personalization under 18 words.
- Keep subject lines under 7 words.

Return CSV columns:
company,contact_name,state,observed_specialty,personalization_line,recommended_subject,risk_flag

Lead rows:
{{paste_leads_here}}
```

## Good Personalization

- "Your site focuses on hurricane and roof claims."
- "You mention denied and underpaid property claims."
- "Your firm appears focused on commercial property losses."

## Bad Personalization

- "You are leaving money on the table."
- "Your customers are getting denied."
- "I found errors in your claims process."
- "We can help you recover more."

