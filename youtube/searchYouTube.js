const { spawn } = require("child_process");

module.exports = function searchYouTube({ query, isChannel = false }) {
  return new Promise((resolve, reject) => {
    const results = [];
    const barLength = 20;

    const drawProgressBar = (current, total) => {
      const percent = Math.min(Math.round((current / total) * 100), 100);
      const filled = Math.round((percent / 100) * barLength);
      const bar = `[${"=".repeat(filled)}${"-".repeat(barLength - filled)}] ${percent}%`;
      process.stdout.write(`\r🔍 Fetching videos: ${bar}`);
    };

    const stopBar = (msg) => {
      process.stdout.write("\r\x1b[K");
      console.log(msg);
    };

    const args = isChannel
      ? [`https://www.youtube.com/channel/${query}`, "--flat-playlist", "--print", "%(title)s||%(webpage_url)s||%(duration_string)s"]
      : [`ytsearch10:${query}`, "--print", "%(title)s||%(webpage_url)s||%(duration_string)s||%(view_count)s||%(channel)s"];

    console.log(`YouTube search: ${isChannel ? "channel: " + query : query}`);
    const yt = spawn("yt-dlp", args);

    yt.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(line => line.includes("||"));
      lines.forEach(line => {
        const parts = line.trim().split("||");
        if (isChannel && parts.length === 3) {
          const [title, url, duration] = parts;
          results.push({ title, url, duration, channel: "📺 Channel" });
        } else if (!isChannel && parts.length === 5) {
          const [title, url, duration, views, channel] = parts;
          results.push({ title, url, duration, views, channel });
        }
        drawProgressBar(results.length, 10);
      });
    });

    yt.stderr.on("data", err => console.error("yt-dlp error:", err.toString()));

    yt.on("close", (code) => {
      stopBar(`✅ yt-dlp exited with code ${code}`);
      resolve(results);
    });

    yt.on("error", err => {
      stopBar("❌ Failed to launch yt-dlp.");
      reject(new Error("❌ yt-dlp error: " + err.message));
    });
  });
};
