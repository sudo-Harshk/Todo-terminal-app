const searchYouTube = require('../youtube/searchYouTube');
const { Select } = require('enquirer');
const open = require('open');

module.exports = async function youtubeCommand(query) {
  console.log(`YouTube search: ${query}`);

  try {
    const results = await searchYouTube(query);
    if (results.length === 0) {
      console.log('❌ No results found.');
      return;
    }

    console.log('Search Results:');
    console.table(results);

    const prompt = new Select({
      name: 'video',
      message: 'Select a video to watch:',
      choices: results.map((result, index) => ({
        name: `${index + 1}. ${result.title} (${result.channel})`,
        value: result.url,
      })),
    });

    const selectedUrl = await prompt.run();
    console.log(`Opening: ${selectedUrl}`);
    await open(selectedUrl);
  } catch (err) {
    console.error('❌ Error during YouTube search:', err.message);
    if (err.stack) console.error('Stack trace:', err.stack); // Log full stack for debugging
  }
};