# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Quran Hafiz is a Progressive Web Application (PWA) for reading, memorizing, and studying the Quran. It's a React/TypeScript application that supports multilingual interfaces (Arabic/English) and provides features for Quranic memorization tracking, audio recitation, verse exercise, and bookmarking.

## Essential Development Commands

### Building & Running
- **Development server**: `yarn start` (runs on http://localhost:3000)
- **Production build**: `yarn build` (outputs to `build/` directory)
- **Preview production**: `yarn preview`
- **Service worker setup**: `yarn sw-setup` (run after build to configure SW)

### Code Quality & Linting
- **TypeScript check**: `yarn tsc_check` (type checking without emit)
- **ESLint**: `yarn lint` (lints and fixes JS/TS/JSX/TSX files in src/)
- **Bundle analysis**: `yarn analyze` (analyzes build bundle size)

### Deployment
- **Deploy to GitHub Pages**: `yarn deploy` (runs build then gh-pages deploy)
- **Pre-deploy**: `yarn predeploy` (automatically runs before deploy)

### Testing
This project currently has no test framework configured. If adding tests, consider Vitest for compatibility with Vite.

## Architecture Overview

### Technology Stack
- **Build System**: Vite (migrated from Create React App)
- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with multiple slices
- **Routing**: React Router v7
- **Styling**: SCSS with CSS Modules patterns
- **Internationalization**: React Intl with JSON translation files
- **Authentication**: Firebase Auth with FirebaseUI
- **Icons**: FontAwesome
- **PWA**: Custom service worker with Workbox for caching

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── Modal/          # Modal dialogs (Exercise, Tafseer, Settings, etc.)
│   ├── AudioPlayer/    # Audio playback components
│   ├── Page/          # Quran page rendering components
│   ├── Pager/         # Page navigation components
│   └── Sidebar/       # Application sidebar
├── store/             # Redux store configuration and slices
├── services/          # Business logic and utilities
├── hooks/             # Custom React hooks
├── data/              # Static Quran data (JSON files)
├── translations/      # i18n JSON files (ar.json, en.json)
└── @types/            # TypeScript type definitions
```

### State Management Structure
The Redux store is organized into these slices:
- **layoutSlice**: App dimensions, zoom, responsive layout
- **settingsSlice**: User preferences, theme, language, audio settings
- **dbSlice**: Hifz (memorization) ranges, bookmarks, activity tracking
- **uiSlice**: Modal state, toasts, popup management
- **navSlice**: Page navigation, verse selection, masking
- **playerSlice**: Audio playback state and controls

### Key Component Patterns
- **Modal System**: Centralized popup management through `PopupView` component
- **Audio Integration**: Custom audio service with reciter selection and range playback
- **Verse Masking**: Progressive revelation feature for memorization practice
- **Responsive Design**: Conditional rendering based on screen size via `selectIsNarrow`
- **Keyboard Shortcuts**: Extensive keyboard navigation support

### Data Architecture
- **Quran Text**: Stored in `src/data/quran.ts` with normalized versions for search
- **Verse Metadata**: Page mappings, sura info, and part divisions in JSON files
- **Audio System**: Multiple reciter support with configurable audio servers
- **Memorization Tracking**: Firebase-synced hifz ranges with revision tracking

## Important Code Patterns

### Component Structure
Components follow this pattern:
```typescript
// Hooks and selectors at top
const selector = useSelector(selectSomething);
const dispatch = useDispatch();

// Event handlers as functions
const handleClick = useCallback(() => {
    // Analytics tracking
    analytics.logEvent('action_name', { trigger: 'component_name' });
    // State updates
    dispatch(someAction());
}, [dependencies]);

// Render with internationalization
return (
    <FormattedMessage id="translation_key" />
);
```

### Analytics Integration
All user interactions should include analytics tracking:
```typescript
analytics.logEvent('event_name', {
    trigger: 'component_source',
    ...verseLocation(verse), // Include verse context when relevant
});
```

### Internationalization
Use `react-intl` for all user-facing strings:
```typescript
import { FormattedMessage as String } from 'react-intl';
// In JSX:
<String id="translation_key" values={{variable: value}} />
```

### Firebase Integration
The app uses Firebase v7 (legacy) for:
- Authentication via FirebaseUI
- Real-time database for user data sync
- Analytics for usage tracking

## Development Guidelines

### Environment Variables
- Migration from CRA to Vite changed prefix from `REACT_APP_` to `VITE_`
- Use `import.meta.env.VITE_VARIABLE_NAME` to access env vars
- Base URL configured via `import.meta.env.BASE_URL`

### Service Worker
- Custom SW implementation in `public/sw.js`
- Post-build script (`sw-post-build.mjs`) injects asset manifests
- Handles offline caching of Quran pages, audio, and translations

### Audio System
The audio system supports:
- Multiple reciters with different audio servers
- Verse-by-verse and continuous playback
- Download functionality for offline use
- Range-based recitation for memorization practice

### Responsive Considerations
- Mobile-first design with conditional desktop features
- Touch-friendly controls and gesture support
- Keyboard navigation for accessibility

### Performance Optimizations
- Manual chunk splitting for vendor and Firebase code
- Lazy loading of translation files
- Image optimization for Quran page scans
- Service worker caching strategy

## Common Development Tasks

### Adding New Components
1. Create component in appropriate `components/` subdirectory
2. Follow existing patterns for props interface and styling
3. Add analytics tracking for user interactions
4. Include internationalization for all text
5. Add keyboard shortcuts if applicable

### Modifying Quran Data
- Core text data is in `src/data/quran.ts`
- Metadata files are in `src/data/` (JSON format)
- Reciter information in `src/data/reciters.ts`

### Adding New Language
1. Create new JSON file in `src/translations/`
2. Add language option to settings
3. Update language selection logic
4. Test RTL layout if needed

### Debugging Audio Issues
- Check browser console for CORS errors
- Verify audio server availability in `src/data/reciters.ts`
- Test fallback server configurations

## Build System Notes

### Vite Configuration
- Custom alias: `@/` maps to `src/`
- TypeScript paths configured in `tsconfig.json`
- SCSS preprocessing enabled
- SVG handling via `vite-plugin-svgr`

### Output Structure
Build creates:
- `build/` directory with static assets
- `build/assets/` for JS/CSS bundles
- Service worker injected with timestamp
- Manifest files for PWA and public assets

The codebase is well-structured for a complex PWA with careful attention to performance, accessibility, and user experience. When making changes, preserve the existing patterns for state management, internationalization, and analytics tracking.
