# Local Private Migration Notes

This replaces the old anonymous-session implementation notes. The old direction stored anonymous sessions in Firestore and migrated them into authenticated accounts. That is no longer the product direction.

## Previous Direction

The older implementation attempted to support:

- Anonymous users.
- Firestore-backed anonymous sessions.
- Authenticated user migration.
- Login and signup flows.
- Cloud session recovery.

That was coherent for a hosted SaaS product, but it conflicted with the current local/private positioning.

## Current Direction

The current implementation supports:

- No account required.
- No Firebase client.
- No Firestore writes.
- No anonymous account migration.
- Local browser session index.
- Local browser session content.
- Explicit export for portability.

## Migration Summary

Removed:

- `src/lib/session-migration.ts`
- `src/lib/firebase.ts`
- `src/lib/data.ts`
- Auth modal components.
- Auth stores.
- Account, membership, pricing, referral, join, and evangelist routes.
- Firebase and React Firebase dependencies.

Added:

- `src/lib/local-session.ts`
- `src/store/settings-store.ts`
- Server AI routes under `src/app/api/ai/`
- Local export controls for summaries and chats.

## Current Storage Keys

```text
anaya-local-sessions
anaya-local-session:<sessionId>
```

Small UI state may also use localStorage, such as onboarding dismissal or greeting count.

## User Impact

Users can:

- Create sessions without login.
- Refresh and keep work in the same browser.
- Export summaries and chat transcripts.
- Delete local sessions from the home dashboard.

Users cannot:

- Recover sessions after clearing browser storage.
- Sync sessions across devices.
- Share cloud links.
- Migrate anonymous sessions to an account.

## Why This Is Acceptable

This is acceptable because the current product promise is local-first legal analysis, not cloud collaboration. Export is the intended portability path.

If account recovery or sync becomes necessary later, it should be designed as a new product mode with explicit retention, access control, and privacy language.
