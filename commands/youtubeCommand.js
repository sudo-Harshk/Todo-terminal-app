const inquirer = require("inquirer");
const open = require("open");
const searchYouTube = require("../youtube/searchYouTube");
const getChannelId = require("../youtube/channelSearch");

module.exports = async function youtubeCommand(queryArgs, options) {
  const isChannel = options.channel !== undefined;
  let query = isChannel ? options.channel : queryArgs.join(" ");

  try {
    if (isChannel) {
      const channelId = await getChannelId(query);
      query = channelId;
    }

    const results = await searchYouTube({ query, isChannel });

    console.log("\n📺 Search Results:");
    const choices = results.map((r, i) => ({
      name: `${i + 1}. ${r.title} (${r.channel})`,
      value: r.url
    }));

    const { selectedUrl } = await inquirer.prompt([
      {
        name: "selectedUrl",
        type: "list",
        message: "🎬 Select a video to open in browser:",
        choices
      }
    ]);

    await open(selectedUrl);
  } catch (err) {
    console.error("❌", err.message || err);
  }
};
