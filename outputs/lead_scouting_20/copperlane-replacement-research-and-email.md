# Copperlane Replacement Lead

## Replacement

Replaced missing row 8 / Zynk with:

| Priority | Person | Title | Company | Domain | Email |
|---:|---|---|---|---|---|
| 8 | Athan Zhang | Cofounder & CEO | Copperlane | copperlane.ai | founders@copperlane.ai |

## Why This Is Better Than A Generic Funding Trigger

The real signal is not the $4.1M seed round. The useful signal is the shape of the workflow they describe publicly:

- Borrowers upload wrong or incomplete documents almost every loan.
- Penny reviews bank statements, finds issues like large deposits, requests clarification, and generates Letters of Explanation before underwriting.
- Their own blog says document review can take loan officers up to four hours and that Penny is meant to compress that into minutes.
- They are explicitly keeping humans in the loop, which means evals, source trails, exception routing, and governance will matter as much as extraction.

This makes the contract angle:

> Do not pitch "I can build mortgage AI." Pitch "I can help harden the document verification, evals, and handoff layer behind Penny."

## Sources

- https://www.ycombinator.com/companies/copperlane
- https://www.ycombinator.com/launches/Pbl-copperlane-ai-native-mortgage-loan-origination
- https://www.copperlane.ai/blog/copperlane-seed-raise
- https://www.housingwire.com/articles/copperlane-founders-penny-ai/

## Email

**To:** founders@copperlane.ai  
**Preferred Clay enrichment:** Athan Zhang or Brianna Lin individual email  
**Subject:** Penny's messy middle

Hi Athan,

The interesting Copperlane problem does not look like "read the PDF" to me. It looks like the messy middle after Penny spots a bank-statement issue, asks for borrower context, drafts an LOE, and still has to prove to a loan officer or underwriter why the file is safe to move forward.

I build contract AI infra for regulated workflows in Python/FastAPI/LangGraph, and the bit I could help with is a fail-closed review layer: source-linked fields, contradiction checks across borrower docs, evals for bad handoffs, and clean audit trails for the human-in-the-loop moments.

Not trying to pitch you generic mortgage AI. Copperlane already has the product. If a 2-3 week sprint around doc verification/evals would unblock the team, I can send a one-page schema.

Best,  
Sandeep

## Next Move

Use Clay to enrich Athan and Brianna individually. If Clay does not find a strong individual email, use `founders@copperlane.ai` because YC publicly lists it in the launch post.
