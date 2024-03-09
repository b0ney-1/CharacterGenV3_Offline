// Node Module Imports
const fs = require("fs");
const BigNumber = require("bignumber.js");
const { sha3_256 } = require("js-sha3");

// Re-roll stats
const reroll = (character) => {
  let lastRand = { v: web3.utils.sha3(seed.toString()).slice(-64) };

  character.str = Math.floor(getRand(lastRand, 1, 20));
  character.dex = Math.floor(getRand(lastRand, 1, 20));
  character.con = Math.floor(getRand(lastRand, 1, 20));
  character.int = Math.floor(getRand(lastRand, 1, 20));
  character.wis = Math.floor(getRand(lastRand, 1, 20));
  character.cha = Math.floor(getRand(lastRand, 1, 20));

  return character;
};

// Write Character Data to JSON
const writeCharacter = (characterData) => {
  const characterArr = require("./characters.json");

  characterArr.push(characterData);

  fs.writeFile(
    "./src/characters.json",
    JSON.stringify(characterArr, null, 4),
    (error) => {
      if (error) throw error;
    }
  );
};

// Get random weighted item
const rand = (lastRand, info) => {
  const arr = info.map((e) => e.chance);
  const total = arr.reduce((a, v) => a + v);
  const r = getRand(lastRand, 0, total);
  let c = 0;
  let i = 0;
  for (; i < arr.length; i++) {
    c += arr[i];
    if (r < c) {
      break;
    }
  }
  return i;
};

const getRand = (lastRand, min = 0, max = 1) => {
  // lastRand.v = web3.utils.sha3(lastRand.v).slice(-64);
  lastRand.v = sha3_256(lastRand.v).slice(-64);
  const rand = new BigNumber(lastRand.v, 16)
    .div(new BigNumber(2 ** 256))
    .toNumber();
  return min + (max - min) * rand;
};

// Roll Stat (3d6 + 2)
const rollStat = (seed) => {
  let roll = 0;
  for (let i = 0; i < 3; i++) {
    roll += Math.floor(getRand(seed, 1, 7));
  }
  return (roll += 2);
};

// Determines border Color based on stats
const trimColor = (statScore) => {
  const trimColors = ["#FFD700", "#C0C0C0", "#cd7f32", "#a335ee"];
  if (statScore >= 110) {
    // Purple
    return trimColors[3];
  } else if (statScore >= 95 && statScore < 110) {
    // Gold
    return trimColors[0];
  } else if (statScore >= 80 && statScore < 95) {
    // Silver
    return trimColors[1];
  } else {
    // Bronze
    return trimColors[2];
  }
};

// Weapon trim color
const trimColorWeapon = (weight) => {
  const trimColors = ["#FFD700", "#C0C0C0", "#cd7f32", "#a335ee"];
  if (weight <= 10) {
    // Purple
    return trimColors[3];
  } else if (weight > 25 && weight <= 50) {
    // Gold
    return trimColors[0];
  } else if (weight > 50 && weight <= 100) {
    // Silver
    return trimColors[1];
  } else {
    // Bronze
    return trimColors[2];
  }
};

// Modifier trim color
const trimColorModifier = (weight) => {
  const trimColors = ["#FFD700", "#C0C0C0", "#cd7f32", "#a335ee"];
  if (weight === 5) {
    // Purple
    return trimColors[3];
  } else if (weight === 4) {
    // Gold
    return trimColors[0];
  } else if (weight === 3) {
    // Silver
    return trimColors[1];
  } else {
    // Bronze
    return trimColors[2];
  }
};

// HP Generator
const getHP = (classVal, con, seed) => {
  if (classVal == "Barbarian" || classVal == "Knight") {
    return Math.floor(getRand(seed, 0, 1) * 10) + 1 + con;
  } else if (classVal == "Ranger" || classVal == "Rogue") {
    return Math.floor(getRand(seed, 0, 1) * 8) + 1 + con;
  } else if (classVal == "Wizard" || classVal == "Cleric") {
    return Math.floor(getRand(seed, 0, 1) * 6) + 1 + con;
  }
};

// Get Height
const getHeight = (race, seed) => {
  let height = Math.floor(getRand(seed, 0, 1) * (182 - 152 + 1)) + 152;
  if (race == "Dwarf" || race == "Halfling") {
    return Math.floor(height / 1.4);
  } else if (race == "Elf") {
    return height + 20;
  }
  return height;
};

// To Feet
const toFeet = (n) => {
  var realFeet = (n * 0.3937) / 12;
  var feet = Math.floor(realFeet);
  var inches = Math.round((realFeet - feet) * 12);
  return feet + "'" + inches + '"';
};

// Background Color
const getBackgroundColor = (character) => {
  const colors = [
    "#FFD700",
    "#C0C0C0",
    "#cd7f32",
    "#a335ee",
    "#990000",
    "#555",
  ];
  if (character.background.background === "Folk Hero") {
    // Purple
    return colors[3];
  } else if (character.background.background === "Royalty") {
    // Gold
    return colors[0];
  } else if (character.background.background === "Noble") {
    // Silver
    return colors[1];
  } else if (character.background.background === "Commoner") {
    // Bronze
    return colors[2];
  } else if (character.background.background === "Outlaw") {
    //
    return colors[4];
  } else {
    // Peasant
    return colors[5];
  }
};

const getAbilityModifier = (abilityScore) => {
  const value = abilityScore; // Math.floor((abilityScore - 10) / 2)
  switch (true) {
    case value === 1:
      return "-5";
    case value <= 3:
      return "-4";
    case value <= 5:
      return "-3";
    case value <= 7:
      return "-2";
    case value <= 9:
      return "-1";
    case value <= 11:
      return "+0";
    case value <= 13:
      return "+1";
    case value <= 15:
      return "+2";
    case value <= 17:
      return "+3";
    case value <= 19:
      return "+4";
    case value <= 21:
      return "+5";
    case value <= 23:
      return "+6";
    case value <= 25:
      return "+7";
    case value <= 27:
      return "+8";
    case value <= 29:
      return "+9";
    case value === 30:
      return "+10";
  }
  return "no value";
};

// Character Backstory/ History Generator
const getBackgroundStory = (seed, character) => {
  let pronouns = getPronouns(character);

  const Isles = [
    "the upper Isle of Zenaria",
    "the upper Isle of Zenethia",
    "the lower Isle of Zarkus",
  ];

  const birthplace = [
    "in their family Home ",
    "in the Home of a Family Friend ",
    "in the Home of a healer ",
    "in a Carriage ",
    "in a Barn ",
    "in a Cave ",
    "in a Field ",
    "in a Forest ",
    "in a Temple ",
    "on a Battlefield ",
    "in an Alley ",
    "in a Tavern ",
    "in a Castle ",
    "in a Keep ",
    "in a Tower ",
    "in a Palace ",
    "in a Sewer ",
    "in a Swamp ",
    "in a guild ",
    "in the streets ",
    "Among people of a different race ",
    "on a Ship ",
    "in a Prison ",
    "in a laboratory ",
  ];

  const siblings = [
    "no", // 0
    Math.floor(getRand(seed, 1, 3)), // 1d3
    Math.floor(getRand(seed, 1, 4) + 1), // 1d4+1
    Math.floor(getRand(seed, 1, 6) + 2), // 1d6+2
    Math.floor(getRand(seed, 1, 8) + 3), // 1d8+3
  ];

  const rasiedBy = [
    "by an instituition. ",
    "by a Temple. ",
    "by an Orphanage. ",
    "by a Gaurdian. ",
    "by their extended Family. ",
    "by their Grandparents. ",
    "by an Adoptive Family. ",
    "by a Single Father. ",
    "by a Single Mother. ",
    "by a Mother and Father. ",
  ];

  const lifestyle = [
    "Wretched",
    "Squalid",
    "Poor",
    "Modest",
    "Comfortable",
    "Wealthy",
    "Aristocratic",
  ];

  const memories = [
    `${character.name} is still haunted by ${pronouns[1]} childhood, when ${pronouns[0]} was treated badly by ${pronouns[1]} peers.`,
    `${character.name} spent most of ${pronouns[1]} childhood alone, with no close friends.`,
    `Others saw ${pronouns[2]} as being different or strange, and so ${pronouns[0]} had few companions.`,
    `${character.name} had a few close friends and lived an ordinary childhood.`,
    `${character.name} had several friends, and ${pronouns[1]} childhood was generally a happy one.`,
    `${character.name} always found it easy to make friends, and ${pronouns[0]} loved being around people.`,
    `Everyone knew who ${pronouns[0]} was, and ${pronouns[0]} had friends everywhere ${pronouns[0]} went.`,
    `${character.name} was exiled from others as a child for being strange. Other kids found ${pronouns[2]} scary.`,
    `Growing up ${pronouns[0]} often went hunting and foraging and was taught essential survival skills.`,
    `${character.name} was taught smithing at a young age as ${pronouns[0]} often worked and helped out at ${pronouns[1]} local smithery.`,
    `${character.name} would often fish as a child and became quite good at it. In fact ${pronouns[0]} was crowned the champion in a fishing tournament at the age of 13.`,
    `${character.name} grew up with the ambition of being a powerful wizard, hoping ${pronouns[0]} could become more powerful than the rest of ${pronouns[1]} peers.`,
    `${character.name} was proficient at card tricks and wished to learn real magic in order to improve ${pronouns[1]} "magic" acts.`,
    `${character.name} learned the dark arts of thievery when ${pronouns[0]} was young, as it allowed ${pronouns[2]} to earn money from pickpocketing the other locals.`,
    `${character.name} holds the record for most lobsters caught in 24 hours using a single net. The record being 200 lobsters caught in 24 hours.`,
    `${character.name} travelled in a caravan for a few months in ${pronouns[1]} early teenage years. During this period he learned to play mutliple musical intruments.`,
    `${character.name} spent most of ${pronouns[1]} teenage years flirting and wooing many people. Locals would pay ${pronouns[2]} to teach them how to do the same.`,
    `${character.name} would spend week nights playing ${pronouns[1]} lute at the local tavern in return for food and a room to stay in.`,
    `${character.name} is a lone wolf and has been since ${pronouns[0]} was a child. ${character.name} never tried to make friends and often explored the island alone.`,
  ];

  // Name
  let story = `${character.name} is `;

  // Race and Class
  if (character.race === "Elf") {
    story += `an Elven ${character.class}, who has `;
  } else {
    story += `a ${character.race} ${character.class}, who has `;
  }

  // Siblings
  story += `${
    siblings[Math.floor(getRand(seed, 0, siblings.length))]
  } sibling(s), and was born `;

  // Birth PLace
  story += birthplace[Math.floor(getRand(seed, 0, birthplace.length))];

  // Parents
  story += `and rasied ${
    rasiedBy[Math.floor(getRand(seed, 0, rasiedBy.length))]
  }`;

  // Belongs to which Isle
  story += `${character.name} lives in ${
    Isles[Math.floor(getRand(seed, 0, Isles.length))]
  }, `;

  // Background
  if (character.background.background == "Outlaw") {
    story += `where ${pronouns[0]} lives out ${pronouns[1]} days as an ${character.background.background}.`;
  } else if (character.background.background == "Royalty") {
    story += `where ${pronouns[0]} lives out ${pronouns[1]} days as ${character.background.background}.`;
  } else {
    story += `where ${pronouns[0]} lives out ${pronouns[1]} days as a ${character.background.background}.`;
  }

  // Memories
  story += ` ${memories[Math.floor(getRand(seed, 0, memories.length))]}`;

  return story;
};

// Get Pronouns
const getPronouns = (character) => {
  if (character.sex === "Male") {
    const pronoun1 = "he";
    const pronoun2 = "his";
    const pronoun3 = "him";
    return [pronoun1, pronoun2, pronoun3];
  } else if (character.sex === "Female") {
    const pronoun1 = "she";
    const pronoun2 = "her";
    const pronoun3 = "her";
    return [pronoun1, pronoun2, pronoun3];
  }
};

module.exports = {
  reroll,
  writeCharacter,
  rand,
  getRand,
  rollStat,
  trimColor,
  trimColorModifier,
  trimColorWeapon,
  getHP,
  getHeight,
  toFeet,
  getBackgroundColor,
  getBackgroundStory,
  getAbilityModifier,
};
