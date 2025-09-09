const db = require("../firebase/firestore");
const dayjs = require("dayjs");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function showWeekView(options) {
  const offset = parseInt(options.offset) || 0;

  const today = dayjs();
  const weekStart = today.startOf("week").add(1 + offset * 7, "day"); // Monday with offset
  const weekEnd = weekStart.add(6, "day"); // Sunday

  console.log(`\n📆 Week View: ${weekStart.format("MMM D")} – ${weekEnd.format("MMM D, YYYY")}`);
  console.log("────────────────────────────────────────────\n");

  let allTasks = [];
  let totalDone = 0;
  let totalPending = 0;

  const snapshot = await db.collection("tasks")
    .where("date", ">=", weekStart.format("YYYY-MM-DD"))
    .where("date", "<=", weekEnd.format("YYYY-MM-DD"))
    .get();

  snapshot.forEach(doc => allTasks.push(doc.data()));

  for (let i = 0; i < 7; i++) {
    const currentDate = weekStart.add(i, "day");
    const label = weekdays[currentDate.day()];
    const dateStr = currentDate.format("YYYY-MM-DD");

    const dailyTasks = allTasks
      .filter(t => t.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));

    console.log(`🗓️  ${label} (${currentDate.format("MMM D")})`);

    if (dailyTasks.length === 0) {
      console.log("  (No tasks)\n");
      continue;
    }

    dailyTasks.forEach(task => {
      const symbol = task.status === "done" ? "✅" : "🔴";
      if (task.status === "done") totalDone++;
      else totalPending++;
      console.log(`  ${symbol} ${task.time} — ${task.title}`);
    });

    console.log();
  }

  const total = totalDone + totalPending;

  console.log("────────────────────────────────────────────");
  console.log(`✅ ${totalDone} Done` + "     " + `🔴 ${totalPending} Pending` + `     📌 Total: ${total} Tasks\n`);
}

module.exports = showWeekView;
