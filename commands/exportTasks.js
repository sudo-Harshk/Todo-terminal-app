const db = require("../firebase/firestore");
const fs = require("fs");
const { writeToPath } = require("fast-csv");

async function exportTasks() {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = [];

    snapshot.forEach(doc => {
      const t = doc.data();
      tasks.push({
        id: t.id,
        title: t.title,
        date: t.date,
        time: t.time,
        status: t.status,
        createdAt: t.createdAt || "",
      });
    });

    if (tasks.length === 0) {
      console.log("⚠️ No tasks found to export.");
      return;
    }

    const filePath = "tasks.csv";

    writeToPath(filePath, tasks, { headers: true })
      .on("finish", () => {
        console.log(`✅ Exported ${tasks.length} tasks to ${filePath}\n`);
      })
      .on("error", err => {
        console.error("❌ Error writing CSV:", err.message);
      });

  } catch (err) {
    console.error("❌ Failed to export tasks:", err.message);
  }
}

module.exports = exportTasks;
