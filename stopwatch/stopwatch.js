#!/usr/bin/env node

const readline = require("readline");

let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
let interval = null;
let running = false;
let lastStatus = "";

function format(n, length = 2) {
  return n.toString().padStart(length, "0");
}

function display() {
  const timeString = `${format(hours)}:${format(minutes)}:${format(seconds)}.${format(milliseconds, 3)}`;
  const statusEmoji = {
    "Start": "▶️  Started",
    "Pause": "⏸️  Paused",
    "Reset": "🔁 Reset",
    "": ""
  }[lastStatus] || "";
  const output = `⏱️  ${timeString}  [s: start | p: pause | r: reset | q: quit]  ${statusEmoji}`;
  process.stdout.write(`\r${output.padEnd(100, " ")}`);
}

function tick() {
  milliseconds += 10;
  if (milliseconds >= 1000) {
    milliseconds = 0;
    seconds++;
  }
  if (seconds >= 60) {
    seconds = 0;
    minutes++;
  }
  if (minutes >= 60) {
    minutes = 0;
    hours++;
  }
  display();
}

function start() {
  if (!running) {
    interval = setInterval(tick, 10);
    running = true;
    lastStatus = "Start";
    display();
  }
}

function pause() {
  clearInterval(interval);
  running = false;
  lastStatus = "Pause";
  display();
}

function reset() {
  pause();
  hours = minutes = seconds = milliseconds = 0;
  lastStatus = "Reset";
  display();
}

function getFinalTime() {
  return `${format(hours)}:${format(minutes)}:${format(seconds)}.${format(milliseconds, 3)}`;
}

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

console.clear();
console.log("📦 Terminal Stopwatch");
display();

process.stdin.on("keypress", (_, key) => {
  if (process.stdout.clearLine) process.stdout.clearLine(0);
  if (process.stdout.cursorTo) process.stdout.cursorTo(0);

  if (key.name === "s") start();
  else if (key.name === "p") pause();
  else if (key.name === "r") reset();
  else if (key.name === "q") {
    pause();
    const totalTime = getFinalTime();
    process.stdout.write(`\n👋 Exiting Stopwatch...`);
    process.exit(0);
  }
});
