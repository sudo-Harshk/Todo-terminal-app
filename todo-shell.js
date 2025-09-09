#!/usr/bin/env node

const readline = require("readline");
const { spawn } = require("child_process");
const stringSimilarity = require("string-similarity");

const knownCommands = [
  "list", "dashboard", "week", "day", "add", "edit", "delete",
  "done", "undone", "search", "export", "history", "cls", "clear",
  "exit", "help", "stats", "stopwatch", "undo", "streak", "delete-all", "github", "youtube"
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "todo> ",
});

function showAnimatedIntro(callback) {
  console.clear();
  const lines = ["🌀 Starting...", "🎯 Preparing your space..."];
  let i = 0;
  const delay = 700;
  const interval = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(interval);
      console.log();
      console.log("📦 Welcome to Your Todo Terminal");
      console.log("Type 'help' to see available commands.\n");
      callback();
    } else {
      console.log(lines[i]);
      i++;
    }
  }, delay);
}

showAnimatedIntro(() => rl.prompt());

rl.on("line", (line) => {
  const input = line.trim();
  if (!input) return rl.prompt();

  const [command, ...args] = input.split(" ");

  switch (command) {
    case "help":
      console.log("\n📘 Available Commands:\n");
      const helpCommands = [
        ["list", "List tasks or filter by date"],
        ["dashboard", "Overall summary"],
        ["week", "Weekly agenda"],
        ["day --date", "Day view"],
        ["add \"<title>\" --date --time", "Add new task"],
        ["edit <id> --title --date --time", "Edit a task"],
        ["delete <id>", "Delete a task"],
        ["done <id>", "Mark as done"],
        ["undone <id>", "Mark as pending"],
        ["search <keyword>", "Search by title"],
        ["export", "Export to tasks.csv"],
        ["history", "Completed task history"],
        ["stats", "Show task statistics"],
        ["stopwatch", "Start stopwatch timer"],
        ["undo", "Undo last deleted task"],
        ["streak", "Your completion streak"],
        ["delete-all", "⚠️ Delete all tasks"],
        ["github", "Explore your GitHub repos"],
        ["cls / clear", "Clear terminal"],
        ["exit", "Exit todo shell"],
      ];
      const width = 48;
      helpCommands.forEach(([cmd, desc]) => {
        const padded = cmd.padEnd(width, " ");
        console.log(`  ${padded}→  ${desc}`);
      });
      console.log();
      break;

    case "cls":
    case "clear":
      console.clear();
      rl.prompt();
      return;

    case "exit":
      console.log("👋 Exiting todo terminal...");
      rl.close();
      return;

    default:
      const match = stringSimilarity.findBestMatch(command, knownCommands).bestMatch;
      if (!knownCommands.includes(command)) {
        console.log(`❌ Unknown command: '${command}'`);
        if (match.rating > 0.4 && match.target !== command) {
          console.log(`💡 Did you mean '${match.target}'?`);
        }
        console.log("Type 'help' to see available commands.\n");
        rl.prompt();
        return;
      }

      rl.pause();

      const child = spawn("node", ["index.js", ...input.split(" ")], {
        stdio: "inherit",
      });

      // Only show the enquirer message for GitHub
      if (command === "github") {
        console.log("Starting GitHub Explorer with enquirer");
      }

      child.on("exit", () => {
        rl.resume();
        rl.prompt();
      });

      return;
  }

  rl.prompt();
});

rl.on("close", () => {
  console.log("🛑 Terminal session closed.\n");
  process.exit(0);
});
