import fs from "fs";
import path from "path";


const swSrcPath = path.join("public", "sw.js");
const swContent = fs.readFileSync(swSrcPath, { encoding: "utf8" });
const swBuildPath = path.join("build", "sw.js");

fs.copyFileSync(path.join("build", ".vite", "manifest.json"), path.join("build", "app-manifest.json"));
//Injecting timestamp into the service worker file
fs.writeFileSync(
	swBuildPath,
	`//${Date().toString()}
${swContent}`
);

//Injecting pre-cached public assets
const pg_map = fs
	.readdirSync(path.join("public", "pg_map"))
	.map((file) => `/pg_map/${file}`);
const images = fs
	.readdirSync(path.join("public", "images"))
	.map((file) => `/images/${file}`);
const translation = fs
	.readdirSync(path.join("public", "translation"))
	.map((file) => `/translation/${file}`);
const db = fs
	.readdirSync(path.join("public", "db"))
	.map((file) => `/db/${file}`);

const assetsManifest = {
	files: pg_map.concat(images).concat(translation).concat(db),
};

const manifestPath = path.join("build", "public-manifest.json");
//Injecting timestamp into the service worker file
fs.writeFileSync(manifestPath, JSON.stringify(assetsManifest, null, 4));

const appManifestPath = path.join("build", "app-manifest.json");
const appFiles = fs.readdirSync(path.join("build","assets")).map(file => `/assets/${file}`);
appFiles.push("/sw.js", "/index.html", "/404.html");
fs.writeFileSync(appManifestPath, JSON.stringify({ files: appFiles }, null, 4));

console.log(`** Service worker built at ${swBuildPath}`);
console.log(`** Public manifest built at ${manifestPath}`);
console.log(`** App manifest built at ${appManifestPath}`);
