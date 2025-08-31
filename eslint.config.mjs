import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";

export default [
	{
		ignores: [
			"dist",
			"build",
			"node_modules",
			"*.config.js",
			"*.config.ts",
		],
	},
	{
		files: ["**/*.{ts,tsx,js}"],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.es2020,
			},
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			"@typescript-eslint": tseslint,
		},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...react.configs["jsx-runtime"].rules,
			...reactHooks.configs.recommended.rules,
			...tseslint.configs.recommended.rules,

			// React specific rules
			"react/react-in-jsx-scope": "off", // Not needed with React 17+
			"react/prop-types": "off", // TypeScript handles prop validation
			"react/jsx-uses-react": "off", // Not needed with React 17+
			"react/jsx-uses-vars": "error",
			"react/jsx-key": "error",
			"react/no-unescaped-entities": "warn",

			// TypeScript specific rules
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					"args": "all",
					"argsIgnorePattern": "^_",
					"caughtErrors": "all",
					"caughtErrorsIgnorePattern": "^_",
					"destructuredArrayIgnorePattern": "^_",
					"varsIgnorePattern": "^_",
					"ignoreRestSiblings": true
				},
			],
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-non-null-assertion": "warn",
			"no-undef": "off", // TypeScript handles undefined variables

			// React Hooks rules
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			// React Refresh rules
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],

			// General best practices
			// "no-console": "warn",
			"no-debugger": "warn",
			"no-var": "error",
			"prefer-const": "warn",
			"no-unused-expressions": "error",
			eqeqeq: ["error", "always"],
			curly: ["error", "all"],

			// Import/Export rules
			"no-duplicate-imports": "error",
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
];
