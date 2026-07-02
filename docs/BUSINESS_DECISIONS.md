# Business Decisions

This document records the important product and strategy decisions made during the cleanup from old prototype to local-first Anaya.

## Decision 1: Reposition As A Private Local Legal Workspace

Decision:

Anaya should be presented as a focused private legal reading workspace, not as a general SaaS dashboard or proof-of-work artifact.

Why:

- The old project had mixed messages: cloud auth, Firebase persistence, pricing, referrals, and privacy claims all coexisted.
- The strongest wedge is easier to explain: upload a legal document, get a private local workspace, export what you need.
- A narrower promise is easier to trust and easier to ship.

Implications:

- No account wall.
- No pricing page.
- No referral system.
- No membership or credit UI.
- No cloud session persistence.
- Exports become the sharing and retention mechanism.

## Decision 2: Local-First, Not Fully Offline

Decision:

Use local browser storage for sessions, but keep server-routed OpenAI calls for summarization and chat.

Why:

- Fully offline legal AI would require local model packaging, model selection, GPU/CPU constraints, and a much larger implementation.
- The immediate product value is privacy-respecting workflow cleanup, not offline inference.
- A server AI boundary removes browser API key exposure while preserving speed of iteration.

Honest claim:

Anaya is local-first. It is not fully offline. Document-derived text is sent to OpenAI when the user asks for summaries or chat.

## Decision 3: Replace Cloud Sharing With Export

Decision:

Remove cloud sharing and make export the primary way to take work out of Anaya.

Why:

- Sharing requires identity, access control, invitation state, revocation, and audit trails.
- The existing share implementation did not match the current local/private model.
- Export is simpler, safer, and better aligned with lawyers and operators who move work into existing systems.

Exports supported:

- Summary PDF.
- Summary Markdown.
- Summary TXT.
- Chat Markdown.
- Chat TXT.

## Decision 4: Remove Firebase And Firestore

Decision:

Remove Firebase client initialization, auth stores, Firestore data helpers, and anonymous migration logic.

Why:

- Browser Firestore writes contradicted the privacy promise.
- Firestore rules were not versioned in the repo.
- Session ID access created a potential authorization risk if production rules were permissive.
- The current product does not need accounts or cloud storage to deliver value.

What changed:

- Sessions now use `src/lib/local-session.ts`.
- Auth modals and auth stores were removed.
- Pricing, referral, join, and evangelist routes were removed.
- The old anonymous session migration document was replaced with local-private migration notes.

## Decision 5: Remove Spreadsheet Upload Support

Decision:

Disable spreadsheet parsing and remove the spreadsheet parser dependency.

Why:

- Spreadsheet upload was not core to the legal reading wedge.
- The old direct parser added security and dependency risk.
- PDF, DOCX, images, TXT, and Markdown cover the current use case better.

Future condition for reintroducing:

Spreadsheet parsing should only return if there is a clear user need, a maintained parser choice, isolated parsing, and tests around malformed files.

## Decision 6: Shrink The Dependency And Route Surface

Decision:

Delete unreachable product surfaces, unused UI primitives, and unused dependencies.

Why:

- Old code made the project harder to reason about.
- Unused dependencies create audit and supply-chain surface.
- Smaller route and package surface makes the app easier to position, maintain, and verify.

Evidence:

- Removed 97 unused packages in the latest cleanup.
- Build route table now only includes home, session, and AI API routes.
- `npm audit --omit=dev` reports 0 vulnerabilities.

## Decision 7: Build Gate Must Be Real

Decision:

Builds should fail on TypeScript and lint failures.

Why:

- The old build config ignored TypeScript and ESLint failures.
- A legal-document product needs boring reliability.
- Broken worker code and stale JSX files should not silently pass production builds.

Current gates:

- `npm run lint`
- `npm run typecheck`
- `npm audit --omit=dev`
- `npm run build`

## Decision 8: Monetization Later, Trust First

Decision:

Do not add monetization mechanics yet.

Why:

- The app first needs a credible trust story.
- A privacy-first legal tool should not reopen account, payment, tracking, and retention questions too early.
- The better sequencing is: working local tool, clear privacy boundary, export value, then pricing exploration.

Likely future pricing directions:

- Desktop/local pro tool.
- Bring-your-own-key professional mode.
- Private hosted workspace with explicit retention controls.
- Document-review workflow packs for specific legal use cases.

## Decision 9: Keep Scope Narrow Until The Wedge Is Proven

Decision:

Hold scope around document ingestion, legal summary, grounded chat, and export.

Why:

- This creates a clean product promise.
- It avoids drifting back into generic SaaS.
- It makes QA and security review tractable.

Out of scope for now:

- Teams.
- Billing.
- Referrals.
- Multi-device sync.
- Hosted document storage.
- Cloud sharing.
- Enterprise admin controls.

## Decision 10: Documentation Becomes Part Of The Product

Decision:

Document the architecture, privacy model, technical implementation, and business choices in the repo.

Why:

- The repo had stale docs from the old Firebase/Firebase Studio era.
- Future work needs a clear memory of what was intentionally removed.
- Positioning and architecture are now linked: the product promise depends on the technical shape.

## Decision 11: First US Monetization Wedge Is ClaimBrief

Decision:

Use the current Anaya engine to test a narrow US property-insurance claim packet workflow called ClaimBrief.

Why:

- Generic legal AI is too broad and crowded.
- Public adjusters and restoration operators already handle expensive document-heavy claims.
- The buyer is reachable through directories, state associations, Google Maps, and LinkedIn.
- Existing Anaya capabilities map well to the first artifact: ingest documents, summarize, cite, chat, and export.

Initial offer:

- Free sample brief from one old closed or redacted claim packet.
- $99 for 3 claim briefs.
- $299/month for up to 20 briefs.
- White-label setup after a paid pilot.

Boundaries:

- No carrier contact.
- No claim submission.
- No legal advice.
- No public-adjusting services.
- No settlement recommendation.

The goal is fast paid validation through cold outreach, not a full SaaS build.

## Decision 12: Use Concierge Payment Links Before Billing Infrastructure

Decision:

The ClaimBrief page should convert cold outreach into a free sample request or a paid pilot through email, manual invoice instructions, and configurable payment links, not a full self-serve billing system.

Why:

- The fastest path to money is one real packet, one useful output, then a small paid batch.
- Billing accounts, subscriptions, and team workspaces would slow down validation.
- Stripe or equivalent payment links can be swapped in through public env vars without changing code.
- If a payment link is missing, the page falls back to a manual-invoice email ask so no CTA becomes dead.

Config:

- `NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL`
- `NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL`
- `NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL`
- `NEXT_PUBLIC_CLAIMBRIEF_WHITELABEL_URL`

## Decision 13: Sell A Manual Pilot Before A Platform

Decision:

Add a paid-pilot scope page at `/claimbrief/pilot`, but keep the product promise
manual and concierge until a stranger sends a real packet or pays.

Why:

- There is no existing audience, case-study base, payments motion, or support
  workflow to justify platform language.
- A clear pilot page answers price questions without pretending the SaaS is
  already mature.
- The first commercial proof should be one useful sample, then one $99 starter
  batch or one $299/month pilot.
- Missing checkout links should not block selling; fallback email CTAs keep the
  motion manual and honest.

Operational rule:

Do not build account billing, upload portals, or team dashboards until at least
one prospect sends a real packet or pays for the starter batch.
