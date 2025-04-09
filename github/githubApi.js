// github/githubApi.js
const axios = require("axios");
const chalk = require("chalk");
const { prompt } = require("enquirer");

let cachedUsername = null;

async function getUsername() {
  if (cachedUsername) return cachedUsername;

  const { username } = await prompt({
    type: "input",
    name: "username",
    message: "🔐 Enter GitHub username (default = yours):",
    initial: process.env.GITHUB_USER || "sudo-Harshk",
  });

  cachedUsername = username;
  return username;
}

async function getUserRepos(username) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log(chalk.red("❌ GITHUB_TOKEN not found in .env"));
    process.exit(1);
  }

  const url = `https://api.github.com/users/${username}/repos`;
  console.log("Fetching repos from (raw):", url);
  const response = await axios.get(url, { headers: { Authorization: `token ${token}` } });
  const repos = response.data;
  console.log("Raw repo names from API:", repos.map(r => r.name));
  return repos;
}

async function getRepoContents(username, repo, customUrl = null) {
  console.log(`Fetching contents for ${repo}${customUrl ? ` (custom URL: ${customUrl})` : ''}...`);
  const baseUrl = customUrl || `https://api.github.com/repos/${username}/${repo}/contents`;
  let sanitizedRepo = repo.trim();
  const urlParts = customUrl ? [customUrl] : ['https://api.github.com/repos', username, sanitizedRepo, 'contents'];
  
  console.log("URL parts:", urlParts);
  console.log("Raw repo value:", repo);
  
  let url = customUrl || urlParts.join("/");
  console.log("Constructed URL (joined):", url);

  const headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };
  console.log("Final URL sent to axios:", url);
  console.log("Using token:", process.env.GITHUB_TOKEN.substring(0, 8) + "...");
  console.log("Request headers:", headers);

  try {
    const response = await axios.get(url, { headers });
    console.log("Contents fetched:", response.data.length, "items");
    return response.data;
  } catch (error) {
    console.error("Axios error:", error.message);
    if (error.response && error.response.status === 404) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      if (repo !== sanitizedRepo) {
        console.log("Detected spaces in repo name. Retrying with sanitized repo:", sanitizedRepo);
        try {
          const retryResponse = await axios.get(urlParts.join("/"), { headers });
          console.log("Retry succeeded!");
          return retryResponse.data;
        } catch (retryError) {
          console.error("Retry failed:", retryError.message);
          throw retryError;
        }
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

module.exports = {
  getUsername,
  getUserRepos,
  getRepoContents,
};