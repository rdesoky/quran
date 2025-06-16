# Migrating from Create React App (CRA) to Vite

This project has been migrated from Create React App to Vite for faster development and build times.

## Development

```bash
# Start the development server
yarn start
```

## Production Build

```bash
# Build for production
yarn build

# Preview the production build locally
yarn preview
```

## Notes on the Migration

-   Environment variables now use `VITE_` prefix instead of `REACT_APP_` prefix
-   The service worker setup has been updated to work with Vite
-   The build output directory is still `build` for compatibility with existing deployment scripts
-   TypeScript configuration has been updated to work with Vite

## Troubleshooting

If you encounter any issues with the migration:

1. Ensure all dependencies are correctly installed: `yarn install`
2. Clear the build cache: `rm -rf node_modules/.vite`
3. Check for any environment variable references that might need updating from `import.meta.env.REACT_APP_*` to `import.meta.env.VITE_*`
