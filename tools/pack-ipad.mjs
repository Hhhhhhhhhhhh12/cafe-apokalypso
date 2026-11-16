import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const iosDir = path.join(root, "ios");
const webDir = path.join(iosDir, "Web");
const lockDir = path.join(iosDir, ".web-pack-lock");
const previousDir = path.join(lockDir, "previous-Web");
const buildInfoFile = "build-info.json";
const licenseFile = "THIRD_PARTY_LICENSES.md";
const packageLock = path.join(root, "package-lock.json");
const offlinePackages = ["react", "react-dom", "scheduler", "vite", "@vitejs/plugin-react", "rolldown"];
const offlinePolicy = [
  "default-src 'none'",
  "script-src cafe-offline:",
  "style-src cafe-offline: 'unsafe-inline'",
  "img-src cafe-offline: data:",
  "font-src cafe-offline: data:",
  "media-src cafe-offline: data:",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join("; ");
const offlinePolicyTag = `<meta http-equiv="Content-Security-Policy" content="${offlinePolicy}">`;
const entryHead = /<head>\s*<meta charset="UTF-8"\s*\/?>\s*/i;

function sourceVersion() {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  return {
    commit: git("rev-parse", "HEAD"),
    dirty: Boolean(git("status", "--porcelain", "--untracked-files=normal"))
  };
}

async function checkOfflineDependencies(lockfile) {
  const lockedPackages = JSON.parse(lockfile).packages;
  const mismatches = [];
  for (const name of offlinePackages) {
    const packagePath = `node_modules/${name}`;
    const expected = lockedPackages?.[packagePath]?.version;
    const installed = await readFile(path.join(root, packagePath, "package.json"), "utf8").catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    const version = installed ? JSON.parse(installed).version : null;
    if (!expected || expected !== version) {
      mismatches.push(`${name}: expected ${expected ?? "a locked version"}, found ${version ?? "no installation"}`);
    }
  }
  if (mismatches.length) {
    throw new Error(`Offline dependencies do not match package-lock.json. Run npm ci in the release checkout.\n${mismatches.join("\n")}`);
  }
}

async function listBundleFiles(folder, relative = "") {
  const entries = await readdir(path.join(folder, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resource = path.posix.join(relative, entry.name);
    if (resource === buildInfoFile) continue;
    if (entry.isDirectory()) {
      files.push(...await listBundleFiles(folder, resource));
    } else if (entry.isFile()) {
      files.push(resource);
    } else {
      throw new Error(`Unsupported offline resource: ${resource}`);
    }
  }
  return files.sort();
}

async function hashBundleFile(folder, resource) {
  const bytes = await readFile(path.join(folder, resource));
  if (bytes.length === 0) throw new Error(`Empty offline resource: ${resource}`);
  return createHash("sha256").update(bytes).digest("hex");
}

async function recordBundleFiles(folder) {
  const files = await listBundleFiles(folder);
  const hashes = Object.create(null);
  for (const resource of files) {
    hashes[resource] = await hashBundleFile(folder, resource);
  }
  return hashes;
}

async function checkBundleFiles(folder, hashes) {
  if (!hashes || typeof hashes !== "object" || Array.isArray(hashes) || !Object.hasOwn(hashes, "index.html")) {
    throw new Error("The offline file inventory is missing. Repack from the candidate commit.");
  }
  if (!Object.hasOwn(hashes, licenseFile)) {
    throw new Error(`The offline file inventory is missing ${licenseFile}. Repack from the candidate commit.`);
  }

  const remaining = new Set(Object.keys(hashes));
  for (const resource of await listBundleFiles(folder)) {
    if (!remaining.delete(resource)) throw new Error(`Unexpected offline resource: ${resource}`);
    if (await hashBundleFile(folder, resource) !== hashes[resource]) {
      throw new Error(`Changed offline resource: ${resource}`);
    }
  }
  if (remaining.size > 0) throw new Error(`Missing offline resources: ${[...remaining].join(", ")}`);
}

async function checkBundle(folder) {
  const info = await readFile(path.join(folder, buildInfoFile), "utf8").catch((error) => {
    if (error.code !== "ENOENT") throw error;
    throw new Error(`Offline build information is missing in ${folder}. Run node tools/pack-ipad.mjs before building the app.`);
  });
  const packaged = JSON.parse(info);
  const current = sourceVersion();
  if (packaged.commit !== current.commit || packaged.dirty !== false || current.dirty) {
    throw new Error("The offline bundle does not match this clean checkout. Repack from the candidate commit.");
  }
  if (packaged.lockfileSha256 !== await hashBundleFile(root, "package-lock.json")) {
    throw new Error("The offline bundle does not match the dependency lockfile. Repack from the candidate commit.");
  }

  await checkBundleFiles(folder, packaged.files);
  await checkBundleEntry(folder);
  console.log(`Offline web bundle verified for ${packaged.commit} (${Object.keys(packaged.files).length} files)`);
}

async function checkBundleEntry(folder) {
  const html = await readFile(path.join(folder, "index.html"), "utf8");
  const head = html.match(entryHead);
  if (!head || !html.startsWith(offlinePolicyTag, head.index + head[0].length)) {
    throw new Error("The offline entry is missing its resource policy before the game resources.");
  }
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)];
  const links = [...html.matchAll(/<link\b[^>]*>/gi)];
  const styles = links.filter(([tag]) => /\srel\s*=\s*(?:"[^"]*\bstylesheet\b[^"]*"|'[^']*\bstylesheet\b[^']*'|stylesheet(?=\s|>))/i.test(tag));
  const script = scripts[0]?.[0].match(/^<script defer src="(\.\/assets\/[\w.-]+\.js)">$/);
  const styleResources = styles.map(([tag]) => tag.match(/^<link rel="stylesheet" href="(\.\/assets\/[\w.-]+\.css)">$/)?.[1]);
  if (scripts.length !== 1 || !script || !styleResources.length || styleResources.some((resource) => !resource)) {
    throw new Error("The offline entry needs one bundled script and at least one bundled stylesheet.");
  }
  const entryResources = [script[1], ...styleResources];
  for (const resource of [...entryResources, licenseFile]) {
    const file = await stat(path.join(folder, resource)).catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    if (!file?.isFile() || file.size === 0) {
      throw new Error(`Missing offline resource: ${resource}`);
    }
  }
}

async function checkAppInfo(appDir) {
  const info = JSON.parse(execFileSync("/usr/bin/plutil", [
    "-convert", "json", "-o", "-", path.join(appDir, "Info.plist")
  ], { encoding: "utf8" }));
  const executable = info.CFBundleExecutable;
  if (info.CFBundlePackageType !== "APPL" ||
      typeof executable !== "string" || !executable ||
      executable !== path.basename(executable)) {
    throw new Error("The built bundle is missing its iPad app executable declaration.");
  }
  const binary = await stat(path.join(appDir, executable)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return null;
  });
  if (!binary?.isFile() || binary.size === 0) {
    throw new Error(`The built iPad app is missing its executable: ${executable}`);
  }
  const version = info.CFBundleShortVersionString;
  const build = info.CFBundleVersion;
  if (typeof version !== "string" || !version.trim() || typeof build !== "string" || !build.trim()) {
    throw new Error("The built iPad app must have an app version and a build number.");
  }
  const launchScreenKeys = ["UILaunchScreen", "UILaunchScreens", "UILaunchStoryboardName", "UILaunchStoryboards"];
  if (!launchScreenKeys.some((key) => Object.hasOwn(info, key))) {
    throw new Error("The built iPad app is missing its launch screen configuration.");
  }
  if (!Array.isArray(info.UIDeviceFamily) || info.UIDeviceFamily.length !== 1 || info.UIDeviceFamily[0] !== 2) {
    throw new Error("The built app must target the iPad device family.");
  }
  if (info.UIApplicationSceneManifest?.UIApplicationSupportsMultipleScenes !== false) {
    throw new Error("The built iPad app must declare single-window support for its local save.");
  }
  return { version, build };
}

const args = process.argv.slice(2);
if (args.length === 0) {
  await packBundle();
} else if (args.length === 1 && args[0] === "--check") {
  await checkBundle(webDir);
} else if (args.length === 2 && args[0] === "--check-app" && args[1].endsWith(".app")) {
  const appDir = path.resolve(args[1]);
  const { version, build } = await checkAppInfo(appDir);
  await checkBundle(path.join(appDir, "Web"));
  console.log(`iPad app version ${version} (build ${build})`);
} else {
  throw new Error("Usage: node tools/pack-ipad.mjs [--check | --check-app /path/to/CafeApokalypso.app]");
}

async function packBundle() {
  const lockfile = await readFile(packageLock);
  await checkOfflineDependencies(lockfile);
  const lockfileSha256 = createHash("sha256").update(lockfile).digest("hex");
  const [{ default: react }, { build }] = await Promise.all([
    import("@vitejs/plugin-react"),
    import("vite")
  ]);
  try {
    await mkdir(lockDir);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    throw new Error("An iPad packaging run is active or was interrupted. See ios/README.md before retrying.", { cause: error });
  }

  let stagingDir;
  let keepBackup = false;
  try {
    const source = sourceVersion();
    stagingDir = await mkdtemp(path.join(iosDir, ".web-build-"));
    await build({
      configFile: false,
      root,
      base: "./",
      publicDir: false,
      plugins: [react()],
      build: {
        outDir: stagingDir,
        target: "safari17",
        modulePreload: false,
        cssCodeSplit: false,
        license: { fileName: licenseFile },
        rolldownOptions: { output: { format: "iife" } }
      }
    });

    const entry = path.join(stagingDir, "index.html");
    const html = await readFile(entry, "utf8");
    // A classic script avoids module fetch restrictions on the local WebKit scheme.
    const moduleScript = /<script type="module" crossorigin src="(\.\/assets\/[^"]+)"><\/script>/g;
    if ([...html.matchAll(moduleScript)].length !== 1) {
      throw new Error("Expected a single relative script in the offline web bundle");
    }
    const offlineHtml = html
      .replace(entryHead, (head) => `${head}${offlinePolicyTag}\n    `)
      .replace(moduleScript, '<script defer src="$1"></script>');
    await writeFile(entry, offlineHtml.replace(/ crossorigin(?=[\s>])/g, ""), "utf8");

    await checkBundleEntry(stagingDir);
    const files = await recordBundleFiles(stagingDir);
    await writeFile(path.join(stagingDir, buildInfoFile), JSON.stringify({ ...source, lockfileSha256, files }, null, 2) + "\n", "utf8");

    const afterBuild = sourceVersion();
    if (source.commit !== afterBuild.commit || source.dirty !== afterBuild.dirty ||
        lockfileSha256 !== await hashBundleFile(root, "package-lock.json")) {
      throw new Error("The checkout changed during packaging. Repack from a stable checkout.");
    }

    let hasPrevious = false;
    try {
      await rename(webDir, previousDir);
      hasPrevious = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    try {
      await rename(stagingDir, webDir);
    } catch (error) {
      if (hasPrevious) {
        try {
          await rename(previousDir, webDir);
        } catch (restoreError) {
          keepBackup = true;
          throw new AggregateError(
            [error, restoreError],
            "Could not install or restore the offline bundle. The previous bundle is in ios/.web-pack-lock/previous-Web.",
            { cause: restoreError }
          );
        }
      }
      throw error;
    }
  } finally {
    try {
      if (stagingDir) await rm(stagingDir, { recursive: true, force: true });
    } finally {
      if (!keepBackup) await rm(lockDir, { recursive: true, force: true });
    }
  }
}
