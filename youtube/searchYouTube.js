const { spawn } = require("child_process");

module.exports = async function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const results = [];
    let errorOutput = "";
    const maxResults = 10; // ytsearch10 returns up to 10 results
    const barLength = 20; // Length of the progress bar in characters

    // Function to draw progress bar
    const drawProgressBar = (current, total) => {
      const percentage = Math.min(Math.round((current / total) * 100), 100);
      const filled = Math.round((percentage / 100) * barLength);
      const empty = barLength - filled;
      const bar = `[${"=".repeat(filled)}${"-".repeat(empty)}] ${percentage}%`;
      process.stdout.write(`\r🔍 Searching YouTube: ${bar}`);
    };

    // Stop progress bar and clear line
    const stopProgressBar = (message) => {
      process.stdout.write("\r\x1b[K"); // Clear the line
      console.log(message);
    };

    // Function to truncate string with ellipsis
    const truncate = (str, maxLength) => {
      return str.length > maxLength ? str.slice(0, maxLength - 3) + "..." : str;
    };

    // Function to print aligned table
    const printResults = (results) => {
      // Define maximum allowed lengths with caps
      const maxAllowedLengths = {
        title: 50,    // Cap title at 50 characters
        url: 60,      // Cap URL at 60 characters
        duration: 8,  // Fixed width for duration
        views: 10,    // Cap views at 10 characters
        channel: 30   // Cap channel at 30 characters
      };

      // Calculate actual max lengths, capped by allowed limits
      const maxLengths = {
        title: Math.min(Math.max(...results.map(r => r.title.length), 10), maxAllowedLengths.title),
        url: Math.min(Math.max(...results.map(r => r.url.length), 20), maxAllowedLengths.url),
        duration: Math.min(Math.max(...results.map(r => r.duration.length), 8), maxAllowedLengths.duration),
        views: Math.min(Math.max(...results.map(r => String(r.views).length), 5), maxAllowedLengths.views),
        channel: Math.min(Math.max(...results.map(r => r.channel.length), 10), maxAllowedLengths.channel)
      };

      console.log("\nSearch Results:");
      console.log(`title${"".padEnd(maxLengths.title - 5)} url${"".padEnd(maxLengths.url - 3)} duration${"".padEnd(maxLengths.duration - 8)} views${"".padEnd(maxLengths.views - 5)} channel${"".padEnd(maxLengths.channel - 7)}`);
      results.forEach((result) => {
        console.log(`${truncate(result.title, maxLengths.title).padEnd(maxLengths.title)} ${truncate(result.url, maxLengths.url).padEnd(maxLengths.url)} ${truncate(result.duration, maxLengths.duration).padEnd(maxLengths.duration)} ${String(truncate(String(result.views), maxLengths.views)).padEnd(maxLengths.views)} ${truncate(result.channel, maxLengths.channel).padEnd(maxLengths.channel)}`);
      });
    };

    // Validate yt-dlp installation
    try {
      require("child_process").execSync("yt-dlp --version", { stdio: "ignore" });
    } catch {
      stopProgressBar("❌ yt-dlp is not installed or not found in PATH.");
      return reject(new Error("❌ yt-dlp is not installed or not found in PATH."));
    }

    const yt = spawn("yt-dlp", [
      `ytsearch10:${query}`,
      "--print",
      "%(title)s||%(webpage_url)s||%(duration_string)s||%(view_count)s||%(channel)s"
    ]);

    // Initialize progress bar
    drawProgressBar(0, maxResults);

    yt.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(line => line.trim() && line.includes("||"));
      for (const line of lines) {
        const parts = line.trim().split("||");
        // Ensure exactly 5 fields
        if (parts.length === 5) {
          const [title, url, duration, views, channel] = parts.map(part => part.trim());
          // Strict check for non-empty fields after trimming
          if (title && url && duration && views && channel && 
              title.trim() !== "" && url.trim() !== "" && duration.trim() !== "" && 
              views.trim() !== "" && channel.trim() !== "") {
            results.push({ 
              title, 
              url, 
              duration, 
              views: parseInt(views) || 0, 
              channel 
            });
            drawProgressBar(results.length, maxResults); // Update bar per result
          }
        }
      }
    });

    yt.stderr.on("data", (err) => {
      errorOutput += err.toString();
      console.error("❌ yt-dlp stderr:", err.toString());
    });

    yt.on("close", (code) => {
      if (results.length) {
        stopProgressBar(`✅ yt-dlp exited with code ${code}`);
        printResults(results); // Print aligned results
        resolve(results);
      } else {
        stopProgressBar("❌ No results found.");
        reject(new Error(errorOutput || "❌ No results found."));
      }
    });

    yt.on("error", (err) => {
      stopProgressBar("❌ Failed to launch yt-dlp.");
      reject(new Error("❌ Failed to launch yt-dlp: " + err.message));
    });
  });
};