const {
  getUsername,
  getUserRepos,
  getRepoContents,
} = require("./githubApi");

const viewFile = require("./fileViewer");
const openInBrowser = require("./openBrowser");
const chalk = require("chalk");
const { prompt } = require("enquirer");
const Table = require("cli-table3");

console.log(chalk.bold.cyanBright("Starting GitHub Explorer with enquirer"));

module.exports = async () => {
  try {
    console.log(chalk.cyan("Inside GitHub Explorer try block"));

    const username = await getUsername();
    console.log(chalk.cyanBright(`🔗 Exploring GitHub for ${username}...`));

    console.log(chalk.blue("Fetching repos..."));
    const repos = await getUserRepos(username);
    console.log(chalk.green(`Repos fetched: ${repos.length}`));

    if (!repos || !repos.length) {
      console.log(chalk.yellow("📭 No repositories found for this user."));
      return;
    }

    const repoTable = new Table({
      head: [chalk.bold.cyan("Repository"), chalk.bold.cyan("Private")],
      colWidths: [30, 10],
    });

    repos.forEach(repo => {
      repoTable.push([repo.name.trim(), repo.private ? "Yes" : "No"]);
    });

    console.log(repoTable.toString());

    const choices = repos.map((repo) => ({
      name: `${repo.name.trim()} ${repo.private ? "(private)" : ""}`,
      value: repo.name.trim(),
    }));

    const { repoName } = await prompt({
      type: "select",
      name: "repoName",
      message: chalk.cyanBright("📦 Select a repository to explore:"),
      choices,
      limit: 10,
    });

    const trimmedRepoName = repoName.trim();
    const contents = await getRepoContents(username, trimmedRepoName);

    if (!contents || !contents.length) {
      console.log(chalk.yellow(`📂 No contents found in ${trimmedRepoName}.`));
      return;
    }

    const { action } = await prompt({
      type: "select",
      name: "action",
      message: chalk.cyanBright(`📁 What do you want to do with ${trimmedRepoName}?`),
      choices: [
        chalk.green("🔍 View files"),
        chalk.blue("🌐 Open in browser"),
        chalk.yellow("📂 View directories"),
        chalk.red("❌ Exit"),
      ],
    });

    if (action === chalk.blue("🌐 Open in browser")) {
      console.log(chalk.blueBright(`🚀 Opening ${trimmedRepoName} in your browser...`));
      openInBrowser(`https://github.com/${username}/${trimmedRepoName}`);
      console.log(chalk.green("✅ Browser should have opened."));
      return;
    }

    if (action === chalk.green("🔍 View files")) {
      const files = contents.filter(item => item.type === "file");

      if (!files.length) {
        console.log(chalk.yellow(`📄 No files found in ${trimmedRepoName}.`));
        return;
      }

      const fileTable = new Table({
        head: [chalk.bold.green("File Name"), chalk.bold.green("Type")],
        colWidths: [30, 10],
      });

      files.forEach(file => {
        fileTable.push([file.name, file.type]);
      });

      console.log(fileTable.toString());

      const { file } = await prompt({
        type: "select",
        name: "file",
        message: chalk.greenBright("📄 Select a file to view:"),
        choices: files.map(f => f.name),
        limit: 10,
      });

      const selected = files.find(f => f.name === file);

      if (selected?.download_url) {
        console.log(chalk.greenBright(`📖 Viewing ${file}...`));
        await viewFile(selected.download_url);
      } else {
        console.log(chalk.red("❌ File content unavailable."));
      }
    }

    else if (action === chalk.yellow("📂 View directories")) {
      const dirs = contents.filter(item => item.type === "dir");

      if (!dirs.length) {
        console.log(chalk.yellow(`📂 No directories found in ${trimmedRepoName}.`));
        return;
      }

      const dirTable = new Table({
        head: [chalk.bold.yellow("Directory Name"), chalk.bold.yellow("Type")],
        colWidths: [30, 10],
      });

      dirs.forEach(dir => {
        dirTable.push([dir.name, dir.type]);
      });

      console.log(dirTable.toString());

      const { dir } = await prompt({
        type: "select",
        name: "dir",
        message: chalk.yellowBright("📂 Select a directory to explore:"),
        choices: dirs.map(d => d.name),
        limit: 10,
      });

      const selectedDir = dirs.find(d => d.name === dir);
      if (!selectedDir) return;

      const subDirUrl = selectedDir.url.includes("?")
        ? selectedDir.url
        : `${selectedDir.url}?ref=main`;

      const subContents = await getRepoContents(username, trimmedRepoName, subDirUrl);

      const subFiles = subContents.filter(item => item.type === "file");

      if (!subFiles.length) {
        console.log(chalk.yellow(`📄 No files found in ${dir}.`));
        return;
      }

      const subFileTable = new Table({
        head: [chalk.bold.green("File Name"), chalk.bold.green("Type")],
        colWidths: [30, 10],
      });

      subFiles.forEach(file => {
        subFileTable.push([file.name, file.type]);
      });

      console.log(subFileTable.toString());

      const { subFile } = await prompt({
        type: "select",
        name: "subFile",
        message: chalk.greenBright(`📄 Select a file to view in ${dir}:`),
        choices: subFiles.map(f => f.name),
        limit: 10,
      });

      const selectedSubFile = subFiles.find(f => f.name === subFile);

      if (selectedSubFile?.download_url) {
        console.log(chalk.greenBright(`📖 Viewing ${subFile}...`));
        await viewFile(selectedSubFile.download_url);
      } else {
        console.log(chalk.red("❌ Subfile content unavailable."));
      }
    }

    else {
      console.log(chalk.gray("👋 Exiting GitHub Explorer."));
    }

  } catch (err) {
    console.error(chalk.red.bold("❌ Error in GitHub Explorer:"), err.message);
    console.error(chalk.red(err.stack));
  }
};
