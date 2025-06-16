// browserslist.js
// This file is used by Vite to respect the browserslist configuration from package.json
// It re-exports the browserslist configuration

// Get the browserslist config from package.json
const browserslist = require("browserslist");
const pkg = require("./package.json");

// Get current environment
const isDevelopment = import.meta.env.NODE_ENV === "development";

// Determine which config to use
const config = isDevelopment
    ? pkg.browserslist.development
    : pkg.browserslist.production;

// Export as module
module.exports = { config, browserslist: browserslist(config) };
