const getMetadata = (id, character) => {
  const metadata = {
    body: character.body,
    eyes: character.eyes,
    hair: character.hair,
    chest: character.chest,
    legs: character.legs,
    facialHair: character.facialHair,
    weapon: character.weapon,
    hp: character.hp,
    ac: character.ac,
    str: character.str,
    strModifier: character.strModifier,
    dex: character.dex,
    dexModifier: character.dexModifier,
    con: character.con,
    conModifier: character.conModifier,
    int: character.int,
    intModifier: character.intModifier,
    wis: character.wis,
    wisModifier: character.wisModifier,
    cha: character.cha,
    chaModifier: character.chaModifier,
    // statModifier: character.statModifier,
    // statModifierValue: character.statModifierValue,
    coins: character.coins,
    name: character.name,
    sex: character.sex,
    race: character.race,
    class: character.class,
    height: character.height,
    background: character.background,
    description: character.description,
    image_url: character.image_url,
    sprite_url: character.sprite_url,
    weapon_url: character.weapon_url,
    seed: character.seed,
  };

  return metadata;
};

// Exports
module.exports = {
  getMetadata,
};
