const db = require("../firebase/firestore");
const dayjs = require("dayjs");

module.exports = async (id, options) => {
  const { title, date, time, priority } = options;

  if (!title && !date && !time && !priority) {
    console.log("❌ Please provide at least one field to update (--title, --date, --time, or --priority)");
    return;
  }

  const updates = {};

  if (title) updates.title = title;

  if (date) {
    const isValidDate = dayjs(date, "YYYY-MM-DD", true).isValid();
    if (!isValidDate) {
      console.log("❌ Invalid date format. Use YYYY-MM-DD");
      return;
    }
    updates.date = date;
  }

  if (time) {
    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (!isValidTime) {
      console.log("❌ Invalid time format. Use HH:mm in 24-hour format");
      return;
    }
    updates.time = time;
  }

  if (priority) {
    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority.toLowerCase())) {
      console.log("❌ Invalid priority. Allowed values: low, medium, high");
      return;
    }
    updates.priority = priority.toLowerCase();
  }

  try {
    const doc = await db.collection("tasks").doc(id).get();
    if (!doc.exists) {
      console.log("❌ Task not found.");
      return;
    }

    const existing = doc.data();
    const finalDate = updates.date || existing.date;
    const finalTime = updates.time || existing.time;

    const fullDT = dayjs(`${finalDate}T${finalTime}`);
    if (!fullDT.isValid()) {
      console.log("❌ Invalid datetime after edit.");
      return;
    }

    const now = dayjs();
    if (fullDT.isBefore(now)) {
      console.log("❌ Cannot update task to a time in the past.");
      return;
    }

    await db.collection("tasks").doc(id).update(updates);

    console.log("✅ Task " + id + " updated successfully:");
    if (title) console.log("📝 Title    → " + title);
    if (date) console.log("📅 Date     → " + date);
    if (time) console.log("⏰ Time     → " + time);
    if (priority) console.log("🔖 Priority → " + priority.toLowerCase());

  } catch (err) {
    console.error("❌ Failed to update task:", err.message);
  }
};
