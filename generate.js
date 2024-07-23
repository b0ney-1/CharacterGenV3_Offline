const axios = require("axios");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const cliProgress = require("cli-progress");
const path = require("path");

const PORT = 3030;
const IMAGE_DIR = "./generated_images";
const METADATA_DIR = "./generated_metadata"; // New directory for metadata files
const NUMBER_OF_CARDS = 10;
const SERVER_START_COMMAND = "node server.js";

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

  for (let i = 1; i <= NUMBER_OF_CARDS; i++) {
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

      // Create the metadata object based on the template
      const metadata = {
        name: `${metadataResponse.data.name} #${i}`,
        description: metadataResponse.data.description,
        image: "", // Set image attribute to an empty string
        attributes: [
          { trait_type: "Race", value: metadataResponse.data.race },
          { trait_type: "Class", value: metadataResponse.data.class },
          { trait_type: "Sex", value: metadataResponse.data.sex },
          { trait_type: "Height", value: metadataResponse.data.height },
          {
            trait_type: "Background",
            value: metadataResponse.data.background.background,
          },
          { trait_type: "Body", value: metadataResponse.data.body.name },
          { trait_type: "Eyes", value: metadataResponse.data.eyes.name },
          { trait_type: "Hair", value: metadataResponse.data.hair.name },
          { trait_type: "Chest", value: metadataResponse.data.chest.name },
          { trait_type: "Legs", value: metadataResponse.data.legs.name },
          {
            trait_type: "Facial Hair",
            value: metadataResponse.data.facialHair.name,
          },
          { trait_type: "Weapon", value: metadataResponse.data.weapon.name },
          {
            trait_type: "Weapon Element",
            value: metadataResponse.data.weapon.elemental,
          },
          { trait_type: "HP", value: metadataResponse.data.hp },
          { trait_type: "AC", value: metadataResponse.data.ac },
          { trait_type: "STR", value: metadataResponse.data.str },
          { trait_type: "DEX", value: metadataResponse.data.dex },
          { trait_type: "CON", value: metadataResponse.data.con },
          { trait_type: "INT", value: metadataResponse.data.int },
          { trait_type: "WIS", value: metadataResponse.data.wis },
          { trait_type: "CHA", value: metadataResponse.data.cha },
          { trait_type: "Coins", value: metadataResponse.data.coins },
        ],
      };

      const imagePath = path.join(IMAGE_DIR, `${i}.png`);
      const metadataPath = path.join(METADATA_DIR, `${i}.json`);

      fs.writeFileSync(imagePath, imageResponse.data);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error(`Failed to generate card ${i}: ${error.message}`);
    }

    // Update the progress bar
    progressBar.update(i);
  }

  // Stop the progress bar
  progressBar.stop();

  console.log(`All cards and metadata files saved`);
}

async function main() {
  try {
    killProcessOnPort(PORT);
    await startServer();
    console.log("Server started");
    await generateCards();
    console.log("All cards generated and saved");
    await stopServer();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
