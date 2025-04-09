// github/fileViewer.js
const axios = require("axios");
const chalk = require("chalk");

module.exports = async (url) => {
  try {
    const response = await axios.get(url);
    console.clear();
    console.log(chalk.greenBright.bold("📄 File Content:\n"));
    const content = typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2);
    console.log(chalk.gray(content.split('\n').map(line => `  ${line}`).join('\n'))); // Indent content for readability
  } catch (err) {
    console.error(chalk.red.bold("❌ Failed to fetch file content:"), err.message);
  }
};