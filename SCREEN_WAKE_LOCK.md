# Screen Wake Lock Implementation

This application now automatically keeps the device screen awake while the Quran Hafiz app is open and active.

## How it works

The screen wake lock feature uses the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) to prevent the device screen from turning off while reading the Quran.

## Implementation Details

### Files Added/Modified:

1. **`src/hooks/useWakeLock.ts`** - Custom React hook that manages the wake lock lifecycle
2. **`src/App.tsx`** - Integrated the wake lock hook into the main App component
3. **`src/vite-env.d.ts`** - Added TypeScript definitions for the Wake Lock API
4. **`src/index.tsx`** - Removed the basic wake lock implementation

### Features:

- ✅ **Automatic activation**: Wake lock is acquired automatically when the app loads
- ✅ **Visibility handling**: Automatically re-acquires wake lock when returning to the app
- ✅ **Browser compatibility**: Gracefully degrades in unsupported browsers
- ✅ **Error handling**: Logs warnings for unsupported browsers without breaking the app
- ✅ **Memory management**: Properly releases wake lock when app is closed
- ✅ **Re-acquisition**: Automatically re-acquires wake lock if it gets released by the system

### Browser Support:

The Screen Wake Lock API is supported in:
- Chrome/Chromium 84+
- Edge 84+
- Firefox 126+ (behind a flag)
- Safari: Not yet supported

For unsupported browsers, the app will log a warning but continue to function normally.

### Usage:

The wake lock is enabled by default for all users. When the app is open and visible:
- The screen will not automatically turn off
- When switching to another tab/app, the wake lock is released automatically
- When returning to the app, the wake lock is re-acquired automatically

### Console Messages:

You may see these helpful messages in the browser console:
- `"Screen will stay awake while using Quran Hafiz"` - Wake lock successfully acquired
- `"Screen Wake Lock acquired successfully"` - Technical confirmation
- `"Screen Wake Lock was released"` - Wake lock was released (normal behavior)
- `"Wake lock not available: [reason]"` - Browser doesn't support the feature

## Benefits for Quran Reading:

- Uninterrupted reading experience
- No need to manually touch the screen to keep it awake
- Especially helpful during longer reading sessions
- Automatic management - no user configuration needed
