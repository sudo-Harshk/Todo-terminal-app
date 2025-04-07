const { spawn } = require("child_process");
const path = require("path");

module.exports = () => {
  const stopwatchPath = path.join(__dirname, "../stopwatch/stopwatch.js");

  const child = spawn("node", [stopwatchPath], {
    stdio: "inherit", 
    shell: true
  });

  child.on("exit", (code) => {
    console.log(`\n⏹️  Stopwatch exited`);
  });
};
