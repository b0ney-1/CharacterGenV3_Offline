require("dotenv").config();
const express = require("express");
const path = require("path");
const { registerFont } = require("canvas");

registerFont(__dirname + "/assets/Press_Start_2P/PressStart2P-Regular.ttf", {
  family: "Press Start 2P",
  Style: "Regular",
});

// Code File Imports
const generator = require("./src/v1/generate-v1");
const metadata = require("./src/metadata");
const draw = require("./src/v1/draw-v1");
const characters = require("./src/v1/characters.json");

// API Server Info
const app = express();
const port = process.env.PORT || 3030;

// CORs Headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Link CSS and script files
app.use("/", express.static(__dirname + "/assets/"));

// *********************************** //
// Home URL
// *********************************** //

app.get("/", (req, res) => {
  res.send("Server is running");
});

// *********************************** //
// Version 1 Routes
// *********************************** //

// Draw Character Card Based on Seed
app.get(
  `/v1/card/seed/:seed([a-zA-Z0-9]+)/:scale([0-9]+)x.png`,
  async (req, res) => {
    const seed = req.params.seed;
    const scale = req.params.scale;
    if (scale > 0 && scale <= 5) {
      res.type("png");
      const stream = await draw.drawCharacterStream(
        scale,
        await generator.generateRandom(seed)
      );
      stream.pipe(res);
    } else {
      res.status(404).json("Not Found");
    }
  }
);

// Draw Full Character Card Based on Seed
app.get(
  `/v1/fullcard/seed/:seed([a-zA-Z0-9]+)/:scale([0-9]+)x.png`,
  async (req, res) => {
    const seed = req.params.seed;
    const scale = req.params.scale;
    if (scale > 0 && scale <= 5) {
      res.type("png");
      const stream = await draw.drawCharacterCardFullStream(
        scale,
        await generator.generateRandom(seed)
      );
      stream.pipe(res);
    } else {
      res.status(404).json("Not Found");
    }
  }
);

// Get Character Metadata Based on Seed
app.get(`/v1/seed/:seed([a-zA-Z0-9]+)/metadata`, async (req, res) => {
  const seed = req.params.seed;
  res.header("Content-Type", "application/json");
  res.send(metadata.getMetadata(0, await generator.generateRandom(seed)));
});

app.post("/stop", (req, res) => {
  console.log("Stopping server...");
  res.send("Server stopping...");
  process.exit();
});

// Server Listen
app.listen(port, () => {
  console.log(`API is listening on port ${port}`);
});
