const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
require("dotenv").config();

const git = simpleGit();
const TEMP_DIR = "./temp_upload";
const IMAGE_DIR = "./generated_images";
const METADATA_DIR = "./generated_metadata";
const REPO_URL = process.env.GIT_REPO_URL;

// Function to initialize and configure the Git repository
async function initGitRepo() {
  try {
    // Remove temp directory if it exists
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log(`Deleted existing ${TEMP_DIR} directory.`);
    }

    // Create a new temp directory
    fs.mkdirSync(TEMP_DIR);
    console.log(`Created new ${TEMP_DIR} directory.`);

    // Change to the temp directory
    process.chdir(TEMP_DIR);

    // Initialize a new Git repository
    await git.init();
    console.log("Initialized a new Git repository.");

    // Check if the remote origin already exists
    const remotes = await git.getRemotes();
    if (
      remotes.length === 0 ||
      !remotes.find((remote) => remote.name === "origin")
    ) {
      // Add the remote origin if it doesn't exist
      await git.addRemote("origin", REPO_URL);
      console.log(`Added remote origin: ${REPO_URL}`);
    } else {
      console.log("Remote origin already exists.");
    }
  } catch (error) {
    console.error("Error initializing Git repository:", error.message);
  }
}

// Function to copy the folders to the temp directory
function copyFiles() {
  try {
    if (fs.existsSync(IMAGE_DIR)) {
      fs.cpSync(IMAGE_DIR, path.join(TEMP_DIR, "generated_images"), {
        recursive: true,
      });
      console.log("Copied images to temp directory.");
    } else {
      console.log("Image directory does not exist.");
    }

    if (fs.existsSync(METADATA_DIR)) {
      fs.cpSync(METADATA_DIR, path.join(TEMP_DIR, "generated_metadata"), {
        recursive: true,
      });
      console.log("Copied metadata to temp directory.");
    } else {
      console.log("Metadata directory does not exist.");
    }
  } catch (error) {
    console.error("Error copying files:", error.message);
  }
}

// Function to commit and push the changes
async function commitAndPush() {
  try {
    await git.add("./*"); // Add all files including folders
    await git.commit("Add generated images and metadata");
    await git.push("origin", "main"); // Change 'main' to the desired branch if necessary
    console.log("Changes pushed to remote repository.");
  } catch (error) {
    console.error("Error committing or pushing files:", error.message);
  }
}

async function main() {
  try {
    await initGitRepo();
    copyFiles();
    await commitAndPush();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
