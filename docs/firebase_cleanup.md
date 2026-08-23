# Firebase Anonymous User Cleanup

## Overview

The app uses **anonymous-first auth** (`src/useInitApp.ts` calls `signInAnonymously()`). Every visitor gets an anonymous Firebase Auth account, and their data (bookmarks, hifz, activity, settings) is stored in Realtime Database under `data/{uid}`. Over time, this accumulates many anonymous accounts — most with no data or abandoned after a week.

There is currently **no backend** (no Firebase Functions, no Admin SDK). This document describes a scheduled Cloud Function that runs daily and deletes qualifying anonymous users.

## Deletion Criteria

An anonymous user is deleted if **either** condition is true:

1. **No data** — the `data/{uid}` node in Realtime Database doesn't exist or is empty (no children).
2. **Inactive > 7 days** — `lastSignInAt` (falling back to `createdAt`) is older than 7 days.

## Identifying Anonymous Users

In the Admin SDK, anonymous users have **no providers** (`user.providerData.length === 0`). This is the reliable way to distinguish them from Google/Facebook/GitHub/Email users.

## Files to Create

### `functions/package.json`
Firebase Functions package config:
- `firebase-functions` (v2) for the scheduled trigger
- `firebase-admin` for Auth + Realtime Database access
- `node` runtime

### `functions/index.js`
The scheduled cleanup function:
- Uses `onSchedule` (pubsub cron) to run **daily**
- Lists all users with pagination (`listUsers(1000, pageToken)`)
- For each anonymous user:
  - Checks `data/{uid}` in RTDB — exists & has children?
  - Checks `lastSignInAt` (fallback `createdAt`) against a 7-day cutoff
  - Deletes the auth account (`admin.auth().deleteUser(uid)`) and the RTDB node (`data/{uid}`) if it qualifies
- Logs a summary (count deleted, errors)

### `functions/.gitignore`
Excludes `node_modules/` and any service-account key files.

## Deployment Steps

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy: `firebase deploy --only functions` (from the `functions/` dir)
4. The function will run daily on a schedule (e.g., `every day 04:00`)

## Key Considerations

- **Idempotent & safe**: Only deletes anonymous users; real users are never touched. Uses pagination to handle large user bases without memory issues.
- **Admin SDK bypasses RTDB rules**, so no rule changes are needed.
- **No impact on the client app** — the function runs server-side and doesn't require any changes to `src/`.
- **Config**: The function targets the existing `quran-hafiz` Firebase project (from `src/App.tsx`).

## Related Notes

- The `signInFailure` merge logic in `src/components/Login.tsx` has a TODO for merging anonymous data into real accounts. This cleanup function is complementary — it handles the abandoned anonymous accounts that never get upgraded.