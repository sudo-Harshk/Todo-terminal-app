const db = require("../firebase/firestore");
const { v4: uuidv4 } = require("uuid");
const chalk = require("chalk");
const dayjs = require("dayjs");

module.exports = async (title, options) => {
  const { date, time, priority = "low" } = options;

  if (!date || !time) {
    console.log(chalk.red("❌ Please provide both --date and --time"));
    return;
  }

  const dateValid = dayjs(date, "YYYY-MM-DD", true).isValid();
  if (!dateValid) {
    console.log(chalk.red("❌ Invalid date. Use a valid date in YYYY-MM-DD format."));
    return;
  }

  const timeValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  if (!timeValid) {
    console.log(chalk.red("❌ Invalid time format. Use HH:mm in 24-hour format (e.g., 14:30)."));
    return;
  }

  const scheduledDateTime = dayjs(`${date}T${time}`);
  if (!scheduledDateTime.isValid() || scheduledDateTime.isBefore(dayjs())) {
    console.log(chalk.red("❌ Cannot create a task scheduled in the past."));
    return;
  }

  const allowedPriorities = ["low", "medium", "high"];
  if (!allowedPriorities.includes(priority.toLowerCase())) {
    console.log(chalk.red("❌ Invalid priority. Allowed values: low, medium, high"));
    return;
  }

  try {
    const id = uuidv4();
    const task = {
      id,
      title,
      date,
      time,
      status: "pending",
      priority: priority.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(id).set(task);
    console.log(chalk.greenBright(`✅ Task added: "${title}" on ${date} ${time}`));
  } catch (err) {
    console.error(chalk.red("❌ Failed to add task:"), err.message);
  }
};
