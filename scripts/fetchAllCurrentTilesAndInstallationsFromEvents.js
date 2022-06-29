const apollo = require("apollo-fetch");
const fs = require("fs").promises;

let DEFAULT_BLOCKNUMBER = 0;
let id = DEFAULT_BLOCKNUMBER;

const uri =
  "https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic";
const graph = apollo.createApolloFetch({
  uri,
});

function getEquipInstallationsQuery() {
  return `{
    equipInstallationEvents(first: 1000 where: {id_gt: "${id}"} orderBy: id orderDirection: asc) {
      id
      block
      x
      y
      realmId
      installationId
    }
  }`;
}

function getUnequipInstallationsQuery() {
  return `{
    unequipInstallationEvents(first: 1000 where: {id_gt: "${id}"} orderBy: id orderDirection: asc) {
      id
      block
      x
      y
      realmId
      installationId
    }
  }`;
}

function getEquipTilesQuery() {
  return `{
    equipTileEvents(first: 1000 where: {id_gt: "${id}"} orderBy: id orderDirection: asc) {
      id
      block
      x
      y
      realmId
      tileId  
    }
  }`;
}

function getUnequipTilesQuery() {
  return `{
    unequipTileEvents(first: 1000 where: {id_gt: "${id}"} orderBy: id orderDirection: asc) {
      id
      block
      x
      y
      realmId
      tileId  
    }
  }`;
}

function getInstallationUpgradedQuery() {
  return `{upgradeInitiatedEvents(first: 1000 where: {id_gt: "${id}"} orderBy: id orderDirection: asc) {
        id
        x
        y
        realmId
        installationId
      }
    }
  `;
}

async function main() {
  // Tiles
  // fetch first equip results
  let equippedTiles = [];
  let equipTilesDataTmp = (await graph({ query: getEquipTilesQuery() })).data
    .equipTileEvents;
  while (equipTilesDataTmp.length > 0) {
    id = equipTilesDataTmp[equipTilesDataTmp.length - 1].id;
    equippedTiles = equippedTiles.concat(equipTilesDataTmp);
    equipTilesDataTmp = (await graph({ query: getEquipTilesQuery() })).data
      .equipTileEvents;

    console.log("Equipped Tiles: ", equippedTiles.length);
  }

  // fetch uneqipped
  id = DEFAULT_BLOCKNUMBER;
  let uneqippedTiles = [];
  let unequipTilesDataTmp = (await graph({ query: getUnequipTilesQuery() }))
    .data.unequipTileEvents;
  while (unequipTilesDataTmp.length > 0) {
    id = unequipTilesDataTmp[unequipTilesDataTmp.length - 1].id;
    uneqippedTiles = uneqippedTiles.concat(unequipTilesDataTmp);
    unequipTilesDataTmp = (await graph({ query: getUnequipTilesQuery() })).data
      .unequipTileEvents;
    console.log("Unequipped Tiles: ", uneqippedTiles.length);
  }

  // remove uneqipped from equipped
  let finalEquippedTiles = equippedTiles;
  uneqippedTiles.forEach((e) => {
    finalEquippedTiles = finalEquippedTiles.filter(
      (f) =>
        e.x != f.x ||
        e.y != e.y ||
        e.realmId != f.realmId ||
        e.installationId != f.installationId
    );
  });

  console.log("Final equipped Tiles: ", finalEquippedTiles.length);

  // Installations
  // fetch first equip results
  let equippedInstallations = [];
  let equippedInstallationsTmp = (
    await graph({ query: getEquipInstallationsQuery() })
  ).data.equipInstallationEvents;

  while (equippedInstallationsTmp.length > 0) {
    id = equippedInstallationsTmp[equippedInstallationsTmp.length - 1].id;
    equippedInstallations = equippedInstallations.concat(
      equippedInstallationsTmp
    );
    equippedInstallationsTmp = (
      await graph({ query: getEquipInstallationsQuery() })
    ).data.equipInstallationEvents;

    console.log("Equipped Installations: ", equippedInstallations.length);
  }

  // handle Upgrades
  // fetch uneqipped
  id = DEFAULT_BLOCKNUMBER;
  let installationUpgradedEvents = [];
  let installationUpgradedEventsData = (
    await graph({ query: getInstallationUpgradedQuery() })
  ).data.upgradeInitiatedEvents;
  while (installationUpgradedEventsData.length > 0) {
    id =
      installationUpgradedEventsData[installationUpgradedEventsData.length - 1]
        .id;
    installationUpgradedEvents = installationUpgradedEvents.concat(
      installationUpgradedEventsData
    );
    installationUpgradedEventsData = (
      await graph({ query: getInstallationUpgradedQuery() })
    ).data.upgradeInitiatedEvents;
    console.log("Upgraded Installations: ", installationUpgradedEvents.length);
  }

  equippedInstallations = equippedInstallations.map((e) => {
    let upgrades = installationUpgradedEvents.filter(
      (f) => f.realmId == e.realmId && f.x == e.x && f.y == e.y
    );
    if (upgrades.length == 0) {
      return e;
    }

    let highestInstallationId = upgrades[0].installationId;
    upgrades.forEach((u) => {
      if (parseInt(u.installationId) > parseInt(highestInstallationId)) {
        highestInstallationId = u.installationId;
      }
    });

    return {
      id: e.realmId + "-" + highestInstallationId,
      x: e.x,
      y: e.y,
      realmId: e.realmId,
      installationId: highestInstallationId,
    };
  });

  // remove uneqipped from equipped
  // fetch uneqipped
  id = DEFAULT_BLOCKNUMBER;
  let uneqippedInstallations = [];
  let uneqippedInstallationsData = (
    await graph({ query: getUnequipInstallationsQuery() })
  ).data.unequipInstallationEvents;
  while (uneqippedInstallationsData.length > 0) {
    id = uneqippedInstallationsData[uneqippedInstallationsData.length - 1].id;
    uneqippedInstallations = uneqippedInstallations.concat(
      uneqippedInstallationsData
    );
    uneqippedInstallationsData = (
      await graph({ query: getUnequipInstallationsQuery() })
    ).data.unequipInstallationEvents;
    console.log("Unequipped Installations: ", uneqippedInstallations.length);
  }
  let finalEquippedInstallations = equippedInstallations;
  uneqippedInstallations.forEach((e) => {
    finalEquippedInstallations = finalEquippedInstallations.filter(
      (f) =>
        e.x != f.x ||
        e.y != e.y ||
        e.realmId != f.realmId ||
        e.installationId != f.installationId
    );
  });

  console.log(
    "Final equipped Installations: ",
    finalEquippedInstallations.length
  );

  await fs.writeFile(
    "./data/allInstallations.json",
    JSON.stringify(finalEquippedInstallations),
    "utf8"
  );
  await fs.writeFile(
    "./data/allTiles.json",
    JSON.stringify(finalEquippedTiles),
    "utf8"
  );
}
main();
