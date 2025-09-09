const {
  getUsername,
  getUserRepos,
  getRepoContents,
} = require("./githubApi");

const viewFile = require("./fileViewer");
const openInBrowser = require("./openBrowser");
const { prompt } = require("enquirer");
const Table = require("cli-table3");

console.log("Starting GitHub Explorer with enquirer");

module.exports = async () => {
  try {
    console.log("Inside GitHub Explorer try block");

    const username = await getUsername();
    console.log(`🔗 Exploring GitHub for ${username}...`);

    console.log("Fetching repos...");
    const repos = await getUserRepos(username);
    console.log(`Repos fetched: ${repos.length}`);

    if (!repos || !repos.length) {
      console.log("📭 No repositories found for this user.");
      return;
    }

    const repoTable = new Table({
      head: ["Repository", "Private"],
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
      message: "📦 Select a repository to explore:",
      choices,
      limit: 10,
    });

    const trimmedRepoName = repoName.trim();
    const contents = await getRepoContents(username, trimmedRepoName);

    if (!contents || !contents.length) {
      console.log(`📂 No contents found in ${trimmedRepoName}.`);
      return;
    }

    const { action } = await prompt({
      type: "select",
      name: "action",
      message: `📁 What do you want to do with ${trimmedRepoName}?`,
      choices: [
        "🔍 View files",
        "🌐 Open in browser",
        "📂 View directories",
        "❌ Exit",
      ],
    });

    if (action === "🌐 Open in browser") {
      console.log(`🚀 Opening ${trimmedRepoName} in your browser...`);
      openInBrowser(`https://github.com/${username}/${trimmedRepoName}`);
      console.log("✅ Browser should have opened.");
      return;
    }

    if (action === "🔍 View files") {
      const files = contents.filter(item => item.type === "file");

      if (!files.length) {
        console.log(`📄 No files found in ${trimmedRepoName}.`);
        return;
      }

      const fileTable = new Table({
        head: ["File Name", "Type"],
        colWidths: [30, 10],
      });

      files.forEach(file => {
        fileTable.push([file.name, file.type]);
      });

      console.log(fileTable.toString());

      const { file } = await prompt({
        type: "select",
        name: "file",
        message: "📄 Select a file to view:",
        choices: files.map(f => f.name),
        limit: 10,
      });

      const selected = files.find(f => f.name === file);

      if (selected?.download_url) {
        console.log(`📖 Viewing ${file}...`);
        await viewFile(selected.download_url);
      } else {
        console.log("❌ File content unavailable.");
      }
    }

    else if (action === "📂 View directories") {
      const dirs = contents.filter(item => item.type === "dir");

      if (!dirs.length) {
        console.log(`📂 No directories found in ${trimmedRepoName}.`);
        return;
      }

      const dirTable = new Table({
        head: ["Directory Name", "Type"],
        colWidths: [30, 10],
      });

      dirs.forEach(dir => {
        dirTable.push([dir.name, dir.type]);
      });

      console.log(dirTable.toString());

      const { dir } = await prompt({
        type: "select",
        name: "dir",
        message: "📂 Select a directory to explore:",
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
        console.log(`📄 No files found in ${dir}.`);
        return;
      }

      const subFileTable = new Table({
        head: ["File Name", "Type"],
        colWidths: [30, 10],
      });

      subFiles.forEach(file => {
        subFileTable.push([file.name, file.type]);
      });

      console.log(subFileTable.toString());

      const { subFile } = await prompt({
        type: "select",
        name: "subFile",
        message: `📄 Select a file to view in ${dir}:`,
        choices: subFiles.map(f => f.name),
        limit: 10,
      });

      const selectedSubFile = subFiles.find(f => f.name === subFile);

      if (selectedSubFile?.download_url) {
        console.log(`📖 Viewing ${subFile}...`);
        await viewFile(selectedSubFile.download_url);
      } else {
        console.log("❌ Subfile content unavailable.");
      }
    }

    else {
      console.log("👋 Exiting GitHub Explorer.");
    }

  } catch (err) {
    console.error("❌ Error in GitHub Explorer:", err.message);
    console.error(err.stack);
  }
};
