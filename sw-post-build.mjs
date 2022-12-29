//Injecting timestamp into the service worker file
//Injecting pre-cached public assets
import fs from "fs";
import path from "path";

const swSrcPath = path.join("src", "sw.js");
const swContent = fs.readFileSync(swSrcPath, { encoding: "utf8" });
const swBuildPath = path.join("build", "sw.js");
fs.writeFileSync(
    swBuildPath,
    `//${Date().toString()}
${swContent}`
);
