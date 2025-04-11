const { spawn } = require("child_process");

module.exports = async function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const results = [];
    const yt = spawn("yt-dlp", [
      `ytsearch10:${query}`,
      "--print",
      "%(title)s|%(webpage_url)s|%(duration_string)s|%(view_count)s|%(channel)s"
    ]);

    yt.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        const [title, url, duration, views, channel] = line.trim().split("|");
        if (title && url) {
          results.push({ title, url, duration, views, channel });
        }
      }
    });

    yt.stderr.on("data", (err) => {
      console.error("❌ yt-dlp stderr:", err.toString());
    });

    yt.on("close", (code) => {
      if (results.length) {
        console.log(`✅ yt-dlp exited with code ${code}`);
        resolve(results);
      } else {
        console.log("⚠️ No videos found. Check if parsing is correct.");
        reject(new Error("No results found."));
      }
    });

    yt.on("error", (err) => {
      reject(new Error("❌ Failed to launch yt-dlp: " + err.message));
    });
  });
};
