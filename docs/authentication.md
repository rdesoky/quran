# Authentication Solution

## Overview
The app uses **Firebase Authentication** (v7 SDK) with a hybrid **anonymous-first** approach. Users start with an anonymous account, and can later sign in with Google, Facebook, GitHub, or email/password. All user-specific data is persisted in Firebase Realtime Database under `data/{uid}`.

## Firebase Initialization
- Initialized in `src/App.tsx` with a hardcoded config for the `quran-hafiz` project.
- Includes standard Firebase fields (apiKey, authDomain, databaseURL, etc.).
- Analytics is initialized but currently disabled in production.

## Anonymous-First Auth (`useInitApp.ts`)
- `firebase.auth().onAuthStateChanged` listens for auth state changes.
- If no user is present, the app immediately calls `signInAnonymously()`.
- The anonymous user’s profile (`uid`, `email`, `displayName`, `photoURL`, `isAnonymous`) is stored in Redux via `setUser`.
- All data reads/writes use this anonymous `uid` until the user signs in with a real provider.

## Login Component (`Login.tsx`)
- Uses `react-firebaseui` (`StyledFirebaseAuth`) to render a pre-built sign‑in UI.
- **Flow**: Popup (not redirect).
- **Providers**: Google, Facebook, GitHub, Email/Password.
- **`autoUpgradeAnonymousUsers: true`** – anonymous accounts are automatically upgraded when the user signs in with a real provider.

### Anonymous‑to‑Real Merge (`signInFailure` callback)
When an anonymous user tries to link a provider already associated with another account:
1. FirebaseUI triggers `signInFailure` with code `firebaseui/anonymous-upgrade-merge-conflict`.
2. The handler signs in with the new credential (`signInWithCredential`).
3. **TODO**: Merge anonymous user data (activity, aya marks, hifz, page marks) into the new account – this logic is incomplete.
4. Delete the old anonymous user’s data from Realtime Database.
5. Delete the anonymous user account.
6. Close the login UI (`onClose`).

## Data Persistence Per User (`dbSlice.ts`)
All user‑specific data lives under `data/{uid}` in Firebase Realtime Database:

| Data Type | Path |
|-----------|------|
| Bookmarks | `data/{uid}/aya_marks` |
| Hifz ranges | `data/{uid}/hifz` |
| Activity (pages & characters) | `data/{uid}/activity` |
| Settings (e.g., AI agent) | `data/{uid}/settings/aiAgent` |

Redux selectors (`selectUser`, `selectBookmarks`, `selectHifzRanges`, `selectDailyActivities`) read from the store, while thunks (`addBookmark`, `deleteBookmark`, `logTypedVerse`, `addHifzRange`, etc.) write to Firebase using the current user’s `uid`.

## Sign Out
- The `signOut` thunk calls `firebase.auth().signOut()`.
- Redux user state is not explicitly cleared; the `onAuthStateChanged` listener will receive `null` and reset the user.

## Key Observations
- **No custom backend auth** – all authentication and data storage are handled by Firebase.
- **Anonymous is default** – the app works without signing in, but data is tied to the anonymous `uid` and lost if browser data is cleared.
- **Merge logic incomplete** – the `signInFailure` handler has a TODO comment indicating that merging anonymous data into a real account is not yet implemented.
- **No dedicated auth slice** – user state lives in `dbSlice`; there is no separate `authSlice`.

## Flow Summary
```
App mounts
  → onAuthStateChanged fires (null user)
  → signInAnonymously()
  → user stored in Redux as anonymous
  → all data reads/writes use anonymous uid

User clicks Login
  → react-firebaseui popup appears
  → user signs in with Google/Facebook/GitHub/Email
  → autoUpgradeAnonymousUsers merges accounts
  → onAuthStateChanged fires with real user
  → Redux user updated, data reads/writes now use real uid
```