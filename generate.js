const axios = require("axios");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const cliProgress = require("cli-progress");
const path = require("path");
const pinataSDK = require("@pinata/sdk");
require("dotenv").config(); // Load environment variables from .env file

const PORT = 3030;
const IMAGE_DIR = "./generated_images";
const METADATA_DIR = "./generated_metadata";
const NUMBER_OF_CARDS = 100;
const SERVER_START_COMMAND = "node server.js";

// Initialize Pinata Client with API keys
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

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
    const fetch = fetchModule.default;
    await fetch(`http://localhost:${PORT}/stop`, { method: "POST" });
    console.log("Server stopped successfully.");
  } catch (error) {
    console.error("Failed to stop server:", error.message);
  }
}

async function uploadBatch(directory, batchSize, progressBar) {
  const files = fs.readdirSync(directory);
  let index = 0;

  while (index < files.length) {
    const batch = files.slice(index, index + batchSize);
    const uploadPromises = batch.map(async (file) => {
      const filePath = path.join(directory, file);
      const fileStream = fs.createReadStream(filePath);
      const options = {
        pinataMetadata: {
          name: file,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      try {
        const response = await pinata.pinFileToIPFS(fileStream, options);
        // console.log(`Uploaded ${file}: ${response.IpfsHash}`);
      } catch (error) {
        console.error(`Error uploading ${file}:`, error);
      }
    });

    // Process the batch
    await Promise.all(uploadPromises);

    // Update the progress bar
    progressBar.update(Math.min(index + batchSize, files.length));

    // Move to the next batch
    index += batchSize;
  }

  // Stop the progress bar
  progressBar.stop();
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

  // Initialize the progress bar for card generation
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(NUMBER_OF_CARDS, 0);

  for (let i = 0; i < NUMBER_OF_CARDS; i++) {
    const hexValue = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, "0");
    const imageUrl = `http://localhost:${PORT}/v1/card/seed/${hexValue}/2x.png`;
    const metadataUrl = `http://localhost:${PORT}/v1/seed/${hexValue}/metadata`;

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
    progressBar.update(i + 1);
  }

  // Stop the progress bar
  progressBar.stop();

  console.log(`All cards and metadata files saved`);

  // Initialize progress bars for upload
  const imageUploadProgressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  const metadataUploadProgressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  // Upload images and metadata
  imageUploadProgressBar.start(fs.readdirSync(IMAGE_DIR).length, 0);
  await uploadBatch(IMAGE_DIR, 50, imageUploadProgressBar); // Adjust batchSize as needed

  metadataUploadProgressBar.start(fs.readdirSync(METADATA_DIR).length, 0);
  await uploadBatch(METADATA_DIR, 50, metadataUploadProgressBar); // Adjust batchSize as needed
}

async function main() {
  try {
    killProcessOnPort(PORT);
    await startServer();
    console.log("Server started");
    await generateCards();
    console.log("All cards generated, saved, and uploaded");
    await stopServer();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
