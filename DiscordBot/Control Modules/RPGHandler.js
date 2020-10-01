/**
 * Player related functions/stuff. Data structure / search / save/ load
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

  }
}); //readFile

 /***************************************
  *********       SAVING        *********
  ***************************************/
function checkForSaveFlags(){
  let saveSomething = false;
  playerList.forEach(element => {
    if(element.needsSaved){
      saveSomething = true;
      element.needsSaved = false;
    }
  });
  if(saveSomething){
    console.log("Saved player data");
    savePlayers();
  }
}
setInterval(checkForSaveFlags, 60000);

function savePlayers() {
  let tempIntervalArr = [];
  playerList.forEach(element => {
    //temporary fix timeout objects cant be saved definitely need a better solution
    tempIntervalArr.push(element.activityTimeout);
    element.activityTimeout = "";

  });


  
  fs.writeFile("./playerData.json", JSON.stringify(playerList), function (
    err
  ) {}) //TODO Fails if a member in the player class is a class(timeout from intervals causing but need to olve for inventory at some point)


  //temporary fix reload player objects and reassign any timeoutObjects. this way we avoid saving those:

playerList.forEach((element2,index) =>{
  element2.activityTimeout = tempIntervalArr[index];//relaceing value that couldnt be saved
});


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


    case "!current":
    case "!activity":
    case "!busy":
      player = checkForPlayer(message.author.tag, playerList);
      player.checkActivity(message);

      break;

    case "!snickers": {
      player = checkForPlayer(message.author.tag, playerList);

      player.eatSnickers(message);

      break; //snickers
    }

    case "!fish":
      player = checkForPlayer(message.author.tag, playerList);
      player.fish(message);
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
