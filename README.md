## Introduction
This subgraph provides all the information you need for the gotchiverse: Events, Parcels, Gotchis, Installations, Tiles and more. 

Watch out! The subgraph is a WIP and things might change over time. Please follow the #subgraphs channel at the [Aavegotchi Discord](https://github.com/aavegotchi/aavegotchi-matic-subgraph) if you integrate the subgraph into your dapp.

The endpoint is available here: https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic. 

The Playground where you can try out queries can be found here: https://thegraph.com/hosted-service/subgraph/aavegotchi/gotchiverse-matic.

## Setup
To run this Subgraph on your machine you need either a polygon archive node and a graph node running or an account on the hosted service of thegraph. 

If you run your own nodes you just need to run ```yarn create-local``` to setup the subgraph on the graph node and afterwards run ```yarn deploy-local``` to deploy the subgraph to the node.

If you use the hosted service. Please create an account and deploy via graph cli: ```npx graph deploy --product hosted-service  username/gotchiverse-matic --access-token access-token```

## Schema
The schema consists out of basically three different kinds of entities: Events, State and Stats. We have for each event emitted on chain a Event entitiy on the subgraph whichs logs all the data. Such as Transfer events, Mint Parcel events or EquipTile events. The State holds the latest state of the Parcels, Gotchis, Installations and Tiles. Finally the Stats hold information about the Gotchiverse, the user, the parcels and gotchis.

You can find at the Playground or in the [github repository](https://github.com/aavegotchi/aavegotchi-matic-subgraph) the [entire Schema](https://github.com/aavegotchi/gotchiverse-subgraph/blob/main/schema.graphql).
## Examples
In this section we provide some example queries which should help you to get first ideas of what to fetch from the graph and how to do it. You can insert all events on the Playground and get the results. If you need help on how to integrate those queries in your app please take a look into the [General Section](https://docs.aavegotchi.com/subgraphs/general).
Events
You can query the subgraph for almost every event happened on chain. From transfers, to equip / unequip of installations and tiles also to parcel access rights and more.
```
{
  transferFromUser: transferEvents(where: {from:"0xa97946357a1f6c251b9d257833ab0233ed863527"}) {
    from
    to
    tokenId
  }
  
  transferToUser: transferEvents(where: {to:"0xa97946357a1f6c251b9d257833ab0233ed863527"}) {
    from
    to
    tokenId
  }
  
  upgradeFinalizedEvents(where: {parcel: "23596"}) {
    installation {
      name
    }
  }
}
```
## Gotchis and Parcels
We store a lot of information about the Parcles, but very less for Gotchis, because the [core matic subgraph](https://docs.aavegotchi.com/subgraphs/core-matic-subgraph) already maintains the gotchi information. We store for both entity types the last channeled alchemica attribute. For the parcels we also store the size, the coordinates, the alchemica boost and the equipped tiles and installations. 
```
{
  gotchis(where: {id_in: ["4430", "20695"]}) {
    id
    lastChanneledAlchemica
  }
  parcels(where: {owner: "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"}) {
    equippedInstallations {
      name
      level
    }
    equippedTiles {
      name
      uri
    }
    lastChanneledAlchemica
    fudBoost
    fomoBoost
    alphaBoost
    kekBoost
    size
    coordinateX
    coordinateY
  }
}
```
## Installation Types and Tile Types
You can query all the possible Installation and Tiles types with their pre requisites and alchemica costs.
```
{
  tileTypes {
    width
    height
    deprecated
    craftTime
    alchemicaCost
    name
    amount
    uri
  }
  
  installationTypes {
    width
    height
    level
    alchemicaType
    spillRadius
    spillRate
    prerequisites
    amountPrerequisites
    name
    amount
    uri
    harvestRate
    alchemicaCost
    deprecated
    craftTime
    upgradeQueueBoost
  }
}
```
## Stats
We store some stats for the entire gotchisverse, but also for users, parcel and gotchis. 
```
{
  overallStats: stat(id:"overall") {
    alchemicaSpendOnTiles
    alchemicaSpendOnUpgrades
    alchemicaSpendTotal
    alchemicaClaimedTotal
    tilesEquippedCurrent
    installationsEquippedCurrent
    alchemicaSpendOnInstallations
    alchemicaSpendOnUpgrades
    alchemicaSpendOnTiles
    alchemicaSpendTotal
    tilesMinted
  }
  
  userStats:stat(id:"user-0x1ad3d72e54fb0eb46e87f82f77b284fc8a66b16c") {
    alchemicaSpendTotal
    tilesMinted
    installationsMintedTotal
    installationsUpgradedTotal
    alchemicaSpendTotal
    alchemicaSpendOnUpgrades
    alchemicaSpendOnInstallations
  }
  
  parcelStats:stat(id:"parcel-23596") {
    installationsEquippedTotal
    installationsEquippedCurrent
    alchemicaChanneledTotal
  }
}
```

## Contribute

If you find bugs or have feature requests please create an issue in the [github repository](https://github.com/aavegotchi/aavegotchi-matic-subgraph). If you want to hack something please just talk to us at the [Aavegotchi Discord](https://github.com/aavegotchi/aavegotchi-matic-subgraph).