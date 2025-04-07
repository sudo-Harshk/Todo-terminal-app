const db = require("../firebase/firestore");
const chalk = require("chalk");

async function deleteTask(id) {
  try {
    const doc = await db.collection("tasks").doc(id).get();

    if (!doc.exists) {
      console.log(chalk.red(`❌ No task found with ID: ${id}`));
      return;
    }

    await db.collection("tasks").doc(id).delete();
    console.log(chalk.green(`🗑️  Task with ID ${id} deleted successfully.`));
  } catch (err) {
    console.error(chalk.red("❌ Failed to delete task:"), err.message);
  }
}

module.exports = deleteTask;
