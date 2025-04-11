const open = require("open");
const searchYouTube = require("./searchYouTube");
const { Select } = require("enquirer");
const chalk = require("chalk");

module.exports = async (query) => {
  const results = await searchYouTube(query);

  if (!results.length) {
    console.log(chalk.red("❌ No results found."));
    return;
  }

  const choices = results.map((video, index) => ({
    name: `${index + 1}`,
    message: `${chalk.yellow(video.title)} [${chalk.green(video.duration)}] ⏱️  ${chalk.cyan(video.views)} views | 🎬 ${chalk.magenta(video.channel)}`,
    value: video.url,
  }));

  const prompt = new Select({
    name: "video",
    message: chalk.cyan("🎥 Choose a video to watch"),
    choices,
  });

  const selectedUrl = await prompt.run();
  console.log(chalk.green(`🚀 Opening ${selectedUrl}...`));
  await open(selectedUrl);
};
