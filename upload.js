const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const cliProgress = require("cli-progress");
require("dotenv").config();

const ACCESS_GRANT = process.env.STORJ_ACCESS_GRANT;
const BUCKET_NAME = process.env.STORJ_BUCKET_NAME;
const FOLDER_PATH = process.env.FOLDER_PATH;

if (!ACCESS_GRANT || !BUCKET_NAME || !FOLDER_PATH) {
  console.error(
    "Please set STORJ_ACCESS_GRANT, STORJ_BUCKET_NAME, and FOLDER_PATH in your .env file."
  );
  process.exit(1);
}

function uploadFileToStorj(filePath, storjKey) {
  return new Promise((resolve, reject) => {
    const command = `uplink cp "${filePath}" "sj://${BUCKET_NAME}/${storjKey}" --access "${ACCESS_GRANT}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Failed to upload ${storjKey} to Storj: ${error.message}`
        );
        reject(error);
      } else {
        console.log(`Uploaded ${storjKey} to Storj`);
        resolve(stdout);
      }
    });
  });
}

async function uploadFolderToStorj(folderPath) {
  const files = fs.readdirSync(folderPath);
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(files.length, 0);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const storjKey = `uploaded/${file}`; // Adjust this key as needed
    try {
      await uploadFileToStorj(filePath, storjKey);
    } catch (error) {
      console.error(`Error uploading ${file}: ${error.message}`);
    }
    progressBar.increment();
  }

  progressBar.stop();
  console.log("All files uploaded to Storj");
}

uploadFolderToStorj(FOLDER_PATH).catch((error) => {
  console.error("Error uploading folder to Storj:", error.message);
});
