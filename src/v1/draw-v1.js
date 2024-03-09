// Node Module Imports
const { createCanvas, loadImage } = require("canvas");

// Asset Imports
const artAssets = require("../../assets/attributes/art/art.json");
const utils = require("../utils");
const metadata = require("../metadata");

// Card PNG Stream
const drawCharacterStream = async (scale, character) => {
  const characterCanvas = await drawCard(scale, character);
  return characterCanvas.createPNGStream();
};
// Full Card PNG Stream
const drawCharacterCardFullStream = async (scale, character) => {
  const characterCanvas = await drawCardWithFullInfo(scale, character);
  return characterCanvas.createPNGStream();
};

// Card Generate Image base64 URL
const getTokenURL = async (scale, character) => {
  const characterCanvas = await drawCard(scale, character);
  const dataURL = characterCanvas.toDataURL("image/png");
  return dataURL;
};

// Sprite PNG Stream
const drawSpriteStream = async (scale, character) => {
  const characterCanvas = await drawSprite(scale, character);
  return characterCanvas.createPNGStream();
};

// Sprite Generate Image base64 URL
const getSpriteURL = async (scale, character) => {
  const characterCanvas = await drawSprite(scale, character);
  const dataURL = characterCanvas.toDataURL("image/png");
  return dataURL;
};

// Weapon PNG Stream
const drawWeaponStream = async (scale, character) => {
  const weaponCanvas = await drawWeapon(scale, character);
  return weaponCanvas.createPNGStream();
};

// Weapon Generate Image base64 URL
const getWeaponURL = async (scale, character) => {
  const weaponCanvas = await drawWeapon(scale, character);
  const dataURL = weaponCanvas.toDataURL("image/png");
  return dataURL;
};

// Draw Characters Weapon Sprite only
const drawWeapon = async (scale, character) => {
  const canvas = createCanvas(32 * scale, 32 * scale);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const img = await loadImage(character.weapon.src);
  ctx.drawImage(img, -8 * scale, 0 * scale, 32 * scale, 32 * scale);
  return canvas;
};

// Draw Characters Sprite only
const drawSprite = async (scale, character) => {
  const canvas = createCanvas(32 * scale, 32 * scale);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Character layers
  var layers = [
    character.body,
    character.eyes,
    character.hair,
    character.chest,
    character.legs,
    character.facialHair,
    character.weapon,
  ];

  for (let i = 0; i < layers.length; i++) {
    const img = await loadImage(layers[i].src);
    ctx.drawImage(img, 0 * scale, 0 * scale, 32 * scale, 32 * scale);
  }
  return canvas;
};

// Draws the charcter card
const drawCard = async (scale, character) => {
  const canvas = createCanvas(428 * scale, 300 * scale);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 204 * scale, 204 * scale);
  ctx.fillStyle = "#fff";

  const statScore =
    character.str +
    character.dex +
    character.wis +
    character.int +
    character.cha +
    character.con;

  // Background Fill
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, 428 * scale, 300 * scale);

  // Character Image Fill
  var grd = ctx.createRadialGradient(
    (204 / 2) * scale,
    (204 / 2) * scale,
    5 * scale,
    (204 / 2) * scale,
    (204 / 2) * scale,
    204 * scale
  );
  const color = utils.getBackgroundColor(character);
  grd.addColorStop(0, "#555"); //  was #999  #84cae3 #555
  grd.addColorStop(1, "#000");
  ctx.fillStyle = grd; // '#000'
  ctx.fillRect(10 * scale, 10 * scale, 204 * scale, 204 * scale);

  const fontSize = 8 * scale.toString();

  ctx.fillStyle = "#fff";
  ctx.font = "" + fontSize + "px 'Press Start 2P'";

  ctx.fillText("Name: " + character.name, 10 * scale, (300 - 70) * scale);

  if (character.sex === "Male") {
    const sexArt = await loadImage(artAssets[8].src);
    ctx.drawImage(
      sexArt,
      85 * scale,
      (300 - 65) * scale,
      10 * scale,
      10 * scale
    );
  } else if (character.sex === "Female") {
    const sexArt = await loadImage(artAssets[9].src);
    ctx.drawImage(
      sexArt,
      100 * scale,
      (300 - 65) * scale,
      10 * scale,
      10 * scale
    );
  }
  ctx.fillText("Sex: " + character.sex, 10 * scale, (300 - 55) * scale);
  ctx.fillText("Race: " + character.race, 10 * scale, (300 - 40) * scale);
  ctx.fillText("Class: " + character.class, 10 * scale, (300 - 25) * scale);
  ctx.fillText("Height: " + character.height, 10 * scale, (300 - 10) * scale);

  // Level
  const levelArt = await loadImage(artAssets[10].src);
  ctx.drawImage(
    levelArt,
    (428 / 2 + 15) * scale,
    5 * scale,
    20 * scale,
    20 * scale
  );
  ctx.fillText("Level: " + statScore, (428 / 2 + 40) * scale, 20 * scale);

  const hpArt = await loadImage(artAssets[0].src);
  ctx.drawImage(
    hpArt,
    (428 / 2 + 15) * scale,
    35 * scale,
    20 * scale,
    20 * scale
  ); // 5
  ctx.fillText("HP: " + character.hp, (428 / 2 + 40) * scale, 50 * scale); // 20

  const strArt = await loadImage(artAssets[2].src);
  ctx.drawImage(
    strArt,
    (428 / 2 + 20) * scale,
    65 * scale,
    15 * scale,
    15 * scale
  ); // 35
  ctx.fillText("STR: " + character.str, (428 / 2 + 40) * scale, 80 * scale); // 50

  const dexArt = await loadImage(artAssets[3].src);
  ctx.drawImage(
    dexArt,
    (428 / 2 + 115) * scale,
    65 * scale,
    15 * scale,
    15 * scale
  ); // 35
  ctx.fillText("DEX: " + character.dex, (428 / 2 + 135) * scale, 80 * scale); // 50

  const conArt = await loadImage(artAssets[4].src);
  ctx.drawImage(
    conArt,
    (428 / 2 + 20) * scale,
    95 * scale,
    15 * scale,
    15 * scale
  ); // 65
  ctx.fillText("CON: " + character.con, (428 / 2 + 40) * scale, 110 * scale); // 80

  const intArt = await loadImage(artAssets[6].src);
  ctx.drawImage(
    intArt,
    (428 / 2 + 115) * scale,
    95 * scale,
    15 * scale,
    15 * scale
  ); // 65
  ctx.fillText("INT: " + character.int, (428 / 2 + 135) * scale, 110 * scale); // 80

  const wisArt = await loadImage(artAssets[5].src);
  ctx.drawImage(
    wisArt,
    (428 / 2 + 20) * scale,
    120 * scale,
    15 * scale,
    15 * scale
  ); // 95
  ctx.fillText("WIS: " + character.wis, (428 / 2 + 40) * scale, 135 * scale); // 110

  const chaArt = await loadImage(artAssets[7].src);
  ctx.drawImage(
    chaArt,
    (428 / 2 + 115) * scale,
    120 * scale,
    15 * scale,
    15 * scale
  ); // 95
  ctx.fillText("CHA: " + character.cha, (428 / 2 + 135) * scale, 135 * scale); // 110

  ctx.fillText(
    "Stat Modifier: " +
      character.statModifier +
      "(+" +
      character.statModifierValue +
      ")",
    (428 / 2 + 20) * scale,
    160 * scale
  ); //135

  // ctx.fillText("Zechrium: " + character.coins + " Zech", (428 / 2 + 20) * scale, 180 * scale); // 180

  // Character Background
  ctx.fillText(
    "Background: " + character.background.background,
    (428 / 2 + 20) * scale,
    180 * scale
  ); // 160

  // Weapon Information
  ctx.fillText("Weapon Information:", (428 / 2 + 20) * scale, 215 * scale);

  ctx.fillText(
    "Type: " + character.weapon.type,
    (428 / 2 + 20) * scale,
    235 * scale
  );
  ctx.fillText(
    "Damage: " + character.weapon.damage,
    (428 / 2 + 20) * scale,
    250 * scale
  );
  // Get modifier
  ctx.fillText(
    "Modifier: (+" + character.weapon.modifier + ")",
    (428 / 2 + 20) * scale,
    265 * scale
  );
  ctx.fillText(
    "Elemental: " + character.weapon.elemental,
    (428 / 2 + 20) * scale,
    280 * scale
  );

  // Draw Card Trim
  ctx.beginPath();
  ctx.lineWidth = 5 * scale;
  ctx.strokeStyle = utils.trimColor(statScore);
  ctx.rect(0, 0, 428 * scale, 300 * scale);
  ctx.stroke();

  // Draw Weapon Trim
  ctx.beginPath();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = utils.trimColorWeapon(character.weapon.chance);
  ctx.rect(
    (428 / 2 + 10) * scale,
    (300 / 2 + 45) * scale,
    (428 / 2 - 20) * scale,
    (300 / 2 - 55) * scale
  );
  ctx.stroke();

  // Draw Image Canvas
  ctx.beginPath();
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = "#ffffff";
  ctx.rect(10 * scale, 10 * scale, 204 * scale, 204 * scale);
  ctx.stroke();

  var layers = [
    character.body,
    character.eyes,
    character.hair,
    character.chest,
    character.legs,
    character.facialHair,
    character.weapon,
  ];

  for (let i = 0; i < layers.length; i++) {
    const img = await loadImage(layers[i].src);
    ctx.drawImage(img, 10 * scale, 10 * scale, 204 * scale, 204 * scale);
  }

  // Draw Armor Class
  const acArt = await loadImage(artAssets[1].src);
  ctx.drawImage(
    acArt,
    (428 / 2 + 110) * scale,
    35 * scale,
    20 * scale,
    20 * scale
  ); // 20

  ctx.fillText("AC: " + character.ac, (428 / 2 + 135) * scale, 50 * scale); // 20

  return canvas;
};

// Draws the charcter card
const drawCardWithFullInfo = async (scale, character) => {
  const canvas = createCanvas(428 * scale, 600 * scale);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 204 * scale, 204 * scale);
  ctx.fillStyle = "#fff";

  const statScore =
    character.str +
    character.dex +
    character.wis +
    character.int +
    character.cha +
    character.con;

  // Background Fill
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, 428 * scale, 600 * scale);

  // Character Image Fill
  var grd = ctx.createRadialGradient(
    (204 / 2) * scale,
    (204 / 2) * scale,
    5 * scale,
    (204 / 2) * scale,
    (204 / 2) * scale,
    204 * scale
  );
  const color = utils.getBackgroundColor(character);
  grd.addColorStop(0, "#555"); //  was #999  #84cae3 #555
  grd.addColorStop(1, "#000");
  ctx.fillStyle = grd; // '#000'
  ctx.fillRect(10 * scale, 10 * scale, 204 * scale, 204 * scale);

  const fontSize = 16 * scale.toString();

  ctx.fillStyle = "#fff";
  ctx.font = "" + fontSize + "px 'Press Start 2P'";

  ctx.fillText("Name: " + character.name, 10 * scale, (300 - 70) * scale);

  if (character.sex === "Male") {
    const sexArt = await loadImage(artAssets[8].src);
    ctx.drawImage(
      sexArt,
      85 * scale,
      (300 - 65) * scale,
      10 * scale,
      10 * scale
    );
  } else if (character.sex === "Female") {
    const sexArt = await loadImage(artAssets[9].src);
    ctx.drawImage(
      sexArt,
      100 * scale,
      (300 - 65) * scale,
      10 * scale,
      10 * scale
    );
  }
  ctx.fillText("Sex: " + character.sex, 10 * scale, (300 - 55) * scale);
  ctx.fillText("Race: " + character.race, 10 * scale, (300 - 40) * scale);
  ctx.fillText("Class: " + character.class, 10 * scale, (300 - 25) * scale);
  ctx.fillText("Height: " + character.height, 10 * scale, (300 - 10) * scale);

  // Level
  const levelArt = await loadImage(artAssets[10].src);
  ctx.drawImage(
    levelArt,
    (428 / 2 + 15) * scale,
    5 * scale,
    20 * scale,
    20 * scale
  );
  ctx.fillText("Level: " + statScore, (428 / 2 + 40) * scale, 20 * scale);

  const hpArt = await loadImage(artAssets[0].src);
  ctx.drawImage(
    hpArt,
    (428 / 2 + 15) * scale,
    35 * scale,
    20 * scale,
    20 * scale
  ); // 5
  ctx.fillText("HP: " + character.hp, (428 / 2 + 40) * scale, 50 * scale); // 20

  const strArt = await loadImage(artAssets[2].src);
  ctx.drawImage(
    strArt,
    (428 / 2 + 20) * scale,
    65 * scale,
    15 * scale,
    15 * scale
  ); // 35
  ctx.fillText("STR: " + character.str, (428 / 2 + 40) * scale, 80 * scale); // 50

  const dexArt = await loadImage(artAssets[3].src);
  ctx.drawImage(
    dexArt,
    (428 / 2 + 115) * scale,
    65 * scale,
    15 * scale,
    15 * scale
  ); // 35
  ctx.fillText("DEX: " + character.dex, (428 / 2 + 135) * scale, 80 * scale); // 50

  const conArt = await loadImage(artAssets[4].src);
  ctx.drawImage(
    conArt,
    (428 / 2 + 20) * scale,
    95 * scale,
    15 * scale,
    15 * scale
  ); // 65
  ctx.fillText("CON: " + character.con, (428 / 2 + 40) * scale, 110 * scale); // 80

  const intArt = await loadImage(artAssets[6].src);
  ctx.drawImage(
    intArt,
    (428 / 2 + 115) * scale,
    95 * scale,
    15 * scale,
    15 * scale
  ); // 65
  ctx.fillText("INT: " + character.int, (428 / 2 + 135) * scale, 110 * scale); // 80

  const wisArt = await loadImage(artAssets[5].src);
  ctx.drawImage(
    wisArt,
    (428 / 2 + 20) * scale,
    120 * scale,
    15 * scale,
    15 * scale
  ); // 95
  ctx.fillText("WIS: " + character.wis, (428 / 2 + 40) * scale, 135 * scale); // 110

  const chaArt = await loadImage(artAssets[7].src);
  ctx.drawImage(
    chaArt,
    (428 / 2 + 115) * scale,
    120 * scale,
    15 * scale,
    15 * scale
  ); // 95
  ctx.fillText("CHA: " + character.cha, (428 / 2 + 135) * scale, 135 * scale); // 110

  ctx.fillText(
    "Stat Modifier: " +
      character.statModifier +
      "(+" +
      character.statModifierValue +
      ")",
    (428 / 2 + 20) * scale,
    160 * scale
  ); //135

  // ctx.fillText("Zechrium: " + character.coins + " Zech", (428 / 2 + 20) * scale, 180 * scale); // 180

  // Character Background
  ctx.fillText(
    "Background: " + character.background.background,
    (428 / 2 + 20) * scale,
    180 * scale
  ); // 160

  // Weapon Information
  ctx.fillText("Weapon Information:", (428 / 2 + 20) * scale, 215 * scale);

  ctx.fillText(
    "Type: " + character.weapon.type,
    (428 / 2 + 20) * scale,
    235 * scale
  );
  ctx.fillText(
    "Damage: " + character.weapon.damage,
    (428 / 2 + 20) * scale,
    250 * scale
  );
  // Get modifier
  ctx.fillText(
    "Modifier: (+" + character.weapon.modifier + ")",
    (428 / 2 + 20) * scale,
    265 * scale
  );
  ctx.fillText(
    "Elemental: " + character.weapon.elemental,
    (428 / 2 + 20) * scale,
    280 * scale
  );

  // Draw Card Trim
  ctx.beginPath();
  ctx.lineWidth = 5 * scale;
  ctx.strokeStyle = utils.trimColor(statScore);
  ctx.rect(0, 0, 428 * scale, 600 * scale);
  ctx.stroke();

  // Draw Weapon Trim
  ctx.beginPath();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = utils.trimColorWeapon(character.weapon.chance);
  ctx.rect(
    (428 / 2 + 10) * scale,
    (300 / 2 + 45) * scale,
    (428 / 2 - 20) * scale,
    (300 / 2 - 55) * scale
  );
  ctx.stroke();

  // Draw Image Canvas
  ctx.beginPath();
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = "#ffffff";
  ctx.rect(10 * scale, 10 * scale, 204 * scale, 204 * scale);
  ctx.stroke();

  var layers = [
    character.body,
    character.eyes,
    character.hair,
    character.chest,
    character.legs,
    character.facialHair,
    character.weapon,
  ];

  for (let i = 0; i < layers.length; i++) {
    const img = await loadImage(layers[i].src);
    ctx.drawImage(img, 10 * scale, 10 * scale, 204 * scale, 204 * scale);
  }

  // Draw Armor Class
  const acArt = await loadImage(artAssets[1].src);
  ctx.drawImage(
    acArt,
    (428 / 2 + 110) * scale,
    35 * scale,
    20 * scale,
    20 * scale
  ); // 20

  ctx.fillText("AC: " + character.ac, (428 / 2 + 135) * scale, 50 * scale); // 20

  // Bottom of Card

  const maxWidth = 395; // Maximum width for a single line

  ctx.fillText("Backgroud Story:", 20, 330);

  const text = character.description;
  const x = 20;
  const y = 350;
  const lineHeight = 15; // Adjust as needed

  wrapText(text, x, y, maxWidth);

  function wrapText(text, x, y, maxWidth) {
    const words = text.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + " ";
        y += lineHeight; // Adjust the line height as needed
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y);
  }

  // Draw Card Trim
  ctx.beginPath();
  ctx.lineWidth = 1 * scale;
  ctx.strokeStyle = utils.trimColor(statScore);
  ctx.rect(10, 310, 408 * scale, 280 * scale);
  ctx.stroke();

  return canvas;
};

// Exports
module.exports = {
  drawCharacterStream,
  drawCharacterCardFullStream,
  getTokenURL,
  drawSpriteStream,
  getSpriteURL,
  drawWeaponStream,
  getWeaponURL,
};
