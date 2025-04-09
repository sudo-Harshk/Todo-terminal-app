const { spawn } = require("child_process");
const chalk = require("chalk");
const os = require("os");

function openInBrowser(url) {
  console.log("🔍 Opening browser at:", url);

  if (os.platform() === "win32") {
    // Windows: use 'start' command via cmd.exe
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } else if (os.platform() === "darwin") {
    // macOS
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  } else {
    // Linux
    spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  }

  console.log("🌐 Opened in browser:", url);
}

module.exports = openInBrowser;
