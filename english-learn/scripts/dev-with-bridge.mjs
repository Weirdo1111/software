import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const bridgeHost = process.env.ROLEPLAY_BRIDGE_HOST || "127.0.0.1";
const bridgePort = process.env.ROLEPLAY_BRIDGE_PORT || "8877";
const pythonLauncher = process.env.PYTHON_LAUNCHER || "py";
const pythonVersionArg = process.env.PYTHON_VERSION_ARG || "-3";

function loadEnvFile(filename) {
  const filePath = path.join(rootDir, filename);
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValueParts] = line.split("=");
    const key = rawKey.trim();
    if (!key || process.env[key]) {
      continue;
    }

    const value = rawValueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

function resolveNextCommand() {
  return {
    command: process.execPath,
    args: [path.join(rootDir, "node_modules", "next", "dist", "bin", "next"), "dev", "--webpack"],
  };
}

function startProcess(command, args, label) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
  });

  return child;
}

async function runPythonCheck() {
  return new Promise((resolve) => {
    const check = spawn(
      pythonLauncher,
      [pythonVersionArg, "-c", "import websockets"],
      {
        cwd: rootDir,
        stdio: "ignore",
        env: process.env,
      },
    );

    check.on("exit", (code) => resolve(code === 0));
    check.on("error", () => resolve(false));
  });
}

function terminate(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGTERM");
}

async function main() {
  loadEnvFile(".env");
  loadEnvFile(".env.development");
  loadEnvFile(".env.local");

  const hasBridgeDeps = await runPythonCheck();
  if (!hasBridgeDeps) {
    console.error(
      "[bridge] Python or the `websockets` package is missing. Run `npm run roleplay:bridge:setup` once, then retry `npm run dev`.",
    );
    process.exit(1);
  }

  const requiredBridgeKeys = ["ROLEPLAY_DIALOG_APP_ID", "ROLEPLAY_DIALOG_ACCESS_KEY", "ROLEPLAY_DIALOG_APP_KEY"];
  const missingBridgeKeys = requiredBridgeKeys.filter((key) => !process.env[key]?.trim());
  if (missingBridgeKeys.length > 0) {
    console.warn(
      `[bridge] Missing realtime bridge env vars: ${missingBridgeKeys.join(", ")}. Connect will fail until they are provided in .env or .env.local on this machine.`,
    );
  }

  const bridge = startProcess(
    pythonLauncher,
    [pythonVersionArg, "scripts/roleplay_realtime_bridge.py", "--host", bridgeHost, "--port", bridgePort],
    "bridge",
  );
  const nextCommand = resolveNextCommand();
  const next = startProcess(nextCommand.command, nextCommand.args, "next");

  const shutdown = () => {
    terminate(next);
    terminate(bridge);
  };

  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });

  next.on("exit", (code) => {
    terminate(bridge);
    process.exit(code ?? 0);
  });

  bridge.on("exit", (code) => {
    if (!next.killed && next.exitCode === null) {
      console.warn(`[bridge] exited with code ${code ?? 0}. Realtime Connect will stop working until it is restarted.`);
    }
  });
}

void main();
