#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const run = (file, args) =>
  execFileSync(file, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const result = {
  platform: process.platform,
  ready: false,
  captureSource: "VoiceOver last phrase (AppleScript)",
  checks: {},
  blockers: [],
};

if (process.platform !== "darwin") {
  result.blockers.push("VoiceOver evidence capture requires a physical or remote macOS session.");
} else {
  result.checks.operatingSystem = "macOS";
  try {
    const version = run("/usr/bin/sw_vers", ["-productVersion"]);
    const build = run("/usr/bin/sw_vers", ["-buildVersion"]);
    result.checks.operatingSystemVersion = `${version} (${build})`;
  } catch {
    result.blockers.push("macOS product/build version could not be read.");
  }
  try {
    result.checks.safariVersion = run("/usr/bin/mdls", [
      "-raw",
      "-name",
      "kMDItemVersion",
      "/Applications/Safari.app",
    ]);
  } catch {
    result.blockers.push("Safari is not available at /Applications/Safari.app.");
  }
  try {
    result.checks.voiceOverVersion = run("/usr/bin/defaults", [
      "read",
      "/System/Library/CoreServices/VoiceOver.app/Contents/Info",
      "CFBundleShortVersionString",
    ]);
  } catch {
    result.blockers.push("VoiceOver version could not be read.");
  }
  try {
    run("/usr/bin/pgrep", ["-f", "/VoiceOver.app/Contents/MacOS/VoiceOver"]);
    result.checks.voiceOverRunning = true;
  } catch {
    result.checks.voiceOverRunning = false;
    result.blockers.push(
      "VoiceOver is not running. Start it with Command-F5, then rerun this check.",
    );
  }
  if (result.checks.voiceOverRunning) {
    try {
      result.checks.lastPhrase = run("/usr/bin/osascript", [
        "-e",
        'tell application "VoiceOver" to get content of last phrase',
      ]);
      result.checks.appleScriptCapture = true;
    } catch (error) {
      result.checks.appleScriptCapture = false;
      result.checks.appleScriptError = String(error.stderr || error.message).trim();
      result.blockers.push(
        "VoiceOver AppleScript control is unavailable. In VoiceOver Utility > General, enable ‘Allow VoiceOver to be controlled with AppleScript’, interact with Safari once, then rerun this check.",
      );
    }
  }
}

result.ready = result.blockers.length === 0 && result.checks.appleScriptCapture === true;
console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;
