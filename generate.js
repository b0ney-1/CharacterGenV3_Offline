const axios = require("axios");
const fs = require("fs");
const { execSync, exec } = require("child_process");
const cliProgress = require("cli-progress");
const path = require("path");
const AWS = require("aws-sdk");
require("dotenv").config(); // Load environment variables from .env file

const PORT = 3030;
const IMAGE_DIR = "./generated_images";
const METADATA_DIR = "./generated_metadata";
const NUMBER_OF_CARDS = 10;
const SERVER_START_COMMAND = "node server.js";
const UPLOAD_BATCH_SIZE = 100; // Adjust based on your system and network

// Storj S3 Gateway configuration
const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT_URL, // Use the endpoint URL from .env file
  accessKeyId: process.env.STORJ_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORJ_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // needed with minio
  signatureVersion: "v4",
});

const BUCKET_NAME = process.env.STORJ_BUCKET_NAME;
const BASE_URL =
  "https://link.storjshare.io/s/jvckcktruijybqbs2esw5olt747a/characters/images/"; // Base URL for images

function killProcessOnPort(port) {
  try {
    console.log(`Checking if port ${port} is in use...`);
    const command =
      process.platform === "win32"
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`;
    const output = execSync(command).toString();
    const lines = output.split("\n");

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const pid =
        process.platform === "win32" ? parts[parts.length - 1] : parts[1];

      if (pid && !isNaN(pid)) {
        console.log(`Killing process with PID ${pid} on port ${port}`);
        const killCommand =
          process.platform === "win32"
            ? `taskkill /PID ${pid} /F`
            : `kill -9 ${pid}`;
        execSync(killCommand);
      }
    });
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
      ACL: "public-read", // Set the file to be publicly readable
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error(`Error uploading file: ${error}`);
    throw error;
  }
}

async function generateCards() {
  [IMAGE_DIR, METADATA_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir);
    }
  });

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(NUMBER_OF_CARDS, 0);

  const cardPromises = Array.from({ length: NUMBER_OF_CARDS }, async (_, i) => {
    const hexValue = ((Math.random() * 0xffffff) << 0)
      .toString(16)
      .padStart(6, "0");
    const imageUrl = `http://localhost:${PORT}/v1/card/seed/${hexValue}/2x.png`;
    const metadataUrl = `http://localhost:${PORT}/v1/seed/${hexValue}/metadata`;

    try {
      const [imageResponse, metadataResponse] = await Promise.all([
        axios.get(imageUrl, { responseType: "arraybuffer" }),
        axios.get(metadataUrl),
      ]);

      const imagePath = path.join(IMAGE_DIR, `${hexValue}.png`);
      const metadataPath = path.join(METADATA_DIR, `${hexValue}.json`);

      fs.writeFileSync(imagePath, imageResponse.data);
      fs.writeFileSync(
        metadataPath,
        JSON.stringify(metadataResponse.data, null, 2)
      );

      progressBar.increment();
    } catch (error) {
      console.error(
        `Failed to generate card ${i + 1}: ${hexValue}`,
        error.message
      );
      progressBar.increment(); // Increment to avoid stalling
    }
  });

  await Promise.all(cardPromises);
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

  const imageUrls = {};

  for (let i = 0; i < files.length; i += UPLOAD_BATCH_SIZE) {
    const batch = files
      .slice(i, i + UPLOAD_BATCH_SIZE)
      .map(async ({ type, file }) => {
        const localPath = path.join(
          type === "image" ? IMAGE_DIR : METADATA_DIR,
          file
        );
        const storjPath = `${type === "image" ? "images" : "metadata"}/${file}`;

        try {
          const storjUrl = await uploadToStorj(localPath, storjPath);
          // Uncomment the following line to log uploaded URLs
          // console.log(`${type} uploaded: ${storjUrl}`);

          if (type === "image") {
            const hexValue = path.basename(file, path.extname(file));
            imageUrls[hexValue] = storjUrl;
          }
        } catch (error) {
          console.error(`Error uploading ${type} ${file}:`, error.message);
        } finally {
          progressBar.increment();
        }
      });

    await Promise.all(batch);
  }

  progressBar.stop();
  console.log(`All files uploaded to Storj`);

  // Update metadata files with the corresponding image URLs
  for (const [hexValue, imageUrl] of Object.entries(imageUrls)) {
    const metadataPath = path.join(METADATA_DIR, `${hexValue}.json`);
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      metadata.image_url = `${BASE_URL}${hexValue}.png`;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      await uploadToStorj(metadataPath, `metadata/${hexValue}.json`);
    }
  }
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
