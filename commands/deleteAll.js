const db = require("../firebase/firestore");
const chalk = require("chalk");
const readline = require("readline");

module.exports = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    chalk.redBright("⚠️  Are you sure you want to delete ALL tasks? (yes/no): "),
    async (answer) => {
      rl.close();

      if (answer.toLowerCase() !== "yes") {
        console.log(chalk.yellow("❌ Cancelled. No tasks were deleted."));
        return;
      }

      try {
        const snapshot = await db.collection("tasks").get();

        if (snapshot.empty) {
          console.log(chalk.yellow("⚠️  No tasks found to delete."));
          return;
        }

        const batch = db.batch();
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        console.log(chalk.greenBright("✅ All tasks have been deleted successfully!"));
      } catch (err) {
        console.error(chalk.red("❌ Failed to delete tasks:"), err.message);
      }
    }
  );
};
