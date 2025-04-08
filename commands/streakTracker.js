const db = require("../firebase/firestore");
const chalk = require("chalk");
const dayjs = require("dayjs");

module.exports = async () => {
  try {
    const snapshot = await db.collection("tasks").where("status", "==", "done").get();
    if (snapshot.empty) {
      console.log(chalk.yellow("⚠️  No completed tasks found."));
      return;
    }

    const dates = new Set();
    snapshot.forEach(doc => {
      const task = doc.data();
      if (task.date) dates.add(task.date);
    });

    const sortedDates = [...dates].sort((a, b) => dayjs(b).diff(dayjs(a)));

    let streak = 0;
    let today = dayjs().startOf("day");

    for (let i = 0; i < sortedDates.length; i++) {
      const taskDate = dayjs(sortedDates[i]);
      if (taskDate.isSame(today, "day")) {
        streak++;
        today = today.subtract(1, "day");
      } else if (taskDate.isSame(today.subtract(1, "day"), "day")) {
        streak++;
        today = today.subtract(1, "day");
      } else {
        break;
      }
    }

    const lastDone = sortedDates[0];
    console.log(chalk.bold("\n🔥 Your Task Completion Streak"));
    console.log("────────────────────────────────────────────");
    console.log(`✅ Last Completed Task : ${lastDone}`);
    console.log(`🔥 Current Streak      : ${streak} day(s)`);
    console.log("────────────────────────────────────────────\n");

  } catch (err) {
    console.error(chalk.red("❌ Failed to calculate streak:"), err.message);
  }
};
