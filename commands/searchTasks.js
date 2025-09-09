const db = require("../firebase/firestore");

async function searchTasks(keywordArg) {
  const keyword = keywordArg.toLowerCase();

  if (!keyword) {
    console.log("⚠️  Please provide a keyword to search.");
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
      console.log(`❌ No tasks found matching "${keyword}"`);
      return;
    }

    console.log(`\n🔍 Results for "${keyword}":\n`);

    matches.forEach(task => {
      const statusSymbol = task.status === "done" ? "✅" : "🔴";
      console.log(`${statusSymbol} ${task.title} @ ${task.date} ${task.time} (ID: ${task.id})`);
    });

  } catch (err) {
    console.error("❌ Error during search:", err.message);
  }
}

module.exports = searchTasks;
