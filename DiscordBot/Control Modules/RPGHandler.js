/**
 * Interface between commands fed to discord and the player data/ game functions
 * The core list of players containing high level player obj data is saved in this array here
 * Skill data etc is handled and saved independantly in the corresponding skill.js as a psuedo extension of the player class
 */
const Player = require("../player");
const fs = require("fs");
const Bets = require("./betHandler.js")

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
      if(player.username == 'Vorril'){
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

      //let numPlayers = playerList.length;
      //for (i = 0; i < numPlayers; i++) {
      playerList.forEach((playerEle)=>{

        let stats = playerEle.getLvls();
        
        if(stats.Woodcutting > wcLvl1){
          wcLvl2 = wcLvl1;
          wcLvl1 = stats.Woodcutting;
          wc2 = wc1;
          wc1 = playerEle.playerUsername;
        }
        else if(stats.Woodcutting > wcLvl2){
          wcLvl2 = stats.Woodcutting;
          wc2 = playerEle.playerUsername;
        }

        if(stats.Fishing > fishLvl1){
          fishLvl2 = fishLvl1;
          fishLvl1 = stats.Fishing;
          fish2 = fish1;
          fish1 = playerEle.playerUsername;
        }
        else if(stats.Fishing > fishLvl2){
          fishLvl2 = stats.Fishing;
          fish2 = playerEle.playerUsername;
        }

      });//for each player

      let scores = `Fishing 1st: ${fish1} Lvl: ${fishLvl1} :shark: \n Fishing 2nd: ${fish2} Lvl: ${fishLvl2}\n Woodcutting 1st ${wc1} Lvl: ${wcLvl1} :evergreen_tree: \n Woodcutting 2nd: ${wc2} Lvl: ${wcLvl2} \n`;

      message.channel.send(scores);
     break;

    case "!points":
      player = checkForPlayer(message.author);
      player.printPoints(message);
      break;

    case "!bet":
      player = checkForPlayer(message.author);

      betStatus = "";
      betStatus += Bets.bet(player, commandModifier);

      message.channel.send(betStatus);
      break;

    case "!startbet":
    case "!newbet":
      player = checkForPlayer(message.author);

      betStatus = "";
      betStatus += Bets.startBet(message, player, commandModifier);

      message.channel.send(betStatus);
      break;

    case "!endbet":
      player = checkForPlayer(message.author);

      betStatus = "";
      betStatus += Bets.endBet(message, player, commandModifier);

      message.channel.send(betStatus);

      savePlayers();
      break;

    default:
      return "unfound";
      break;
  }

};

module.exports = { handleRPGCommands, savePlayers };
