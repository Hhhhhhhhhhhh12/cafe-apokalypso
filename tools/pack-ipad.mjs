import { mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const iosDir = path.join(root, "ios");
const webDir = path.join(iosDir, "Web");
const stagingDir = await mkdtemp(path.join(iosDir, ".web-build-"));

try {
  await build({
    configFile: false,
    root,
    base: "./",
    plugins: [react()],
    build: {
      outDir: stagingDir,
      target: "safari17",
      modulePreload: false,
      rolldownOptions: { output: { format: "iife", inlineDynamicImports: true } }
    }
  });

  const entry = path.join(stagingDir, "index.html");
  const html = await readFile(entry, "utf8");
  // A classic script avoids module fetch restrictions on the local WebKit scheme.
  const moduleScript = /<script type="module" crossorigin src="(\.\/assets\/[^"]+)"><\/script>/g;
  if ([...html.matchAll(moduleScript)].length !== 1) {
    throw new Error("Expected a single relative script in the offline web bundle");
  }
  const offlineHtml = html.replace(moduleScript, '<script defer src="$1"></script>');
  if (/<script[^>]+type="module"/.test(offlineHtml)) {
    throw new Error("The offline web bundle still contains a module script");
  }
  await writeFile(entry, offlineHtml.replace(/ crossorigin(?=[\s>])/g, ""), "utf8");

  await rm(webDir, { recursive: true, force: true });
  await rename(stagingDir, webDir);
} finally {
  await rm(stagingDir, { recursive: true, force: true });
}
