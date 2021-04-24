/**
 * Interface between commands fed to discord and the player data/ game functions
 * The core list of players containing high level player obj data is saved in this array here
 * Skill data etc is handled and saved independantly in the corresponding skill.js as a psuedo extension of the player class
 */
const Player = require("../player");
const fs = require("fs");

// Player Variables
const playerList = []; //Consider using on object not an array...

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
  ) {})

};


 /***************************************
  *********  Static Functions   *********
  ***************************************/

  //returns player or creates new and returns it
const checkForPlayer = (checkUser) => {//checking via the discord user obj incase we need to add a new player we will need access to all that info
  for (i = 0; i < playerList.length; i++) {
    if (playerList[i].playerID === checkUser.id) return playerList[i];
  }//found

  //Unfound, add new
   let playerToAdd = { playerID: checkUser.id, playerUsername:checkUser.username }; 

  playerList.push(new Player(playerToAdd));
  console.log(
    `New player added ${playerToAdd.id}, ${playerToAdd.username} playerList Index: ${playerList.length - 1}`
  );//not logging corectly says undefined?

    savePlayers();

  return playerList[playerList.length - 1];
};



const handleRPGCommands = (commandRead, commandModifier, message) => {
  let player;
  switch (commandRead) {
    case "!forcesave":
      player = checkForPlayer(message.author);
      if(player.username== 'Vorril#2467'){
        console.log('Vorril forcesave');
        for (i = 0; i < playerList.length; i++) {
          playerList[i].stopAll();
          
        }
        savePlayers();// Probably technically a race condition vs new inputs...
      }
    break;

    case "!fish":
      player = checkForPlayer(message.author);
      player.fish(message);//Could just pass channel or channel + commandModifier?
            
      break;

    case "!hydrate":
      player = checkForPlayer(message.author);
      player.hydrate(message);//Could just pass channel or channel + commandModifier?
      savePlayers();
      
      break;
    
    case "!chop":
      player = checkForPlayer(message.author);
      player.chop(message);

      break;

    case "!inv":
    case "!inventory":
      player = checkForPlayer(message.author);
      player.printInventory(message);

    break;

    case "!stats":
      player = checkForPlayer(message.author);
      player.printStats(message);
    break;

    case "!hiscores":
    case "!hiscore":
      let fish1 = ""; let fishLvl1 = -1;
      let fish2 = ""; let fishLvl2 = -1;
      let wc1 = ""; let wcLvl1 = -1;
      let wc2 = ""; let wcLvl2 = -1;

      for (i = 0; i < playerList.length; i++) {
        let stats = playerList[i].getLvls();
        
        if(stats.Woodcutting > wcLvl1){
          wc2 = wc1;
          wc1 = playerList[i].playerUsername;
        }
        else if(stats.Woodcutting > wcLvl2){
          wc2 = playerList[i].playerUsername;
        }

        if(stats.Fishing > fishLvl1){
          fish2 = wc1;
          fish1 = playerList[i].playerUsername;
        }
        else if(stats.Fishing > fishLvl2){
          fish2 = playerList[i].playerUsername;
        }

      }//for each player

      let scores = `Fishing 1st: ${fish1} Lvl: ${fishLvl1} :shark: \n Fishing 2nd: ${fish2} Lvl: ${fishLvl2}\n Woodcutting 1st ${wc1} Lvl: ${wcLvl1} :evergreen_tree: \n Woodcutting 2nd: ${wc2} Lvl: ${wcLvl2} \n`;

      message.channel.send(scores);
    break;
    
    default:
      return "unfound";
      break;
  }

};

module.exports = { handleRPGCommands, savePlayers };
