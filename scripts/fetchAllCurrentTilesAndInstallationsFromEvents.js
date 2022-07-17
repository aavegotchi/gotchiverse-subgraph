const apollo = require("apollo-fetch");
const fs = require("fs").promises;

let DEFAULT_BLOCKNUMBER = 0;
let id = DEFAULT_BLOCKNUMBER;

const uri =
    "https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic";
const graph = apollo.createApolloFetch({
    uri,
});

function getInstallationsQuery() {
    return `
      {installations(first: 1000 where: {id_gt:"${id}"}) {
        id
        x
        y
        type {
          id
        }
        parcel {
          id
        }
      }}`;
}

function getTilesQuery() {
    return `
      {tiles(first: 1000 skip: 0 where: {id_gt:"${id}"}) {
        id
        x
        y
        type {
          id
        }
        parcel {
          id
        }
      }}`;
}

async function main() {
    // Tiles
    let tiles = [];
    let tilesTmp = (await graph({ query: getTilesQuery() })).data.tiles;
    while (tilesTmp.length > 0) {
        id = tilesTmp[tilesTmp.length - 1].id;
        tiles = tiles.concat(tilesTmp);
        tilesTmp = (await graph({ query: getTilesQuery() })).data.tiles;

        console.log("Tiles: ", tiles.length);
    }

    // Installations
    id = DEFAULT_BLOCKNUMBER;
    let installations = [];
    let installationsTmp = (await graph({ query: getInstallationsQuery() }))
        .data.installations;

    while (installationsTmp.length > 0) {
        id = installationsTmp[installationsTmp.length - 1].id;
        installations = installations.concat(installationsTmp);
        installationsTmp = (await graph({ query: getInstallationsQuery() }))
            .data.installations;

        console.log("Installations: ", installations.length);
    }

    await fs.writeFile(
        "./data/allInstallations.json",
        JSON.stringify(installations),
        "utf8"
    );
    await fs.writeFile("./data/allTiles.json", JSON.stringify(tiles), "utf8");
}
main();
