const db = require("../firebase/firestore");
const chalk = require("chalk");

module.exports = async (id) => {
  try {
    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      console.log(chalk.red("❌ Task not found."));
      return;
    }

    const task = taskDoc.data();
    task.deletedAt = new Date().toISOString(); // Add deletion timestamp

    await db.collection("trash").doc(id).set(task);     // Move to trash
    await taskRef.delete();                              // Delete from tasks

    console.log(chalk.yellowBright(`🗑️ Task moved to trash (can undo): "${task.title}"`));
  } catch (err) {
    console.error(chalk.red("❌ Failed to delete task:"), err.message);
  }
};
