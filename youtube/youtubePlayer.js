const open = require("open");
const searchYouTube = require("./searchYouTube");
const { Select } = require("enquirer");

module.exports = async (query) => {
  const results = await searchYouTube(query);

  if (!results.length) {
    console.log("❌ No results found.");
    return;
  }

  const choices = results.map((video, index) => ({
    name: `${index + 1}`,
    message: `${video.title} [${video.duration}] ⏱️  ${video.views} views | 🎬 ${video.channel}`,
    value: video.url,
  }));

  const prompt = new Select({
    name: "video",
    message: "🎥 Choose a video to watch",
    choices,
  });

  const selectedUrl = await prompt.run();
  console.log(`🚀 Opening ${selectedUrl}...`);
  await open(selectedUrl);
};
