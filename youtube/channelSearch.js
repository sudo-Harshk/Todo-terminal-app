const { exec } = require("child_process");

module.exports = function getChannelId(channelName) {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp "ytsearch1:${channelName}" --print "%(channel_id)s"`;

    exec(command, (error, stdout, stderr) => {
      if (error) return reject(`❌ Error: ${stderr}`);
      const channelId = stdout.trim();
      if (!channelId || !channelId.startsWith("UC")) {
        return reject("❌ Unable to extract channel ID.");
      }
      resolve(channelId);
    });
  });
};
