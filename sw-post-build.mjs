import fs from "fs";
import path from "path";

const swSrcPath = path.join("src", "sw.js");
const swContent = fs.readFileSync(swSrcPath, { encoding: "utf8" });
const swBuildPath = path.join("build", "sw.js");
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

const manifest = {
    files: pg_map.concat(images).concat(translation).concat(db),
};

const manifestPath = path.join("build", "public-manifest.json");
//Injecting timestamp into the service worker file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
