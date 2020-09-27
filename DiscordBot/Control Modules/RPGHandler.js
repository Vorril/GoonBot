/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const Player = require("../player");
const fs = require("fs");
const { prefix } = require("../config.json");

// Player Variables
let playerList = [];

//load players from file during startup
//ToDo implement restarting of long actions based on actionProgress
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

function savePlayers(playerList) {
  playerList.forEach(element => {
    if(element.activityTimeout != ""){
      clearInterval(element.activityTimeout);
      element.activityTimeout = ""; //TODO implement saving for longer actions
      element.actionProgress = Date.now() - element.lastActionTime;
    }
    element.currentAction = "None";
  });

  //Write each player to individual file? would make saving easier
  fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
    err
  ) {}); //TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)
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


    default:
      return "unfound";
      break;
  }

};

module.exports = { handleRPGCommands };
