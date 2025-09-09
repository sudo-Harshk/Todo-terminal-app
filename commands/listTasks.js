const db = require("../firebase/firestore");

async function listTasks(options) {
  const { date, sort, status, reverse, priority } = options;

  try {
    let query = db.collection("tasks");

    if (date) {
      query = query.where("date", "==", date);
    }

    if (status === "done" || status === "pending") {
      query = query.where("status", "==", status);
    }

    if (priority && ["low", "medium", "high"].includes(priority.toLowerCase())) {
      query = query.where("priority", "==", priority.toLowerCase());
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log("⚠️ No tasks found.");
      return;
    }

    const tasks = [];
    snapshot.forEach(doc => {
      const task = doc.data();
      task.id = doc.id;
      tasks.push(task);
    });

    // Handle invalid sort field with suggestion
    const validSorts = ["date", "time", "title", "status", "priority"];
    if (sort && !validSorts.includes(sort)) {
      console.log(`❌ Invalid sort field: '${sort}'`);
      console.log(`💡 Use --sort with one of: ${validSorts.join(", ")}`);
      console.log(`\nExample: list --sort priority --reverse\n`);
    }

    // Sorting logic
    if (sort && validSorts.includes(sort)) {
      tasks.sort((a, b) => {
        switch (sort) {
          case "date": return a.date.localeCompare(b.date);
          case "time": return a.time.localeCompare(b.time);
          case "title": return a.title.localeCompare(b.title);
          case "status": return a.status.localeCompare(b.status);
          case "priority":
            const priorityMap = { high: 3, medium: 2, low: 1 };
            return (priorityMap[a.priority] || 0) - (priorityMap[b.priority] || 0);
        }
      });
    }

    if (reverse) {
      tasks.reverse();
    }

    console.log("🗂️  Tasks :");
    tasks.forEach(task => {
      const statusSymbol = task.status === "done" ? "✅" : "📝";
      const priorityLabel = task.priority ? `🔖 ${task.priority}` : "";
      console.log(`${statusSymbol} [${task.status.toUpperCase()}] ${task.title} @ ${task.date} ${task.time} ${priorityLabel} (ID: ${task.id})`);
    });
  } catch (err) {
    console.error("❌ Failed to list tasks:", err.message);
  }
}

module.exports = listTasks;
