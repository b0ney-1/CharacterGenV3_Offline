const axios = require("axios");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const cliProgress = require("cli-progress");
const path = require("path");
const AWS = require("aws-sdk");
require("dotenv").config(); // Load environment variables from .env file

const PORT = 3030;
const IMAGE_DIR = "./generated_images";
const METADATA_DIR = "./generated_metadata";
const NUMBER_OF_CARDS = 100; // Set this to 20000 for your actual use case
const SERVER_START_COMMAND = "node server.js";
const UPLOAD_BATCH_SIZE = 50; // Adjust based on your system and network

// Storj S3 Gateway configuration
const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT_URL, // Use the endpoint URL from .env file
  accessKeyId: process.env.STORJ_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORJ_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // needed with minio
  signatureVersion: "v4",
});

const BUCKET_NAME = process.env.STORJ_BUCKET_NAME;

function killProcessOnPort(port) {
  try {
    console.log(`Checking if port ${port} is in use...`);
    let command;

    if (process.platform === "win32") {
      command = `netstat -ano | findstr :${port}`;
      const output = execSync(command).toString();
      const lines = output.split("\n");
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          console.log(`Killing process with PID ${pid} on port ${port}`);
          execSync(`taskkill /PID ${pid} /F`);
        }
      });
    } else {
      command = `lsof -i :${port}`;
      const output = execSync(command).toString();
      const lines = output.split("\n");
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        if (pid && !isNaN(pid)) {
          console.log(`Killing process with PID ${pid} on port ${port}`);
          execSync(`kill -9 ${pid}`);
        }
      });
    }
  } catch (error) {
    console.log(`No process found running on port ${port}`);
  }
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log("Starting server...");
    const server = exec(SERVER_START_COMMAND, (error, stdout, stderr) => {
      if (error) {
        console.error(`Server error: ${error.message}`);
        reject(error);
      }
      if (stderr) {
        console.error(`Server stderr: ${stderr}`);
        reject(stderr);
      }
      console.log("Server started successfully.");
      resolve(server);
    });

    setTimeout(() => {
      console.log("Waiting for server to start...");
      resolve(server);
    }, 5000); // Give the server some time to start
  });
}

async function stopServer() {
  try {
    console.log("Stopping server...");
    const fetchModule = await import("node-fetch");
    const fetch = fetchModule.default; // Use the default export
    await fetch(`http://localhost:${PORT}/stop`, { method: "POST" });
    console.log("Server stopped successfully.");
  } catch (error) {
    console.error("Failed to stop server:", error.message);
  }
}

async function uploadToStorj(localPath, storjPath) {
  try {
    const fileStream = fs.createReadStream(localPath);
    const params = {
      Bucket: BUCKET_NAME,
      Key: storjPath,
      Body: fileStream,
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error(`Error uploading file: ${error}`);
    throw error;
  }
}

async function generateCards() {
  if (!fs.existsSync(IMAGE_DIR)) {
    console.log(`Creating directory: ${IMAGE_DIR}`);
    fs.mkdirSync(IMAGE_DIR);
  }

  if (!fs.existsSync(METADATA_DIR)) {
    console.log(`Creating directory: ${METADATA_DIR}`);
    fs.mkdirSync(METADATA_DIR);
  }

  // Initialize the progress bar
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(NUMBER_OF_CARDS, 0);

  const cardPromises = [];

  for (let i = 0; i < NUMBER_OF_CARDS; i++) {
    const hexValue = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, "0");
    const imageUrl = `http://localhost:${PORT}/v1/card/seed/${hexValue}/2x.png`;
    const metadataUrl = `http://localhost:${PORT}/v1/seed/${hexValue}/metadata`;

    cardPromises.push(
      (async () => {
        try {
          const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });
          const metadataResponse = await axios.get(metadataUrl);

          const imagePath = path.join(IMAGE_DIR, `${hexValue}.png`);
          const metadataPath = path.join(METADATA_DIR, `${hexValue}.json`);

          fs.writeFileSync(imagePath, imageResponse.data);
          fs.writeFileSync(
            metadataPath,
            JSON.stringify(metadataResponse.data, null, 2)
          );
        } catch (error) {
          console.error(
            `Failed to generate card ${i + 1}: ${hexValue}`,
            error.message
          );
        }

        // Update the progress bar
        progressBar.update(progressBar.value + 1);
      })()
    );
  }

  await Promise.all(cardPromises);

  // Stop the progress bar
  progressBar.stop();

  console.log(`All cards and metadata files generated`);
}

async function uploadFiles() {
  const files = fs
    .readdirSync(IMAGE_DIR)
    .map((file) => ({ type: "image", file }))
    .concat(
      fs.readdirSync(METADATA_DIR).map((file) => ({ type: "metadata", file }))
    );

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(files.length, 0);

  const uploadPromises = [];
  for (const file of files) {
    uploadPromises.push(
      (async () => {
        try {
          const localPath =
            file.type === "image"
              ? path.join(IMAGE_DIR, file.file)
              : path.join(METADATA_DIR, file.file);
          const storjPath =
            file.type === "image"
              ? `images/${file.file}`
              : `metadata/${file.file}`;

          const storjUrl = await uploadToStorj(localPath, storjPath);
          // console.log(`${file.type} uploaded: ${storjUrl}`);
          progressBar.increment();
        } catch (error) {
          console.error(`Error uploading ${file.type} ${file.file}:`, error);
          progressBar.increment(); // Increment to avoid stalling
        }
      })()
    );
  }

  await Promise.all(uploadPromises);
  progressBar.stop();

  console.log(`All files uploaded to Storj`);
}

async function main() {
  try {
    killProcessOnPort(PORT);
    await startServer();
    console.log("Server started");
    await generateCards();
    console.log("All cards generated and saved");
    await stopServer();
    await uploadFiles();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
