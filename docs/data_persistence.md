# Data Persistence Methods

This document describes the four distinct persistence layers used by the app, their purposes, and the risks or gaps in each.

---

## 1. `localStorage` — Client-side user preferences

The most heavily used store. Keys are scattered across components and slices rather than namespaced behind a central abstraction.

| Key | Set in | Purpose |
|-----|--------|---------|
| `activePage`, `activeAya` | `Pager/Pager.tsx` | Last-read page and verse |
| `activeTab` | `Modal/QIndex.tsx` | QIndex active tab |
| `theme` | `Modal/Settings.tsx` | Dark/Default theme |
| `lang` | `settingsSlice.ts` | UI language |
| `reciter`, `reciters_ayaAudio` | `settingsSlice.ts` | Preferred reciter + custom order |
| `zoom` | `layoutSlice.ts` | Page zoom level |
| `testMode` | `settingsSlice.ts` | Exercise test mode |
| `followPlayer`, `repeat` | `AudioSettings.tsx`, `PlayPrompt.tsx` | Audio playback options |
| `exerciseLevel`, `exerciseMemorized`, `randomAutoRecite` | `ExerciseSettings.tsx` | Exercise config |
| `tafseer` | `Modal/Tafseer.tsx` | Selected tafseer |
| `resultsDefaultButton` | `Modal/Exercise.tsx` | Post-exercise default action |
| `searchTreeView`, `LastSearch`, `SearchHistory` | `Modal/Search.tsx` | Search state |
| `dev` | `services/analytics.ts` | Dev-mode flag |

### Pattern

Writes are fire-and-forget:

```ts
localStorage.setItem("theme", theme_name);
```

Reads use a small typed helper in `services/utils.ts:218` (`getStorageItem`) that casts by `typeof defaultValue`, but most callers bypass it and read directly with no type coercion:

```ts
localStorage.getItem("activePage");
```

### Gap

No IndexedDB, no `redux-persist`, and no central storage abstraction. Every component manages its own keys.

---

## 2. Redux `dbSlice` — In-memory user data, synced to Firebase

`src/store/dbSlice.ts` holds four pieces of user state:

- `user` — Firebase auth profile
- `bookmarks` — `aya_marks`
- `hifzRanges` — memorization ranges
- `daily` — activity log

A local plain-JS cache (`suraRanges` at `dbSlice.ts:77`) avoids redundant slice lookups for range-based queries.

### Flow

Live Firebase Realtime Database listeners in `useInitApp.ts` populate the slice on login:

```
userRef.child(`data/${user.uid}`)
  ├── aya_marks     → setBookmarks
  ├── hifz          → setHifzRanges
  └── activity      → setActivities
```

Writes (bookmarks, hifz ranges, activity logs) are Redux thunks that call `firebase.app().database().ref()` directly and rely on the listeners to reflect the server's response back into the slice.

### Gap

No offline queue or retry logic. If the network drops, writes go to Firebase and silently fail.

---

## 3. Firebase Realtime Database — Cloud source of truth

Auth and all user progress data live in Firebase v7. The config is hardcoded in `src/App.tsx`, not loaded from env files.

User data tree:

```
data/{uid}/
  aya_marks
  hifz
  activity
  settings/aiAgent
```

`onAuthStateChanged` drives the whole flow: when logged in, listeners attach; on sign-out, the `signOut` thunk clears Redux and calls `firebase.auth().signOut()`.

---

## 4. Service Worker (`public/sw.js`) — Offline asset caching

A custom service worker (not `vite-plugin-pwa`) with two named caches:

- `app.v48` — Vite-built JS and CSS, sourced from `app-manifest.json`
- `assets.v1` — static public assets, sourced from `public-manifest.json`

Strategy is **cache-first** for navigations and subresource requests; `putInCache` tracks non-GET requests. Old caches are purged on `activate`.

`sw-registration.js` gates on `VITE_ENABLE_SW` (false in dev, true in prod per `vite.config.ts`), so caching only activates in production.

---

## Overall diagram

```
User action
  ├─ UI preferences ──► localStorage (no central schema)
  ├─ Bookmarks/Hifz ──► Redux (dbSlice) ──► Firebase Realtime DB
  │                                                      ▲
  │                                              listeners
  │                                              (useInitApp.ts)
  ├─ Quran text data  ──► bundled JSON imports (static, no runtime fetch)
  └─ Audio URLs       ──► derived from static reciters config
```

## Key takeaways

- Preferences are stored in `localStorage` under ad-hoc keys with no shared abstraction.
- User progress (bookmarks, hifz ranges, activity) syncs live to Firebase via Redux thunks and Realtime Database listeners, with no offline queue.
- Quran text data is bundled as static JSON imports; there is no runtime fetch or caching layer for it.
- Assets are cached cache-first by the service worker in production only.
