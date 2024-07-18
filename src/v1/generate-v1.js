// Node Module Imports
// Code File Imports
const utils = require("../utils");
const { sha3_256 } = require("js-sha3");
const draw_v1 = require("./draw-v1");

// Asset Imports
const bowsInfo = require("../../assets/v1-art/weapons/bows.json");
const staffsInfo = require("../../assets/v1-art/weapons/staffs.json");
const daggersInfo = require("../../assets/v1-art/weapons/daggers.json");
const swordsInfo = require("../../assets/v1-art/weapons/swords.json");
const chestInfo = require("../../assets/v1-art/shirts/chest.json");
const legInfo = require("../../assets/v1-art/legs/leg.json");
const bodyInfo = require("../../assets/v1-art/body/body.json");
const eyeInfo = require("../../assets/v1-art/eyes/eye.json");
const hairInfo = require("../../assets/v1-art/hair/hair.json");
const facialHairInfo = require("../../assets/v1-art/facial-hair/facial-hair.json");
const maleFirstNames = require("../../assets/attributes/firstNameMale.json");
const femaleFirstNames = require("../../assets/attributes/firstNameFemale.json");
const lastNames = require("../../assets/attributes/LastName.json");
const sex = require("../../assets/attributes/sex.json");
const classes = require("../../assets/attributes/classes.json");
const backgroundInfo = require("../../assets/attributes/background.json");

// ******************************************//
// Generate Methods for Characters/ NPC's
// ******************************************//

// Generate random character
const generateRandom = async (seed) => {
  // Hash the seed with the SHA256 Algorithm
  let lastRand = {
    v: sha3_256(seed).slice(-64),
  };

  var con = utils.rollStat(lastRand);
  var sexVal = sex[Math.floor(utils.getRand(lastRand, 0, sex.length))];
  var classVal =
    classes[Math.floor(utils.getRand(lastRand, 0, classes.length))];

  if (sexVal === "Male") {
    var name =
      maleFirstNames[
        Math.floor(utils.getRand(lastRand, 0, maleFirstNames.length))
      ] +
      " " +
      lastNames[Math.floor(utils.getRand(lastRand, 0, lastNames.length))];
  } else {
    var name =
      femaleFirstNames[
        Math.floor(utils.getRand(lastRand, 0, femaleFirstNames.length))
      ] +
      " " +
      lastNames[Math.floor(utils.getRand(lastRand, 0, lastNames.length))];
  }

  var hair = hairInfo[utils.rand(lastRand, hairInfo)];
  var body = bodyInfo[Math.floor(utils.getRand(lastRand, 0, bodyInfo.length))];

  var height = utils.getHeight(body.race, lastRand);
  var height = height + "cm (" + utils.toFeet(height) + ")";

  var chest = chestInfo[utils.rand(lastRand, chestInfo)];
  var leg = legInfo[utils.rand(lastRand, legInfo)];
  if (sexVal === "Male") {
    var facialHair = facialHairInfo[utils.rand(lastRand, facialHairInfo)];
  } else {
    var facialHair = facialHairInfo[0];
  }

  // Weapon Selection
  if (classVal === "Ranger") {
    var weapon = bowsInfo[utils.rand(lastRand, bowsInfo)];
  } else if (classVal === "Rogue") {
    var weapon = daggersInfo[utils.rand(lastRand, daggersInfo)];
  } else if (classVal === "Wizard" || classVal == "Cleric") {
    var weapon = staffsInfo[utils.rand(lastRand, staffsInfo)];
  } else if (classVal === "Knight" || classVal == "Barbarian") {
    var weapon = swordsInfo[utils.rand(lastRand, swordsInfo)];
  }
  weapon.modifier = Math.floor(utils.getRand(lastRand, 1, 6));

  var ac = 10 + chest.armor + leg.armor + hair.armor;

  const stats = ["STR ", "DEX ", "CON ", "INT ", "WIS ", "CHA "];
  var statMod = stats[Math.floor(utils.getRand(lastRand, 0, stats.length))];
  var statModVal = Math.floor(utils.getRand(lastRand, 1, 5));

  // Write Character Data
  var characterData = {
    body: body,
    eyes: eyeInfo[utils.rand(lastRand, eyeInfo)],
    hair: hair,
    chest: chest,
    legs: leg,
    facialHair: facialHair,
    weapon: weapon,
    hp: utils.getHP(classVal, con, lastRand),
    ac: ac,
    str: utils.rollStat(lastRand),
    strModifier: "",
    dex: utils.rollStat(lastRand),
    dexModifier: "",
    con: con,
    conModifier: "",
    int: utils.rollStat(lastRand),
    intModifier: "",
    wis: utils.rollStat(lastRand),
    wisModifier: "",
    cha: utils.rollStat(lastRand),
    chaModifier: "",
    statModifier: statMod,
    statModifierValue: statModVal,
    coins: Math.floor(utils.getRand(lastRand, 0, 1000)),
    name: name,
    sex: sexVal,
    race: body.race, // race
    class: classVal,
    height: height,
    background: backgroundInfo[utils.rand(lastRand, backgroundInfo)],
    description: "",
    image_url: "",
    sprite_url: "",
    weapon_url: "",
    seed: seed,
  };

  characterData.strModifier = utils.getAbilityModifier(characterData.str);
  characterData.dexModifier = utils.getAbilityModifier(characterData.dex);
  characterData.conModifier = utils.getAbilityModifier(characterData.con);
  characterData.intModifier = utils.getAbilityModifier(characterData.int);
  characterData.wisModifier = utils.getAbilityModifier(characterData.wis);
  characterData.chaModifier = utils.getAbilityModifier(characterData.cha);

  characterData.description = utils.getBackgroundStory(lastRand, characterData);

  const image_URL = await draw_v1.getTokenURL(1, characterData);
  characterData.image_url = image_URL;

  const sprite_URL = await draw_v1.getSpriteURL(1, characterData);
  characterData.sprite_url = sprite_URL;

  const weapon_URL = await draw_v1.getWeaponURL(1, characterData);
  characterData.weapon_url = weapon_URL;

  console.log(
    "Seed: " + seed + "\n",
    "Name: " + characterData.name + "\n",
    "Sex: " + characterData.sex + "\n",
    "Race: " + characterData.race + "\n",
    "Class: " + characterData.class + "\n",
    "Height: " + characterData.height + "\n"
  );

  return characterData;
};

// Generate Pre-made Character
const generateCharacter = async (id) => {
  const seed = id;
  // Hash the seed with the SHA256 Algorithm
  let lastRand = {
    v: sha3_256(seed).slice(-64),
  };

  const character = specialCharacters[id];
  console.log(character);
  var classVal = classes[character.class];
  var height = character.height + "cm (" + utils.toFeet(character.height) + ")";
  // Weapon Selection
  if (classVal === "Ranger") {
    var weapon = bowsInfo[character.weapon];
  } else if (classVal === "Rogue") {
    var weapon = daggersInfo[character.weapon];
  } else if (classVal === "Wizard" || classVal == "Cleric") {
    var weapon = staffsInfo[character.weapon];
  } else if (classVal === "Knight" || classVal == "Barbarian") {
    var weapon = swordsInfo[character.weapon];
  }
  weapon.modifier = character.modifier;

  var ac =
    10 +
    chestInfo[character.chest].armor +
    legInfo[character.legs].armor +
    hairInfo[character.hair].armor;

  // Write Character Data
  var characterData = {
    body: bodyInfo[character.body],
    eyes: eyeInfo[character.eyes],
    hair: hairInfo[character.hair],
    chest: chestInfo[character.chest],
    legs: legInfo[character.legs],
    facialHair: facialHairInfo[character.facialHair],
    weapon: weapon,
    hp: character.hp,
    ac: ac,
    str: character.str,
    strModifier: utils.getAbilityModifier(character.str),
    dex: character.dex,
    dexModifier: utils.getAbilityModifier(character.dex),
    con: character.con,
    conModifier: utils.getAbilityModifier(character.con),
    int: character.int,
    intModifier: utils.getAbilityModifier(character.int),
    wis: character.wis,
    wisModifier: utils.getAbilityModifier(character.wis),
    cha: character.cha,
    chaModifier: utils.getAbilityModifier(character.cha),
    statModifier: character.statModifier,
    statModifierValue: character.statModifierValue,
    coins: character.coins,
    name: character.name,
    sex: sex[character.sex],
    race: bodyInfo[character.body].race,
    class: classVal,
    height: height,
    background: backgroundInfo[character.background],
    description: "",
    image_url: "",
    sprite_url: "",
    weapon_url: "",
    seed: id,
  };

  characterData.description = utils.getBackgroundStory(lastRand, characterData);

  const image_URL = await draw_v1.getTokenURL(1, characterData);
  characterData.image_url = image_URL;

  const sprite_URL = await draw_v1.getSpriteURL(1, characterData);
  characterData.sprite_url = sprite_URL;

  const weapon_URL = await draw_v1.getWeaponURL(1, characterData);
  characterData.weapon_url = weapon_URL;

  return characterData;
};

const specialCharacters = [
  {
    // Thaer Thistlegrove
    body: 18,
    eyes: 0,
    hair: 5,
    chest: 0,
    legs: 0,
    facialHair: 0,
    weapon: 11,
    modifier: 5,
    hp: 28,
    ac: 10,
    str: 20,
    dex: 20,
    con: 20,
    int: 20,
    wis: 20,
    cha: 20,
    statModifier: "DEX",
    statModifierValue: 5,
    coins: 1000,
    name: "Thaer Thistlegrove",
    sex: 0,
    race: 0,
    class: 2,
    height: 185,
    background: 5,
  },
  {
    // Goblin Slayer
    body: 3,
    eyes: 3, // make black eye
    hair: 0,
    chest: 1,
    legs: 1,
    facialHair: 0,
    weapon: 0,
    modifier: 5,
    hp: 30,
    ac: 10,
    str: 20,
    dex: 20,
    con: 20,
    int: 20,
    wis: 20,
    cha: 20,
    statModifier: "STR",
    statModifierValue: 5,
    coins: 1000,
    name: "Orcbolg/BeardCutter",
    sex: 0,
    race: 0,
    class: 1,
    height: 195,
    background: 5,
  },
  {
    // Sesh Gremlin
    body: 11,
    eyes: 9,
    hair: 1,
    chest: 2,
    legs: 2,
    facialHair: 0,
    weapon: 0,
    modifier: 5,
    hp: 26,
    ac: 10,
    str: 20,
    dex: 20,
    con: 20,
    int: 20,
    wis: 20,
    cha: 20,
    statModifier: "WIS",
    statModifierValue: 5,
    coins: 420,
    name: "Sesh Gremlin",
    sex: 0,
    race: 0,
    class: 4,
    height: 170,
    background: 5,
  },
];

// ******************************************//
// Generate Methods for Creatures/ Enemies
// ******************************************//

// Generate random Animal
const generateRandomCreature = async (seed) => {
  // Hash the seed with the SHA256 Algorithm
  let lastRand = {
    v: sha3_256(seed).slice(-64),
  };

  var con = utils.rollStat(lastRand);
  var sexVal = sex[Math.floor(utils.getRand(lastRand, 0, sex.length))];
  var classVal =
    classes[Math.floor(utils.getRand(lastRand, 0, classes.length))];

  if (sexVal === "Male") {
    var name =
      maleFirstNames[
        Math.floor(utils.getRand(lastRand, 0, maleFirstNames.length))
      ] +
      " " +
      lastNames[Math.floor(utils.getRand(lastRand, 0, lastNames.length))];
  } else {
    var name =
      femaleFirstNames[
        Math.floor(utils.getRand(lastRand, 0, femaleFirstNames.length))
      ] +
      " " +
      lastNames[Math.floor(utils.getRand(lastRand, 0, lastNames.length))];
  }

  var hair = hairInfo[utils.rand(lastRand, hairInfo)];
  var body = bodyInfo[Math.floor(utils.getRand(lastRand, 0, bodyInfo.length))];

  var height = utils.getHeight(body.race, lastRand);
  var height = height + "cm (" + utils.toFeet(height) + ")";

  var chest = chestInfo[utils.rand(lastRand, chestInfo)];
  var leg = legInfo[utils.rand(lastRand, legInfo)];
  if (sexVal === "Male") {
    var facialHair = facialHairInfo[utils.rand(lastRand, facialHairInfo)];
  } else {
    var facialHair = facialHairInfo[0];
  }

  // Weapon Selection
  if (classVal === "Ranger") {
    var weapon = bowsInfo[utils.rand(lastRand, bowsInfo)];
  } else if (classVal === "Rogue") {
    var weapon = daggersInfo[utils.rand(lastRand, daggersInfo)];
  } else if (classVal === "Wizard" || classVal == "Cleric") {
    var weapon = staffsInfo[utils.rand(lastRand, staffsInfo)];
  } else if (classVal === "Knight" || classVal == "Barbarian") {
    var weapon = swordsInfo[utils.rand(lastRand, swordsInfo)];
  }
  weapon.modifier = Math.floor(utils.getRand(lastRand, 1, 6));

  var ac = 10 + chest.armor + leg.armor + hair.armor;

  const stats = ["STR ", "DEX ", "CON ", "INT ", "WIS ", "CHA "];
  var statMod = stats[Math.floor(utils.getRand(lastRand, 0, stats.length))];
  var statModVal = Math.floor(utils.getRand(lastRand, 1, 5));

  // Write Creature Data
  var creatureData = {
    body: body,
    eyes: eyeInfo[utils.rand(lastRand, eyeInfo)],
    hair: hair,
    chest: chest,
    legs: leg,
    facialHair: facialHair,
    weapon: weapon,
    hp: utils.getHP(classVal, con, lastRand),
    ac: ac,
    str: utils.rollStat(lastRand),
    strModifier: "",
    dex: utils.rollStat(lastRand),
    dexModifier: "",
    con: con,
    conModifier: "",
    int: utils.rollStat(lastRand),
    intModifier: "",
    wis: utils.rollStat(lastRand),
    wisModifier: "",
    cha: utils.rollStat(lastRand),
    chaModifier: "",
    statModifier: statMod,
    statModifierValue: statModVal,
    coins: Math.floor(utils.getRand(lastRand, 0, 1000)),
    name: name,
    sex: sexVal,
    race: body.race, // race
    class: classVal,
    height: height,
    background: backgroundInfo[utils.rand(lastRand, backgroundInfo)],
    description: "",
    image_url: "",
    sprite_url: "",
    weapon_url: "",
    seed: seed,
  };

  creatureData.strModifier = utils.getAbilityModifier(creatureData.str);
  creatureData.dexModifier = utils.getAbilityModifier(creatureData.dex);
  creatureData.conModifier = utils.getAbilityModifier(creatureData.con);
  creatureData.intModifier = utils.getAbilityModifier(creatureData.int);
  creatureData.wisModifier = utils.getAbilityModifier(creatureData.wis);
  creatureData.chaModifier = utils.getAbilityModifier(creatureData.cha);

  creatureData.description = utils.getBackgroundStory(lastRand, creatureData);

  const image_URL = await draw_v1.getTokenURL(1, creatureData);
  creatureData.image_url = image_URL;

  const sprite_URL = await draw_v1.getSpriteURL(1, creatureData);
  creatureData.sprite_url = sprite_URL;

  const weapon_URL = await draw_v1.getWeaponURL(1, creatureData);
  creatureData.weapon_url = weapon_URL;

  return creatureData;
};

// Exports
module.exports = {
  generateRandom,
  generateCharacter,
  specialCharacters,
};
