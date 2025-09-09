// github/fileViewer.js
const axios = require("axios");

module.exports = async (url) => {
  try {
    const response = await axios.get(url);
    console.clear();
    console.log("📄 File Content:\n");
    const content = typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2);
    console.log(content.split('\n').map(line => `  ${line}`).join('\n')); // Indent content for readability
  } catch (err) {
    console.error("❌ Failed to fetch file content:", err.message);
  }
};