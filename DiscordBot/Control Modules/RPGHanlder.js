/**
 * Player related functions/stuff. Data structure / search / save/ load
 */
const Player = require("../player");
let commandList = new Array(); //Holds objects which should be single functions named by their !command
commandList.push({
  hello: function () {
    console.log("I was declared in index");
  },
});
//commandList[0]["hello"]();

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

const handleRPGCommands = (commandRead, message, playerList) => {
  switch (commandRead) {
    case "!stats":
      const player = checkForPlayer(message.author.tag, playerList);
      player.printStats(message);
      break;

    case "!snickers": {
      const player = checkForPlayer(message.author.tag, playerList);

      player.eatSnickers(message);

      savePlayers(playerList); //Do we want to update the whole savefile on every change?
      break; //snickers
    }

    case "!fish":
      const player = checkForPlayer(message.author.tag, playerList);
      player.fish(message);
      console.log(player.fishingMember);
      break;

    case "!addtestplayer":
      const randomNumber = Math.floor(Math.random() * 10000);
      playerList.push(new Player({ playerTag: "testplayer" + randomNumber }));
      fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
        err
      ) {});
      break;

    case "!changeclass":
      const player = checkForPlayer(message.author.tag, playerList);
      player.setClass();
      savePlayers(playerList);
      break;

    default:
      message.channel.send("GoonBot don't know that one try !commands. Ijjit.");
      break;
  }
};

export { handleRPGCommands };
