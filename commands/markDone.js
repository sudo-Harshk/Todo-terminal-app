const db = require("../firebase/firestore");
const chalk = require("chalk");

async function markDone(id) {
  try {
    const ref = db.collection("tasks").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      console.log(chalk.red(`❌ No task found with ID: ${id}`));
      return;
    }

    await ref.update({ status: "done" });
    console.log(chalk.green(`✅ Task ${id} marked as DONE.`));
  } catch (err) {
    console.error(chalk.red("❌ Failed to update task:"), err.message);
  }
}

module.exports = markDone;
