const db = require("../firebase/firestore");

async function showHistory() {
  try {
    const snapshot = await db.collection("tasks")
      .where("status", "==", "done")
      .get();

    if (snapshot.empty) {
      console.log("⚠️  No completed tasks yet.");
      return;
    }

    const tasks = [];
    snapshot.forEach(doc => tasks.push(doc.data()));

    tasks.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    console.log("\n📜 Completed Tasks History");
    console.log("────────────────────────────");

    tasks.forEach(task => {
      console.log(`✅ ${task.date} @ ${task.time} — ${task.title}`);
    });

    console.log("────────────────────────────");
    console.log(`📦 Total Completed: ${tasks.length}\n`);
  } catch (err) {
    console.error("❌ Failed to load history:", err.message);
  }
}

module.exports = showHistory;
