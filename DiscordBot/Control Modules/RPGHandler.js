/**
 * Interface between commands fed to discord and the player data/ game functions
 * The core list of players containing high level player obj data is saved in this array here
 * Skill data etc is handled and saved independantly in the corresponding skill.js as a psuedo extension of the player class
 */
const Player = require("../player");
const fs = require("fs");

// Player Variables
let playerList = [];

 /***************************************
  *********    STARTUP LOAD     *********
  ***************************************/

//load players from file during startup
//ToDo implement restarting of long actions based on actionProgress
fs.readFile("./Save Files/playerData.json", function (errLoad, data) {
  //Doing it with the callback waits to ensure file loaded
  if (errLoad) {
  } else {
    loadList = JSON.parse(data); //data = stringify array
    loadList.forEach((element) => {
      playerList.push(new Player(element));
      // console.log(JSON.stringify(playerList[playerList.length-1]));//NOT stringifyig members added via assign to the prototype???!?!
    });
    console.log("Loaded players:" + playerList.length);

  }
}); //readFile

 /***************************************
  *********       SAVING        *********
  ***************************************/

const savePlayers = () => {
  
  fs.writeFile("./Save Files/playerData.json", JSON.stringify(playerList), function (
    err
  ) {}) //TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)

};


  //returns player or creates new and returns it
const checkForPlayer = (checkUser) => {//checking via the discord user obj incase we need to add a new player we will need access to all that info
  for (i = 0; i < playerList.length; i++) {
    if (playerList[i].playerID == checkUser.id) return playerList[i];
  }//found

  //Unfound, add new
   let playerToAdd = { playerID: checkUser.id, playerUsername:checkUser.username }; 

  playerList.push(new Player(playerToAdd));
  console.log(
    `New player added ${playerToAdd.id}, ${playerToAdd.username} playerList Index: ${playerList.length - 1}`
  );

    savePlayers();

  return playerList[playerList.length - 1];
};



const handleRPGCommands = (commandRead, commandModifier, message) => {
  let player;
  switch (commandRead) {
    

    case "!fish":
      player = checkForPlayer(message.author);
      player.fish(message);//Could just pass channel or channel + commandModifier?
      
      
      break;

    case "!hydrate":
      player = checkForPlayer(message.author);
      player.hydrate(message);//Could just pass channel or channel + commandModifier?
      savePlayers();
      
      break;
    
    default:
      return "unfound";
      break;
  }

};

module.exports = { handleRPGCommands, savePlayers };
