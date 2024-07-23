const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();

const TEMP_DIR = path.resolve(__dirname, "temp_upload");
const IMAGES_DIR = path.resolve(__dirname, "generated_images");
const METADATA_DIR = path.resolve(__dirname, "generated_metadata");
const REPO_URL = process.env.GIT_REPO_URL;

if (!REPO_URL) {
  console.error("GIT_REPO_URL not set in .env file");
  process.exit(1);
}

function runCommand(command) {
  console.log(`Running command: ${command}`);
  execSync(command, { stdio: "inherit" });
}

function checkDirExists(dir) {
  return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
}

function initGitRepo() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log(`Deleted existing ${TEMP_DIR} directory.`);
  }

  fs.mkdirSync(TEMP_DIR, { recursive: true });
  console.log(`Created new ${TEMP_DIR} directory.`);

  process.chdir(TEMP_DIR);

  runCommand("git init");
  console.log("Initialized a new Git repository.");

  try {
    const remotes = execSync("git remote -v", { encoding: "utf8" }).trim();
    if (remotes.includes("origin")) {
      runCommand("git remote remove origin");
      console.log("Removed existing remote origin.");
    }
  } catch (error) {
    console.log("No existing remote origin found.");
  }

  runCommand(`git remote add origin ${REPO_URL}`);
  console.log(`Added remote origin: ${REPO_URL}`);

  try {
    runCommand("git fetch");
    console.log("Fetched from remote repository.");
  } catch (error) {
    console.log("Failed to fetch from remote repository.");
  }
}

function copyDirectories() {
  if (!checkDirExists(IMAGES_DIR)) {
    console.error("Image directory does not exist or is empty.");
    process.exit(1);
  }
  if (!checkDirExists(METADATA_DIR)) {
    console.error("Metadata directory does not exist or is empty.");
    process.exit(1);
  }

  // Ensure that directories are copied correctly without nesting
  fs.cpSync(IMAGES_DIR, path.join(TEMP_DIR, "generated_images"), {
    recursive: true,
  });
  fs.cpSync(METADATA_DIR, path.join(TEMP_DIR, "generated_metadata"), {
    recursive: true,
  });

  console.log("Copied images and metadata to temporary directory.");
}

function commitAndPush() {
  process.chdir(TEMP_DIR);

  runCommand("git add .");
  runCommand('git commit -m "Add images and metadata"');

  try {
    runCommand("git push --set-upstream origin master");
    console.log("Pushed changes to remote repository.");
  } catch (error) {
    console.error("Error committing or pushing files:", error.message);
    process.exit(1);
  }
}

function main() {
  initGitRepo();
  copyDirectories();
  commitAndPush();
}

main();
