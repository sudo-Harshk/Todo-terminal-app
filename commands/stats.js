const db = require("../firebase/firestore");

async function showStats() {
  try {
    const snapshot = await db.collection("tasks").get();
    if (snapshot.empty) {
      console.log("\n📊 Task Completion Overview");
      console.log("────────────────────────────────────────────\n");
      console.log("⚠️  No tasks available.\n");
      return;
    }

    const tasks = [];
    snapshot.forEach(doc => tasks.push(doc.data()));

    const done = tasks.filter(t => t.status === "done").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const total = done + pending;

    const barSize = 20;

    const buildBar = (value) => {
      const filled = Math.round((value / total) * barSize);
      return "■".repeat(filled).padEnd(barSize, " ");
    };

    const getPercent = (value) => ((value / total) * 100).toFixed(0) + "%";
    const formatLine = (label, value) => {
      const bar = buildBar(value);
      const count = `(${value}/${total})`.padEnd(9);
      const percent = getPercent(value).padStart(4);
      return `${label.padEnd(10)} ${bar}  ${count}${percent}`;
    };

    console.log("\n📊 Task Completion Overview");
    console.log("────────────────────────────────────────────\n");
    console.log(formatLine("Completed", done));
    console.log(formatLine("Pending", pending));
    console.log("────────────────────────────────────────────");
    console.log(`📦 Total Tasks: ${total}\n`);
  } catch (err) {
    console.error("❌ Failed to load stats:", err.message);
  }
}

module.exports = showStats;
