import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			react(),
			svgr(),
			tsconfigPaths(),
			VitePWA({
				registerType: "autoUpdate",
				// Include public assets that need to be available offline
				includeAssets: [
					"favicon.ico",
					"robots.txt",
					"images/**/*",
					"pg_map/**/*",
					"translation/**/*",
					"db/**/*",
				],
				// Use the custom service worker file instead of generating one
				injectRegister: null,
				strategies: "injectManifest",
				injectManifest: {
					injectionPoint: undefined,
					swSrc: "./public/sw.js",
					swDest: "./build/sw.js",
					// Customize as needed
					globDirectory: "./build",
					globPatterns: [
						"**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,txt}",
					],
				},
				manifest: {
					name: "Quran Hafiz",
					short_name: "Hafiz",
					description:
						"Quran Application with multiple translations and reciters",
					theme_color: "#ffffff",
					start_url: "/",
					display: "standalone",
					background_color: "#ffffff",
					icons: [
						{
							src: "/images/quran_hafiz.png",
							sizes: "192x192",
							type: "image/png",
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src"),
			},
		},
		build: {
			manifest: true, // Generate a manifest file
			outDir: "build", // To maintain compatibility with existing setup
			emptyOutDir: true,
			sourcemap: true,
			chunkSizeWarningLimit: 1600,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom", "react-redux"],
						firebase: ["firebase", "react-firebaseui"],
					},
				},
			},
		},
		css: {
			devSourcemap: true, // Enable CSS sourcemaps in development
		},
		server: {
			port: 3000, // Match CRA default port
			// open: true,
			host: true,
		},
		// define: {
		//     // Handle process.env for compatibility with CRA
		//     "process.env": {
		//         ...env,
		//         NODE_ENV: JSON.stringify(mode),
		//         PUBLIC_URL: JSON.stringify(env.PUBLIC_URL || ""),
		//     },
		// },
		envPrefix: ["VITE_", "PUBLIC_"],
		base: env.PUBLIC_URL || "/",
	};
});
