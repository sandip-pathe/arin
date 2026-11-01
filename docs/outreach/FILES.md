# Finding outreach files

## ClaimBrief campaign

Start with [the first-sale runbook](claimbrief-first-sale-runbook.md). It links the campaign packets and describes the manual sending workflow. Use [the pipeline tracker](claimbrief-pipeline-tracker.csv) to record outcomes.

`generated/` contains dated contact-form drafts, email drafts, readiness reports and daily action sheets. The `.eml` files are drafts. Keeping them in Git does not send them.

The generators live in `scripts/` at the repository root. See the `outreach:claimbrief` scripts in `package.json`. Some commands write campaign files; inspect a command before rerunning it.

## Lead research and exports

The repository root contains the contract-outreach draft batches, `clay-accounts-import.csv` and `updated-leads-with-emails.csv`.

`outputs/lead_scouting_20/` contains the twenty-lead research batch, replacement research, spreadsheet builders and workbook exports. `outputs/lead_scouting_50/` contains the fifty-lead batch and its builder. The preview images and `.inspect.ndjson` files accompany the workbook exports.

A research entry or draft is not a delivery record. Review the target, current contact details and campaign readiness before sending. Keep credentials and received client packets in the existing ignored local locations.
