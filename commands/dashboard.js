const db = require("../firebase/firestore");
const dayjs = require("dayjs");

async function showDashboard() {
  const todayStr = dayjs().format("YYYY-MM-DD");

  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = [];
    let doneCount = 0;
    let pendingCount = 0;
    let dueTodayCount = 0;

    snapshot.forEach(doc => {
      const task = doc.data();
      tasks.push(task);
      if (task.status === "done") doneCount++;
      else pendingCount++;

      if (task.date === todayStr) dueTodayCount++;
    });

    console.log("\n📊 Task Dashboard");
    console.log("────────────────────────────");

    console.log(`📝 Total Tasks: ${tasks.length}`);
    console.log(`✅ Done: ${doneCount}`);
    console.log(`🔴 Pending: ${pendingCount}`);
    console.log(`📅 Due Today: ${dueTodayCount}`);

    if (tasks.length > 0) {
      const last = tasks.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
      console.log(`🆕 Last Added: "${last.title}" on ${last.date} @ ${last.time}`);
    }

    console.log();
  } catch (err) {
    console.error("❌ Failed to load dashboard:", err.message);
  }
}

module.exports = showDashboard;
