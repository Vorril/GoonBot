/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const Player = require("../player");
const fs = require("fs");
const { prefix } = require("../config.json");

let commandList = new Array(); //Holds objects which should be single functions named by their !command

// Player Variables
let playerList = [];

//load players from file during startup
fs.readFile("./playerData.json", function (errLoad, data) {
  //Doing it with the callback waits to ensure file loaded
  if (errLoad) {
  } else {
    loadList = JSON.parse(data); //data = stringify array
    loadList.forEach((element) => {
      playerList.push(new Player(element));
      // console.log(JSON.stringify(playerList[playerList.length-1]));//NOT stringifyig members added via assign to the prototype???!?!
    });
    console.log("Loaded players:" + playerList.length);

    //loadExternals();
    //need to conver to player class;
  }
}); //readFile

loadExternals();

commandList.push({
  hello: function () {
    console.log("I was declared in index");
  },
});
//commandList[0]["hello"]();

function loadExternals() {
  //These 5 lines could further be modularized they should be the same for every import
  const Fishing = require("../Extensions/fishing.js");
  var protoFishing = Fishing.importProperties(); // imports all player related properties
  Object.assign(Player.prototype, protoFishing);
  var tempArray = commandList.concat(Fishing.importCommands()); // imports commands which likely call the added functions above
  commandList = tempArray;
}

const checkForPlayer = (checkTag, playerList) => {
  //returns player or creates new and returns
  for (i = 0; i < playerList.length; i++) {
    if (playerList[i].playerTag == checkTag) return playerList[i];
  }

  let playerToAdd = { playerTag: checkTag }; //object to feed class constructor
  playerList.push(new Player(playerToAdd));
  console.log(
    `New player added ${checkTag} playerList Index: ${playerList.length - 1}`
  );
  return playerList[playerList.length - 1];
};

function savePlayers(playerList) {
  //Write each player to individual file? would make saving easier
  fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
    err
  ) {}); //TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)
}

const handleRPGCommands = (commandRead, message) => {
  let player;
  switch (commandRead) {
    case "!stats":
      player = checkForPlayer(message.author.tag, playerList);
      player.printStats(message);
      break;

    case "!snickers": {
      player = checkForPlayer(message.author.tag, playerList);

      player.eatSnickers(message);

      savePlayers(playerList); //Do we want to update the whole savefile on every change?
      break; //snickers
    }

    case "!fish":
      player = checkForPlayer(message.author.tag, playerList);
      player.fish(message);
      console.log(player.fishingMember);
      break;

    case "!addtestplayer":
      let randomNumber = Math.floor(Math.random() * 10000);
      playerList.push(new Player({ playerTag: "testplayer" + randomNumber }));
      fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
        err
      ) {});
      break;

    case "!changeclass":
      player = checkForPlayer(message.author.tag, playerList);
      player.setClass();
      savePlayers(playerList);
      break;

    case "!commandlist":
      var keyNames = "";
      commandList.forEach((element) => {
        keyNames += Object.keys(element) + "\n";
      });
      console.log("Commands found in commandList:" + "\n" + keyNames);
      break;

    default:
      return "unfound";
      break;
  }

  commandList.forEach((element) => {
    //check dynamically loaded commands
    var keyName = Object.keys(element); // Based on how commandlist is intended to be used should only be one key one func
    if (prefix + keyName == commandRead) {
      var player = checkForPlayer(message.author.tag);
      element[keyName](player, message); //way to do player.() ?
    }
  });
};

module.exports = { handleRPGCommands };
