// commands/dayView.js
const db = require("../firebase/firestore");
const chalk = require("chalk");
const dayjs = require("dayjs");

// Enable support for custom date formats like DD-MM-YYYY
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

async function showDayView(options) {
  const { date } = options;

  if (!date) {
    console.log(chalk.red("❌ Please provide a date using --date DD-MM-YYYY"));
    return;
  }

  const parsed = dayjs(date, "DD-MM-YYYY");
  if (!parsed.isValid()) {
    console.log(chalk.red("❌ Invalid date format. Use --date DD-MM-YYYY"));
    return;
  }

  const dateFormatted = parsed.format("YYYY-MM-DD");

  try {
    const snapshot = await db.collection("tasks")
      .where("date", "==", dateFormatted)
      .get();

    console.log(chalk.bold(`\n📅 Tasks on ${parsed.format("MMM D, YYYY")}`));
    console.log("────────────────────────────\n");

    if (snapshot.empty) {
      console.log(chalk.yellow("⚠️  No tasks found for this date.\n"));
      return;
    }

    const tasks = [];
    snapshot.forEach(doc => tasks.push(doc.data()));

    tasks
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach(task => {
        const symbol = task.status === "done" ? "✅" : "🔴";
        console.log(`${symbol} ${task.time} — ${task.title}`);
      });

    console.log();
  } catch (err) {
    console.error(chalk.red("❌ Failed to load tasks:"), err.message);
  }
}

module.exports = showDayView;
