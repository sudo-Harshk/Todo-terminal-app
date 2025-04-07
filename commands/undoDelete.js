const db = require("../firebase/firestore");
const chalk = require("chalk");

module.exports = async () => {
  try {
    const trashRef = db.collection("trash").orderBy("deletedAt", "desc").limit(1);
    const snapshot = await trashRef.get();

    if (snapshot.empty) {
      console.log(chalk.gray("🧺 Trash is empty. Nothing to undo."));
      return;
    }

    const doc = snapshot.docs[0];
    const task = doc.data();
    const id = doc.id;

    // Restore the task
    delete task.deletedAt;
    await db.collection("tasks").doc(id).set(task);
    await db.collection("trash").doc(id).delete();

    console.log(chalk.greenBright(`♻️  Restored task: "${task.title}"`));
  } catch (err) {
    console.error(chalk.red("❌ Failed to undo delete:"), err.message);
  }
};
