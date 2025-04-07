const db = require("../firebase/firestore");
const chalk = require("chalk");

async function searchTasks(keywordArg) {
  const keyword = keywordArg.toLowerCase();

  if (!keyword) {
    console.log(chalk.yellow("⚠️  Please provide a keyword to search."));
    return;
  }

  try {
    const snapshot = await db.collection("tasks").get();
    const matches = [];

    snapshot.forEach(doc => {
      const task = doc.data();
      if (task.title.toLowerCase().includes(keyword)) {
        matches.push(task);
      }
    });

    if (matches.length === 0) {
      console.log(chalk.red(`❌ No tasks found matching "${keyword}"`));
      return;
    }

    console.log(chalk.bold(`\n🔍 Results for "${keyword}":\n`));

    matches.forEach(task => {
      const statusSymbol = task.status === "done" ? "✅" : "🔴";
      console.log(`${statusSymbol} ${task.title} @ ${task.date} ${task.time} (ID: ${task.id})`);
    });

  } catch (err) {
    console.error(chalk.red("❌ Error during search:"), err.message);
  }
}

module.exports = searchTasks;
