#!/usr/bin/env node

const readline = require("readline");
const chalk = require("chalk");
const { exec, spawn } = require("child_process");
const stringSimilarity = require("string-similarity");

const quotes = [
  "Stay focused.",
  "Make today count.",
  "Clarity through action.",
  "Todo. Done. Repeat.",
  "Discipline is freedom.",
  "Organize the chaos 🧠",
];
const quote = quotes[Math.floor(Math.random() * quotes.length)];

const knownCommands = [
  "list", "dashboard", "week", "day", "add", "edit", "delete",
  "done", "undone", "search", "export", "history", "cls", "clear",
  "exit", "help", "stats", "stopwatch", "undo", "streak"
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "todo> ",
});

function showAnimatedIntro(callback) {
  console.clear();
  const lines = [
    chalk.cyan("🌀 Starting..."),
    chalk.gray("🎯 Preparing your space..."),
  ];
  let i = 0;
  const delay = 700;

  const interval = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(interval);
      console.log();
      console.log(chalk.greenBright("📦 Welcome to Your Todo Terminal"));
      console.log(chalk.gray("Type 'help' to see available commands.\n"));
      callback();
    } else {
      console.log(lines[i]);
      i++;
    }
  }, delay);
}

showAnimatedIntro(() => {
  rl.prompt();
});

rl.on("line", (line) => {
  const input = line.trim();
  if (!input) return rl.prompt();

  const [command, ...args] = input.split(" ");
  const argString = args.join(" ");

  switch (command) {
    case "help":
      console.log(chalk.cyanBright.bold("\n📘 Available Commands:\n"));
      const helpCommands = [
        ["list", "List all tasks or filter by --date"],
        ["dashboard", "Show overall task summary dashboard"],
        ["week", "Weekly agenda (use --offset to navigate)"],
        ["day --date DD-MM-YYYY", "View tasks for a specific day"],
        ['add "<title>" --date YYYY-MM-DD --time HH:mm', "Add a new task"],
        ['edit <id> --title --date --time', "Edit task fields"],
        ["delete <id>", "Delete a task by ID"],
        ["done <id>", "Mark task as done"],
        ["undone <id>", "Mark task as pending"],
        ["search <keyword>", "Search tasks by title keyword"],
        ["export", "Export tasks to tasks.csv"],
        ["history", "Show history of completed tasks"],
        ["stats", "Show task statistics"],
        ["stopwatch", "Start a stopwatch timer"],
        ["undo", "Restore the last deleted task"],
        ["streak", "View your task completion streak"],
        ["cls / clear", "Clear the terminal screen"],
        ["exit", "Exit todo shell"],
      ];
      const width = 48;
      helpCommands.forEach(([cmd, desc]) => {
        const padded = cmd.padEnd(width, " ");
        console.log(`  ${chalk.green(padded)}→  ${desc}`);
      });
      console.log();
      break;

    case "cls":
    case "clear":
      console.clear();
      rl.prompt();
      return;

    case "exit":
      console.log(chalk.blue("👋 Exiting todo terminal..."));
      rl.close();
      return;

    default:
      if (["add", "done", "undone", "delete", "edit"].includes(command) && args.length === 0) {
        console.log(chalk.red(`❌ Missing arguments for '${command}'.`));
        const usageMap = {
          add: `add "<title>" --date YYYY-MM-DD --time HH:mm`,
          done: `done <id>`,
          undone: `undone <id>`,
          delete: `delete <id>`,
          edit: `edit <id> --title --date --time`,
        };
        if (usageMap[command]) {
          console.log(chalk.gray(`Usage: ${usageMap[command]}`));
        }
        rl.prompt();
        return;
      }

      if (command.startsWith("--")) {
        console.log(chalk.red(`❌ '${command}' is an option, not a command.`));
        console.log(chalk.yellow(`💡 Use it with a command like 'add' or 'day'\n`));
        rl.prompt();
        return;
      }

      const match = stringSimilarity.findBestMatch(command, knownCommands).bestMatch;

      if (!knownCommands.includes(command)) {
        console.log(chalk.red(`❌ Unknown command: '${command}'`));
        if (match.rating > 0.4 && match.target !== command) {
          console.log(chalk.yellow(`💡 Did you mean '${match.target}'?`));
        }
        console.log(chalk.gray("Type 'help' to see available commands.\n"));
        rl.prompt();
        return;
      }

      if (command === "stopwatch") {
        rl.pause();
        const stopwatch = spawn("node", ["index.js", "stopwatch"], {
          stdio: "inherit",
        });
        stopwatch.on("exit", () => {
          rl.resume();
          rl.prompt();
        });
        return;
      }

      const child = spawn("node", ["index.js", ...input.split(" ")], {
        stdio: "inherit",
      });

      child.on("exit", () => {
        rl.prompt();
      });
      return;
  }

  rl.prompt();
});

rl.on("close", () => {
  console.log(chalk.gray("🛑 Terminal session closed.\n"));
  process.exit(0);
});
